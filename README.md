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

## Deployment

The dashboard (`src/` + `public/data/`) is a fully static build — it reads pre-generated JSON from
`public/data/dashboard_data/` at runtime and does not call the backend API. The `backend/` (Express +
MongoDB) service is a separate, optional API layer for consumers other than this dashboard.

### Docker

Three services are defined in `docker-compose.yml`: `frontend` (nginx serving the Vite build),
`backend` (Express API), and `mongo`.

```powershell
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend health check: http://localhost:5000/api/health
- MongoDB: localhost:27017

Rebuild the frontend image whenever `public/data/dashboard_data/` changes (i.e., after a pipeline run),
since the JSON is baked into the static bundle at build time:

```powershell
docker compose build frontend
docker compose up -d frontend
```

Backend environment variables (`MONGO_URI`, `PORT`) are set in `docker-compose.yml` for the containerized
setup. For a non-Docker backend run, copy `.env.example` to `backend/.env` and fill in `MONGO_URI`.

### Building images individually

```powershell
docker build -f Dockerfile.frontend -t lululemon-dashboard-frontend .
docker build -f Dockerfile.backend -t lululemon-dashboard-backend .
```

### Refreshing data in production

1. Run the pipeline (`python run_full_pipeline.py --mode incremental`) wherever it has network access to
   the review source.
2. Commit/copy the updated `public/data/dashboard_data/*.json`.
3. Rebuild and redeploy the `frontend` image (or `npm run build` + redeploy `dist/` to any static host —
   Netlify, S3 + CloudFront, GitHub Pages, etc. all work since there's no server-side rendering).

## Notes

- The Python pipeline implementation was moved into `pipeline/` to keep the repo root clean.
- `run_full_pipeline.py` and `run_export.py` remain at the root as compatibility wrappers.
- The dashboard reads its runtime JSON from `public/data/dashboard_data/`.
- The pipeline writes processed outputs to `data/processed/` and mirrors dashboard JSON into `public/data/dashboard_data/`.
