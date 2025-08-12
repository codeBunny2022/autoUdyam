# autoUdyam

A responsive UI for the first two steps of Udyam registration (Aadhaar + OTP, PAN) with validation, storage, and scraping helpers.

## Stack
- Frontend: Next.js + TypeScript
- Backend: Express + TypeScript + Zod
- Database: Prisma (SQLite by default)
- Scraping: Cheerio (HTML parsing)
- Tests: Jest (validators + API)
- Docker: Dockerfiles + docker-compose

## Run locally
### Backend
```
cd backend
npm i
npx prisma migrate dev
npm run dev
```
- Base URL: http://localhost:4000
- API: `/api/schema`, `/api/pin/:pinCode`, `/api/otp/send`, `/api/validate/step1`, `/api/validate/step2`, `/api/submit`
- Tests: `npm test`
- Scrape raw fields: `npm run scrape` → `backend/schemas/udyam_step1_2_raw.json`

### Frontend
```
cd frontend
npm i
echo "NEXT_PUBLIC_API_BASE=http://localhost:4000/api" > .env.local
npm run dev
```
- App: http://localhost:3000

## Features
- Two-step form (Aadhaar & OTP, PAN) rendered from server schema
- Live validation using backend endpoints
- “Get OTP” button on mobile number field (dummy OTP `123456`, shown as alert and auto-filled)
- PIN → State/City auto-fill via backend proxy
- Responsive/mobile-first UI

## Docker
```
# From project root
docker compose up --build
```
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Notes
- OTP is simulated only (123456).
- To use PostgreSQL, set `DATABASE_URL` accordingly and update Prisma schema/migrations.

## Data storage and management
- Location (local dev): SQLite file at `backend/dev.db` (from `DATABASE_URL=file:./dev.db`).

- Prisma Studio (view/edit/delete):
```
cd backend
npx prisma studio
```
Open the browser link, select `Registration`, manage rows.

- SQLite CLI (view/delete):
```
cd backend
sqlite3 dev.db
.tables
SELECT * FROM Registration;
DELETE FROM Registration WHERE id='PUT_ID_HERE';
-- wipe all
DELETE FROM Registration;
.quit
```

- Reset database (wipe and re-init):
```
rm backend/dev.db
cd backend && npx prisma migrate dev
```

- With Docker Compose:
  - DB is inside the backend container at `/app/dev.db`.
  - Inspect:
```
docker compose exec backend sh
sqlite3 dev.db
```
  - For persistence, mount a volume/bind the file or switch to Postgres and set `DATABASE_URL` accordingly.


