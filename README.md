# lululemon Review Intelligence Dashboard

This repo is now organized around three clearly separated areas:

- `src/` and `public/` for the React dashboard
- `pipeline/` for the Python review-processing workflow
- `backend/` for the MongoDB + Express API

## Project structure

```text
.
├── backend/                  # Express + MongoDB API
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   └── server.js
├── data/                     # Pipeline input, raw output, processed output, images
│   ├── input/
│   ├── raw/
│   ├── processed/
│   └── images/
├── pipeline/                 # Python pipeline implementation
│   ├── __init__.py
│   ├── pipeline_common.py
│   ├── multi_product_reviews_scraper.py
│   ├── low_star_processor.py
│   ├── complaint_classifier.py
│   ├── multi_product_image_mapper.py
│   ├── summary_generator.py
│   ├── dashboard_exporter.py
│   ├── run_export.py
│   └── run_full_pipeline.py
├── public/
│   ├── data/
│   │   └── dashboard_data/   # Frontend-served JSON from the pipeline
│   └── lululemon-logo.png
├── src/                      # React frontend
│   ├── components/
│   │   ├── charts/
│   │   ├── filters/
│   │   ├── gallery/
│   │   ├── layout/
│   │   ├── primitives/
│   │   └── search/
│   ├── context/
│   ├── data/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
├── run_export.py             # Thin root wrapper for legacy command
├── run_full_pipeline.py      # Thin root wrapper for main pipeline command
├── package.json
└── vite.config.js
```

## Frontend routes

- `/analytics`
- `/reviews`
- `/gallery`

`/` redirects to `/analytics`.

## Pipeline data flow

```text
data/
├── input/
│   └── products.csv
├── raw/
│   └── product_raw_json/
├── processed/
│   ├── all_reviews.csv
│   ├── all_reviews.json
│   ├── low_star_reviews.csv
│   ├── product_rating_distribution.csv
│   ├── review_images_mapping.csv
│   ├── category_summary.csv
│   ├── product_summary.csv
│   └── dashboard_data/
│       ├── reviews.json
│       ├── images.json
│       ├── category.json
│       ├── products.json
│       └── productSummary.json
└── images/
    └── {product_id}/
        ├── 1_star/
        ├── 2_star/
        └── 3_star/
```

## Commands

### Frontend

```powershell
npm install
npm run dev
npm run build
```

### Pipeline

Main command:

```powershell
python run_full_pipeline.py
```

Direct module execution also works:

```powershell
python -m pipeline.run_full_pipeline
```

Legacy export helper:

```powershell
python run_export.py
```

### Backend

```powershell
cd backend
npm install
node scripts/importPipelineData.js
npm run dev
```

## Notes

- The Python pipeline implementation was moved into `pipeline/` to keep the repo root clean.
- `run_full_pipeline.py` and `run_export.py` remain at the root as compatibility wrappers.
- The dashboard reads its runtime JSON from `public/data/dashboard_data/`.
- The pipeline writes processed outputs to `data/processed/` and mirrors dashboard JSON into `public/data/dashboard_data/`.
