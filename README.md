This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## About DataMerge Pro

DataMerge Pro is a lightweight prototype for automating dataset harmonization. Upload two data bundles (CSV/Excel) plus optional schema documents; the backend uses AI-assisted mapping to suggest table/field mappings, merges the datasets, and produces downloadable merged outputs and a PDF mapping document for audit and review.

This repo contains the Next.js frontend and the companion FastAPI backend (in `py-backend/`) used to run merges and generate PDF documentation.

## Run locally (frontend + backend)

Prerequisites:
- Node.js (v16+ recommended)
- Python 3.9+ (for the FastAPI backend)

1) Install frontend deps and run dev server

```bash
npm install
npm run dev
```

2) Backend (basic local start)

If this project includes the backend folder `py-backend/` (FastAPI):

```bash
# create and activate a virtualenv
python -m venv .venv
source .venv/bin/activate
cd py-backend
pip install -r requirements.txt
python main.py
```

Notes:
- The backend may require API keys for any AI services (set as environment variables on your system or in a .env file) something like this:

```dotenv
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key

# Optional: Model Configuration
GEMINI_MODEL=gemini-flash-latest

# Optional: Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Optional: CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

```