# University Calci

Academic performance app: attendance, SGPA/CGPA, improvement planning.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React, TanStack Router, Vite → **Vercel** |
| Backend | FastAPI → **Railway** |
| Database | PostgreSQL → **Supabase** |

## Local development

### 1. Database (Supabase)

Run `supabase/migrations/20250601000000_initial_schema.sql` in the Supabase SQL editor.

### 2. Backend

```bash
cd backend
cp .env.example .env
# DATABASE_URL, SECRET_KEY
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH="$(pwd):$(pwd)/.." uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cp .env.example .env
# VITE_API_URL=http://localhost:8000
bun install
bun run dev
```

Open the app at `/app/dashboard` (no login required).

## Deployment

### Railway (API)
- Root repo → uses `railway.toml` + `backend/Dockerfile`
- Env: `DATABASE_URL`, `SECRET_KEY`, `ENVIRONMENT=production`, `DEBUG=false`, `CORS_ORIGINS=https://your-app.vercel.app`

### Vercel (UI)
- Env: `VITE_API_URL=https://your-api.up.railway.app`
- Build: `npm run build` (Nitro `vercel` preset → `.vercel/output`, see `vercel.json`)
- In the Vercel dashboard, set **Output Directory** to `.vercel/output` (or rely on `vercel.json`)

### Supabase
- Run migration SQL once; use **Session pooler** connection string for `DATABASE_URL`
