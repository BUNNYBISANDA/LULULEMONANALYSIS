from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from pipeline.pipeline_common import (
    LOW_STAR_REVIEWS_CSV,
    MASTER_DEFECT_CSV,
    REVIEW_FIELDNAMES,
    clean_text,
    ensure_pipeline_dirs,
    log,
    read_csv_rows,
    write_csv_rows,
)

DEFAULT_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
# Lower than the old per-code threshold (0.45): each of the 6 category documents
# is now a long blob combining every DEFECT_DESC_ENG row in that group, which
# dilutes embedding similarity well below what a single short reference phrase
# scored. Calibrated against data/processed/low_star_reviews.csv so genuine
# non-defect reviews (restocking, cancelled orders, ~0.11-0.17) fall below the
# threshold while loosely-worded defect mentions (~0.22+) clear it.
DEFAULT_THRESHOLD = 0.22

UNCLASSIFIED = "Unclassified"

_model_cache: dict[str, Any] = {}
_category_cache: dict[Path, "list[CategoryDocument]"] = {}


@dataclass(frozen=True)
class CategoryDocument:
    group_code: str
    group_desc: str
    knowledge_text: str


def get_model(model_name: str = DEFAULT_MODEL_NAME):
    """Lazily load and cache the sentence-transformers model."""
    if model_name not in _model_cache:
        from sentence_transformers import SentenceTransformer

        log(f"Loading semantic model '{model_name}' (cached after first download)...")
        _model_cache[model_name] = SentenceTransformer(model_name)
    return _model_cache[model_name]


def load_category_documents(path: Path = MASTER_DEFECT_CSV) -> list[CategoryDocument]:
    """Group master_defect.csv rows by GRP_DESC_ENG and combine each group's
    DEFECT_DESC_ENG rows into a single knowledge document per official category.
    """
    if path in _category_cache:
        return _category_cache[path]

    rows = read_csv_rows(path)
    groups: dict[str, dict[str, Any]] = {}
    order: list[str] = []
    for row in rows:
        desc = clean_text(row.get("DEFECT_DESC_ENG"))
        group_desc = clean_text(row.get("GRP_DESC_ENG"))
        group_code = clean_text(row.get("DEFECT_GRP_CODE"))
        if not desc or not group_desc:
            continue
        if group_desc not in groups:
            groups[group_desc] = {"group_code": group_code, "descs": []}
            order.append(group_desc)
        groups[group_desc]["descs"].append(desc)

    if not groups:
        raise ValueError(f"No usable defect rows found in {path}")

    documents = [
        CategoryDocument(
            group_code=groups[group_desc]["group_code"],
            group_desc=group_desc,
            knowledge_text=f"{group_desc}: " + ". ".join(groups[group_desc]["descs"]),
        )
        for group_desc in order
    ]

    _category_cache[path] = documents
    return documents


def combine_review_text(row: dict[str, Any]) -> str:
    title = clean_text(row.get("title") or row.get("review_title"))
    body = clean_text(row.get("review_text"))
    return ". ".join(part for part in (title, body) if part)


def embed_texts(model, texts: list[str]) -> np.ndarray:
    if not texts:
        return np.zeros((0, model.get_sentence_embedding_dimension()))
    return model.encode(
        texts,
        batch_size=64,
        show_progress_bar=False,
        normalize_embeddings=True,
        convert_to_numpy=True,
    )


def classify_match(
    *,
    best_score: float,
    best_category: CategoryDocument | None,
    threshold: float,
) -> dict[str, Any]:
    """Assign a review directly to one of the 6 official defect groups, or
    Unclassified when no category clears the similarity threshold."""
    rounded_score = round(float(best_score), 4)

    if best_category is not None and best_score >= threshold:
        return {
            "matched_defect_code": "",
            "matched_defect_desc": "",
            "matched_defect_group_code": best_category.group_code,
            "matched_defect_group": best_category.group_desc,
            "similarity_score": rounded_score,
            "semantic_match_method": "sentence_transformer",
            "operation_related": True,
            "confidence_score": rounded_score,
        }

    return {
        "matched_defect_code": "",
        "matched_defect_desc": "",
        "matched_defect_group_code": "",
        "matched_defect_group": UNCLASSIFIED,
        "similarity_score": rounded_score,
        "semantic_match_method": "unclassified",
        "operation_related": False,
        "confidence_score": rounded_score,
    }


def match_reviews_to_defects(
    rows: list[dict[str, Any]],
    *,
    threshold: float = DEFAULT_THRESHOLD,
    model_name: str = DEFAULT_MODEL_NAME,
) -> list[dict[str, Any]]:
    """Batch-classify guest reviews directly into the 6 official defect groups.

    Each group's DEFECT_DESC_ENG rows are combined into a single knowledge
    document and embedded once (6 embeddings total). Every review's
    title + body embedding is compared against those 6 category embeddings
    via cosine similarity and assigned to the highest-scoring group, or
    Unclassified when the best score falls below threshold.
    """
    if not rows:
        return []

    categories = load_category_documents()
    model = get_model(model_name)

    category_embeddings = embed_texts(model, [doc.knowledge_text for doc in categories])
    review_texts = [combine_review_text(row) for row in rows]
    non_empty_indices = [index for index, text in enumerate(review_texts) if text]
    review_embeddings = embed_texts(model, [review_texts[index] for index in non_empty_indices])

    similarity_by_index: dict[int, np.ndarray] = {}
    if non_empty_indices and category_embeddings.shape[0]:
        similarity_matrix = cosine_similarity(review_embeddings, category_embeddings)
        for position, row_index in enumerate(non_empty_indices):
            similarity_by_index[row_index] = similarity_matrix[position]

    results: list[dict[str, Any]] = []
    for index, row in enumerate(rows):
        scores = similarity_by_index.get(index)
        if scores is None:
            results.append(classify_match(best_score=0.0, best_category=None, threshold=threshold))
            continue

        best_index = int(np.argmax(scores))
        results.append(
            classify_match(
                best_score=float(scores[best_index]),
                best_category=categories[best_index],
                threshold=threshold,
            )
        )

    return results


def main() -> int:
    ensure_pipeline_dirs()
    rows = read_csv_rows(LOW_STAR_REVIEWS_CSV)
    if not rows:
        log("semantic_defect_matcher: no low-star reviews found; skipping.")
        return 0

    log(
        f"semantic_defect_matcher: matching {len(rows)} reviews against the 6 "
        f"official defect groups in {MASTER_DEFECT_CSV.name}..."
    )
    matches = match_reviews_to_defects(rows)
    for row, match in zip(rows, matches):
        row.update(match)

    write_csv_rows(LOW_STAR_REVIEWS_CSV, rows, REVIEW_FIELDNAMES)

    matched = sum(1 for match in matches if match["semantic_match_method"] == "sentence_transformer")
    unclassified = sum(1 for match in matches if match["semantic_match_method"] == "unclassified")
    log(f"semantic_defect_matcher: {matched} matched to official groups, {unclassified} unclassified.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
