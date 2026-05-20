from __future__ import annotations

from collections import Counter, defaultdict

from pipeline.pipeline_common import (
    ALL_REVIEWS_CSV,
    LOW_STAR_RATINGS,
    LOW_STAR_REVIEWS_CSV,
    PRODUCT_RATING_DISTRIBUTION_CSV,
    REVIEW_FIELDNAMES,
    ensure_pipeline_dirs,
    read_csv_rows,
    safe_int,
    write_csv_rows,
)


def build_product_rating_distribution(rows: list[dict[str, str]]) -> list[dict[str, int | str]]:
    counts: dict[tuple[str, str, str], Counter[int]] = defaultdict(Counter)
    totals: dict[tuple[str, str, str], int] = defaultdict(int)

    for row in rows:
        key = (row.get("product_name", ""), row.get("product_id", ""), row.get("category", ""))
        rating = safe_int(row.get("rating"))
        counts[key][rating] += 1
        totals[key] += 1

    output: list[dict[str, int | str]] = []
    for (product_name, product_id, category), rating_counts in sorted(counts.items()):
        output.append(
            {
                "product_name": product_name,
                "product_id": product_id,
                "category": category,
                "total_reviews": totals[(product_name, product_id, category)],
                "one_star_reviews": rating_counts[1],
                "two_star_reviews": rating_counts[2],
                "three_star_reviews": rating_counts[3],
                "four_star_reviews": rating_counts[4],
                "five_star_reviews": rating_counts[5],
                "low_star_reviews": rating_counts[1] + rating_counts[2] + rating_counts[3],
            }
        )
    return output


def main() -> int:
    ensure_pipeline_dirs()
    rows = read_csv_rows(ALL_REVIEWS_CSV)
    low_star_rows = [row for row in rows if safe_int(row.get("rating")) in LOW_STAR_RATINGS]
    write_csv_rows(LOW_STAR_REVIEWS_CSV, low_star_rows, REVIEW_FIELDNAMES)

    rating_distribution = build_product_rating_distribution(rows)
    write_csv_rows(
        PRODUCT_RATING_DISTRIBUTION_CSV,
        rating_distribution,
        [
            "product_name",
            "product_id",
            "category",
            "total_reviews",
            "one_star_reviews",
            "two_star_reviews",
            "three_star_reviews",
            "four_star_reviews",
            "five_star_reviews",
            "low_star_reviews",
        ],
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
