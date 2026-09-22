# Bengaluru Friends (R) — Website

A full-stack, CMS-driven website for Bengaluru Friends Sports & Cultural Association,
built with Next.js, TypeScript, Tailwind, PostgreSQL and Prisma.

Every section on the public site — About, Founders, Achievements, Tournaments, the
Sri Lanka story, Winner Gallery, Videos, Legends, Current Squad, Events, News, Social
links, Contact details, and homepage stats — is editable from `/admin/dashboard`.
Nothing requires touching code.

---

## Requirements

- **Docker Desktop** (recommended — this covers Postgres and Node for you), **or**
- Node.js 20 LTS + a PostgreSQL database, if you'd rather run it without Docker

---

## Option A — Run with Docker (recommended)

1. Copy the environment template:
   ```
   copy .env.example .env
   ```
   (On Mac/Linux: `cp .env.example .env`)

2. Open `.env` and fill in real values for:
   - `POSTGRES_PASSWORD` — any password you choose
   - `DATABASE_URL` — update the password to match what you just set
   - `AUTH_SECRET` — any long random string
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — your real admin login

   Instagram and YouTube are already pre-filled with the club's real pages in
   `prisma/seed.ts`. Facebook and WhatsApp are left blank until you provide them.

3. Build and start everything:
   ```
   docker compose up --build
   ```

   **Expected result:** Postgres starts, then the app waits for it, runs migrations,
   seeds the database, and finally prints:
   ```
   Starting Next.js...
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   ```

4. Open **http://localhost:3000** — the full public site.
5. Open **http://localhost:3000/admin/login** — log in with `SEED_ADMIN_EMAIL` /
   `SEED_ADMIN_PASSWORD` from your `.env`.

**Everyday use after today:** just `docker compose up` (no `--build` needed unless
you changed code). Stop with `Ctrl + C`, then `docker compose down`.

Your database and uploaded photos persist across restarts and rebuilds — they live
in a Docker volume (`db-data`) and in `./public/uploads` on your machine, not inside
the container.

---

## Option B — Run without Docker

1. Install Node.js 20 LTS from https://nodejs.org
2. Set up a PostgreSQL database (locally installed, or a free cloud one — see
   `DEPLOYMENT.md` for cloud options)
3. Copy and fill in `.env` as in step 1–2 above, pointing `DATABASE_URL` at your
   Postgres instance
4. Install dependencies:
   ```
   npm install
   ```
5. Create the database tables:
   ```
   npm run prisma:migrate
   ```
6. Seed the admin account and default content:
   ```
   npm run seed
   ```
7. Start the dev server:
   ```
   npm run dev
   ```
8. Open http://localhost:3000

---

## Admin dashboard

Log in at `/admin/login`. The sidebar covers:

| Section | What it manages |
|---|---|
| Dashboard | Overview counts |
| About / Site Settings | Hero tagline, quote banner, about text, contact details, homepage stats |
| Founder / Owners | Leadership profiles (photo, name, designation, bio, message) |
| Achievements | Trophy cards with photos |
| Tournaments | Tournaments organized, with poster, winner/runner-up, status |
| Sri Lanka Story | The historic-chapter timeline, with photos/documents |
| Winner Gallery | Photo albums — create an album, bulk-upload photos into it |
| Videos | YouTube embeds by category |
| Old Players | "Legends" — former players |
| Present Players | Current squad |
| Events | Upcoming events list |
| News | Latest news posts |
| Social Media | Instagram / Facebook / YouTube / WhatsApp URLs — blank hides the icon |
| Contact Messages | Read-only view of contact form submissions |

Every list supports **create, edit, delete**, and (where order matters) **↑ / ↓
reorder buttons**. Images upload through a shared uploader that validates file
type and size, generates a safe filename, and stores the file according to
`STORAGE_DRIVER` in `.env` (see `lib/storage.ts`).

---

## Project structure

```
app/                    Pages and API routes (Next.js App Router)
  admin/                 /admin/login, /admin/dashboard/* (protected)
  api/                   Public + admin API routes
  gallery/                Public gallery page
components/
  site/                  Public-facing sections (Hero, Navbar, Footer, etc.)
  admin/                 Admin forms, image uploader, dashboard shell
lib/
  db.ts                  Prisma client
  auth.ts                 Password hashing + session cookies
  storage.ts               Upload abstraction (local / cloud)
prisma/
  schema.prisma           All 17 data models
  seed.ts                  Seeds admin account + default content
public/
  images/                 Real brand assets (logo, archive photos)
  uploads/                 Local file storage (Docker volume)
Dockerfile, docker-compose.yml, docker-entrypoint.sh
.env.example
DEPLOYMENT.md              Vercel + cloud database + cloud storage guide
```

---

## Building for production (without Docker)

```
npm run build
npm start
```

For actually deploying the site publicly, see **DEPLOYMENT.md** — Vercel hosts the
app, but needs an external Postgres database and (recommended) cloud image storage,
since Vercel's filesystem isn't persistent.

---

## Troubleshooting

- **`docker compose up` fails on the database step** → wait a few seconds and it
  will retry automatically (up to 10 times); if it still fails, check `POSTGRES_*`
  values match between `.env` and what you expect
- **Can't log in to `/admin/login`** → double check `SEED_ADMIN_EMAIL` /
  `SEED_ADMIN_PASSWORD` in `.env`, then `docker compose up --build` again — the
  seed step re-runs and updates the password on every start
- **Uploaded image doesn't appear** → check the terminal logs for a validation
  error (only JPG/PNG/WEBP under 12MB are accepted)
- **Port 3000 already in use** → change the left-hand side of `"3000:3000"` in
  `docker-compose.yml` to e.g. `"3001:3000"`, then open `localhost:3001`
