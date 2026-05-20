from __future__ import annotations

from pipeline.complaint_classifier import main as classifier_main
from pipeline.dashboard_exporter import main as exporter_main
from pipeline.low_star_processor import main as low_star_main
from pipeline.multi_product_image_mapper import main as image_mapper_main
from pipeline.multi_product_reviews_scraper import main as scraper_main
from pipeline.pipeline_common import ensure_pipeline_dirs, log
from pipeline.summary_generator import main as summary_main


def main() -> int:
    ensure_pipeline_dirs()

    steps = [
        ("multi_product_reviews_scraper", scraper_main),
        ("low_star_processor", low_star_main),
        ("complaint_classifier", classifier_main),
        ("multi_product_image_mapper", image_mapper_main),
        ("summary_generator", summary_main),
        ("dashboard_exporter", exporter_main),
    ]

    for name, func in steps:
        log(f"Running {name}")
        exit_code = func()
        if exit_code not in (0, None):
            raise SystemExit(f"{name} failed with exit code {exit_code}")

    log("Full multi-product review pipeline completed successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
