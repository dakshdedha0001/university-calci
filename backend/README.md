# University Calci — FastAPI Backend

## Structure

```
backend/
  app/
    main.py              # FastAPI entry
    core/                # config, dependencies
    db/                  # SQLAlchemy session
    models/              # PostgreSQL models
    schemas/             # Pydantic request/response
    domain/              # Wrappers around root *.py logic
    services/            # Persistence helpers
    api/v1/              # Route handlers
  requirements.txt
  .env.example
```

Root Python engines (unchanged):

- `attendance_calculator.py` — bunk budget, semester-end 75% target
- `academic_pms.py` — SGPA/CGPA, improvements, target planner, predictions

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with Supabase DATABASE_URL and SECRET_KEY
```

Apply schema in Supabase SQL Editor: `supabase/migrations/20250601000000_initial_schema.sql`

## Run

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Health: `GET http://localhost:8000/health`
- Docs: `http://localhost:8000/docs`

## API (v1)

| Method | Path |
|--------|------|
| POST | `/api/v1/attendance/calculate` |
| GET/POST | `/api/v1/attendance/subjects` |
| POST | `/api/v1/academic/sgpa/calculate` |
| GET | `/api/v1/academic/cgpa` |
| POST | `/api/v1/academic/semesters` |
| GET | `/api/v1/academic/improvements` |
| POST | `/api/v1/academic/target-cgpa` |
| POST | `/api/v1/academic/predict` |
| GET/PATCH | `/api/v1/profile` |

All routes use a single shared guest profile (no login).
