from __future__ import annotations

from pipeline.pipeline_common import (
    CATEGORY_SUMMARY_CSV,
    DASHBOARD_DATA_DIR,
    LOW_STAR_REVIEWS_CSV,
    PRODUCT_SUMMARY_CSV,
    PRODUCTS_CSV,
    PUBLIC_DASHBOARD_DATA_DIR,
    REVIEW_IMAGES_MAPPING_CSV,
    ensure_pipeline_dirs,
    read_csv_rows,
    read_products,
    safe_float,
    safe_int,
    write_json,
)


def coerce_review_rows(rows: list[dict[str, str]]) -> list[dict[str, object]]:
    output: list[dict[str, object]] = []
    for row in rows:
        output.append(
            {
                **row,
                "rating": safe_int(row.get("rating")),
                "likes": safe_int(row.get("likes")),
                "photo_count": safe_int(row.get("photo_count")),
                "total_comments": safe_int(row.get("total_comments")),
                "is_staff": str(row.get("is_staff", "")).lower() == "true",
                "is_verified_buyer": str(row.get("is_verified_buyer", "")).lower() == "true",
            }
        )
    return output


def coerce_image_rows(rows: list[dict[str, str]]) -> list[dict[str, object]]:
    output: list[dict[str, object]] = []
    for row in rows:
        output.append(
            {
                **row,
                "rating": safe_int(row.get("rating")),
                "photo_number": safe_int(row.get("photo_number")),
                "helpful_votes": safe_int(row.get("helpful_votes")),
                "verified_buyer": str(row.get("verified_buyer", "")).lower() == "true",
            }
        )
    return output


def coerce_category_rows(rows: list[dict[str, str]]) -> list[dict[str, object]]:
    output: list[dict[str, object]] = []
    for row in rows:
        output.append(
            {
                **row,
                "total_reviews": safe_int(row.get("total_reviews")),
                "one_star": safe_int(row.get("one_star")),
                "two_star": safe_int(row.get("two_star")),
                "three_star": safe_int(row.get("three_star")),
                "share_percentage": safe_float(row.get("share_percentage")),
            }
        )
    return output


def coerce_product_summary_rows(rows: list[dict[str, str]]) -> list[dict[str, object]]:
    numeric_keys = {
        "total_reviews",
        "low_star_reviews",
        "one_star_reviews",
        "two_star_reviews",
        "three_star_reviews",
        "reviews_with_images",
        "total_images",
    }
    float_keys = {"average_rating", "top_complaint_share"}
    output: list[dict[str, object]] = []
    for row in rows:
        record: dict[str, object] = dict(row)
        for key in numeric_keys:
            record[key] = safe_int(row.get(key))
        for key in float_keys:
            record[key] = safe_float(row.get(key))
        output.append(record)
    return output


def main() -> int:
    ensure_pipeline_dirs()
    products = read_products(PRODUCTS_CSV)
    reviews = coerce_review_rows(read_csv_rows(LOW_STAR_REVIEWS_CSV))
    images = coerce_image_rows(read_csv_rows(REVIEW_IMAGES_MAPPING_CSV))
    categories = coerce_category_rows(read_csv_rows(CATEGORY_SUMMARY_CSV))
    product_summary = coerce_product_summary_rows(read_csv_rows(PRODUCT_SUMMARY_CSV))

    for target_dir in (DASHBOARD_DATA_DIR, PUBLIC_DASHBOARD_DATA_DIR):
        write_json(target_dir / "products.json", products)
        write_json(target_dir / "reviews.json", reviews)
        write_json(target_dir / "images.json", images)
        write_json(target_dir / "category.json", categories)
        write_json(target_dir / "productSummary.json", product_summary)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
