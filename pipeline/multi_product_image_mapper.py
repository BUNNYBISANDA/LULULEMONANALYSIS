from __future__ import annotations

import argparse
from pathlib import Path

from pipeline.pipeline_common import (
    DEFAULT_DELAY_SECONDS,
    DEFAULT_TIMEOUT_SECONDS,
    IMAGE_MAPPING_FIELDNAMES,
    LOW_STAR_RATINGS,
    LOW_STAR_REVIEWS_CSV,
    REVIEW_IMAGES_MAPPING_CSV,
    build_session,
    clean_text,
    ensure_pipeline_dirs,
    image_folder_for,
    infer_file_extension,
    log,
    normalize_bool,
    read_csv_rows,
    safe_int,
    sanitize_filename,
    split_serialized_list,
    write_csv_rows,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Download and map low-star review images.")
    parser.add_argument("--delay", type=float, default=DEFAULT_DELAY_SECONDS)
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT_SECONDS)
    return parser.parse_args()


def download_review_image(
    *,
    session,
    image_url: str,
    destination: Path,
    timeout: int,
):
    if destination.exists():
        return
    response = session.get(image_url, timeout=timeout)
    response.raise_for_status()
    destination.write_bytes(response.content)


def main() -> int:
    args = parse_args()
    ensure_pipeline_dirs()
    rows = read_csv_rows(LOW_STAR_REVIEWS_CSV)
    session = build_session()
    mapping_rows: list[dict[str, object]] = []

    for row in rows:
        rating = safe_int(row.get("rating"))
        if rating not in LOW_STAR_RATINGS:
            continue

        photo_urls = split_serialized_list(row.get("photo_urls"))
        photo_ids = split_serialized_list(row.get("photo_ids"))
        if not photo_urls:
            continue

        product_id = clean_text(row.get("product_id"))
        review_id = clean_text(row.get("review_id"))
        target_dir = image_folder_for(product_id, rating)
        target_dir.mkdir(parents=True, exist_ok=True)

        for index, image_url in enumerate(photo_urls, start=1):
            photo_id = photo_ids[index - 1] if index - 1 < len(photo_ids) else f"photo_{index}"
            extension = infer_file_extension(image_url)
            file_name = (
                f"{sanitize_filename(review_id)}_{sanitize_filename(photo_id)}{extension}"
            )
            destination = target_dir / file_name

            try:
                download_review_image(
                    session=session,
                    image_url=image_url,
                    destination=destination,
                    timeout=max(args.timeout, 1),
                )
            except Exception as exc:  # noqa: BLE001
                log(f"Image download failed for {review_id} {photo_id}: {exc}")
                continue

            mapping_rows.append(
                {
                    "product_name": row.get("product_name", ""),
                    "product_id": product_id,
                    "productNameId": row.get("productNameId", ""),
                    "product_url": row.get("product_url", ""),
                    "category": row.get("category", ""),
                    "review_id": review_id,
                    "rating": rating,
                    "review_date": row.get("submission_time", ""),
                    "review_title": row.get("title", ""),
                    "review_text": row.get("review_text", ""),
                    "complaint_theme": row.get("complaint_theme", ""),
                    "business_insight": row.get("business_insight", ""),
                    "photo_id": photo_id,
                    "photo_number": index,
                    "image_url": image_url,
                    "local_image_path": str(destination.resolve()),
                    "verified_buyer": normalize_bool(row.get("is_verified_buyer")),
                    "helpful_votes": safe_int(row.get("likes")),
                    "size_purchased": row.get("size_purchased", ""),
                    "fit_feedback": row.get("fit_feedback", ""),
                }
            )

    write_csv_rows(REVIEW_IMAGES_MAPPING_CSV, mapping_rows, IMAGE_MAPPING_FIELDNAMES)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
