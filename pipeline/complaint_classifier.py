from __future__ import annotations

from pipeline.pipeline_common import (
    LOW_STAR_REVIEWS_CSV,
    REVIEW_FIELDNAMES,
    business_insight_for_theme,
    classify_complaint_theme,
    ensure_pipeline_dirs,
    read_csv_rows,
    write_csv_rows,
)


def main() -> int:
    ensure_pipeline_dirs()
    rows = read_csv_rows(LOW_STAR_REVIEWS_CSV)

    for row in rows:
        theme = classify_complaint_theme(
            row.get("title", ""),
            row.get("review_text", ""),
            row.get("fit_feedback", ""),
        )
        row["complaint_theme"] = theme
        row["business_insight"] = business_insight_for_theme(theme)

    write_csv_rows(LOW_STAR_REVIEWS_CSV, rows, REVIEW_FIELDNAMES)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
