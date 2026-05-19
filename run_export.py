import json
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = Path(
    r"c:\Users\hiruk\OneDrive\Desktop\lululemon\lululemon-review-scraper\output"
)
IMAGES_WORKBOOK = OUTPUT_DIR / "lululemon_define_jacket_1_2_3_star_review_images.xlsx"
LOW_REVIEWS_WORKBOOK = OUTPUT_DIR / "lululemon_define_jacket_low_reviews.xlsx"
DATA_DIR = BASE_DIR / "src" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)


def normalize_frame(df: pd.DataFrame) -> pd.DataFrame:
    return df.astype(object).where(pd.notnull(df), None)

# ── Image Mapping ──────────────────────────────────────────────
df = pd.read_excel(
    IMAGES_WORKBOOK,
    sheet_name="Image Mapping",
)
df = df[df["image_exists"] == True].copy()
df["review_date"] = df["review_date"].astype(str)
df = normalize_frame(df)

images = df[
    [
        "rating",
        "review_id",
        "review_date",
        "review_title",
        "review_text",
        "complaint_theme",
        "business_insight",
        "photo_number",
        "image_url",
        "size_purchased",
        "fit_feedback",
        "verified_buyer",
        "helpful_votes",
    ]
].to_dict(orient="records")

with open(DATA_DIR / "images.json", "w", encoding="utf-8") as f:
    json.dump(images, f, ensure_ascii=False, indent=2, default=str, allow_nan=False)

print(f"Exported {len(images)} image records")

# ── Reviews With Images (grouped) ──────────────────────────────
df2 = pd.read_excel(
    IMAGES_WORKBOOK,
    sheet_name="Reviews With Images",
)
df2["review_date"] = df2["review_date"].astype(str)


def parse_urls(s):
    if pd.isna(s):
        return []
    return [u.strip() for u in str(s).split(";") if u.strip()]


df2["photo_urls"] = df2["photo_urls"].apply(parse_urls)
df2.drop(columns=["downloaded_image_paths"], inplace=True)
df2 = normalize_frame(df2)
reviews_with_images = df2.to_dict(orient="records")

with open(DATA_DIR / "reviewsWithImages.json", "w", encoding="utf-8") as f:
    json.dump(
        reviews_with_images,
        f,
        ensure_ascii=False,
        indent=2,
        default=str,
        allow_nan=False,
    )

print(f"Exported {len(reviews_with_images)} reviews with images")

# ── Full Low-Star Reviews ──────────────────────────────────────
df3 = pd.read_excel(LOW_REVIEWS_WORKBOOK)
df3["review_date"] = df3["review_date"].astype(str)
df3["scraped_at"] = df3["scraped_at"].astype(str)
df3 = normalize_frame(df3)
reviews = df3.to_dict(orient="records")

with open(DATA_DIR / "reviews.json", "w", encoding="utf-8") as f:
    json.dump(reviews, f, ensure_ascii=False, indent=2, default=str, allow_nan=False)

print(f"Exported {len(reviews)} reviews")

# ── Category Summary ───────────────────────────────────────────
df4 = pd.read_excel(
    IMAGES_WORKBOOK,
    sheet_name="Complaint Category Summary",
)
df4 = normalize_frame(df4)
cats = df4.to_dict(orient="records")

with open(DATA_DIR / "categorySummary.json", "w", encoding="utf-8") as f:
    json.dump(cats, f, ensure_ascii=False, indent=2, allow_nan=False)

print(f"Exported {len(cats)} categories")
