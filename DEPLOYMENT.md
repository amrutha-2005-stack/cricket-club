# Deploying Bengaluru Friends to Vercel

This app runs locally with Docker (Next.js + Postgres in containers), but Docker
is **not** used in production. In production:

- **Vercel** hosts the Next.js app itself
- **An external/cloud PostgreSQL database** holds your data (Vercel's own
  filesystem and containers are not persistent between deploys)
- **Cloud image storage** (Cloudinary, AWS S3, or Vercel Blob) holds uploaded
  photos, for the same reason

Follow these steps in order.

---

## 1. Push the project to GitHub

```
git init
git add .
git commit -m "Initial commit"
```

Create a new repository on GitHub, then:
```
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

---

## 2. Create a cloud PostgreSQL database

Any of these have a free tier and work well with Prisma + Vercel:

- **Neon** (https://neon.tech) — serverless Postgres, easiest Vercel integration
- **Supabase** (https://supabase.com) — Postgres + optional file storage in one place
- **Railway** (https://railway.app)

Create a project/database, then copy its connection string — it looks like:
```
postgresql://user:password@host:5432/dbname?sslmode=require
```

---

## 3. Set DATABASE_URL

Keep this connection string handy — you'll paste it into Vercel's environment
variables in step 7. You do **not** need a local `.env` for this; Vercel manages
production environment variables through its dashboard.

---

## 4. Configure media storage

Local Docker uses `STORAGE_DRIVER=local`, which writes to disk — this does **not**
work on Vercel. Pick one cloud provider and implement it in `lib/storage.ts`
(the file has a clearly marked spot for each — `saveCloudinary()`, `saveS3()`,
`saveVercelBlob()` — the rest of the app never changes, since everything calls
the shared `uploadFile()` function).

**Cloudinary (recommended — simplest):**
1. Create a free account at https://cloudinary.com
2. From the dashboard, copy your Cloud Name, API Key, and API Secret
3. `npm install cloudinary`
4. Implement `saveCloudinary()` in `lib/storage.ts` using their Node SDK's
   `cloudinary.uploader.upload()` (their docs have a copy-paste example)
5. Set `STORAGE_DRIVER=cloudinary` in Vercel's environment variables

**Vercel Blob (simplest if you're already all-in on Vercel):**
1. In your Vercel project → Storage → Create a Blob store
2. Vercel gives you a `BLOB_READ_WRITE_TOKEN` automatically
3. `npm install @vercel/blob`
4. Implement `saveVercelBlob()` using their `put()` function
5. Set `STORAGE_DRIVER=vercel-blob`

**AWS S3:** similar pattern — create a bucket, an IAM user with upload permissions,
`npm install @aws-sdk/client-s3`, implement `saveS3()`.

---

## 5. Configure authentication secrets

You'll set these directly in Vercel (step 7):
- `AUTH_SECRET` — generate a new long random string for production (don't reuse
  your local dev one)
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — used once, to create your real
  production admin account

---

## 6. Import the repository into Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework Preset: Vercel detects **Next.js** automatically — leave defaults
4. Don't deploy yet — add environment variables first (next step)

---

## 7. Add environment variables

In the Vercel project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your cloud Postgres connection string from step 2 |
| `AUTH_SECRET` | A new long random string |
| `SEED_ADMIN_EMAIL` | Your real admin email |
| `SEED_ADMIN_PASSWORD` | A strong password (you'll want to change it after first login) |
| `STORAGE_DRIVER` | `cloudinary`, `s3`, or `vercel-blob` |
| *(matching storage credentials)* | From step 4 |
| `SITE_URL` | Your production URL, e.g. `https://bengalurufriends.com` |

---

## 8. Run database migrations

Vercel doesn't run a persistent container, so migrations need to run once against
your cloud database before (or right after) the first deploy. From your own
machine, with `DATABASE_URL` in a local `.env` pointed at the **cloud** database:

```
npm run prisma:deploy
npm run seed
```

This applies all migrations and creates your production admin account. You only
need to do this once (and again for future schema changes — see below).

---

## 9. Deploy

Click **Deploy** in Vercel. Once it finishes, open the generated `*.vercel.app`
URL and confirm:
- The homepage loads with your real content
- `/admin/login` works with your `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
- Uploading a photo in the admin dashboard works (confirms cloud storage is wired
  up correctly)

For future code changes: just `git push` — Vercel redeploys automatically. If a
change includes a new Prisma migration, run `npm run prisma:deploy` against the
production database once (from your machine, or a CI step) before/after pushing.

---

## 10. Connect a custom domain

In the Vercel project → Settings → Domains, add your domain (e.g.
`bengalurufriends.com`) and follow Vercel's DNS instructions (usually adding an
A record or CNAME at your domain registrar). Vercel issues an SSL certificate
automatically once DNS propagates.

---

## Summary checklist

- [ ] Code pushed to GitHub
- [ ] Cloud Postgres database created, connection string saved
- [ ] One cloud storage provider wired up in `lib/storage.ts`
- [ ] All environment variables added in Vercel
- [ ] `npm run prisma:deploy` run against the cloud database
- [ ] `npm run seed` run against the cloud database
- [ ] Deployed on Vercel, admin login confirmed working
- [ ] Photo upload confirmed working (proves cloud storage is correct)
- [ ] Custom domain connected
