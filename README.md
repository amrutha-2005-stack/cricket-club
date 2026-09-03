# Bengaluru Friends Cricket Club — Website

A complete, real (not a mockup) website for Bengaluru Friends Cricket Club:

- Public site: Home, About, Team, Gallery, Videos, Contact
- A real photo **Gallery** backed by a database, with pagination and a lightbox
- A password-protected **Admin dashboard** where the club can upload and delete
  photos themselves — no code editing required
- A Node.js + Express **backend** with a SQLite database and a file-upload API

This guide assumes you are starting from zero on a Windows laptop with VS Code.
Follow the steps in order — after each one, there's a note on what you should see.

---

## 1. Install Node.js

1. Go to **https://nodejs.org**
2. Download the **LTS** version (the button on the left, currently 20.x or 22.x)
3. Run the installer, click Next through the defaults, and finish

**Check it worked:** open **Command Prompt** (search "cmd" in the Start menu) and run:

```
node --version
npm --version
```

You should see two version numbers printed (e.g. `v20.14.0` and `10.7.0`). If you get
"not recognized", restart your computer and try again — the installer needs a restart
to update your PATH.

---

## 2. Open the project in VS Code

1. Install VS Code from **https://code.visualstudio.com** if you don't have it
2. Open VS Code
3. `File → Open Folder…` and select the `bengaluru-friends-cricket-club` folder
4. You should see the file tree on the left: `public/`, `server.js`, `package.json`, etc.

---

## 3. Open the VS Code terminal

- Menu: `Terminal → New Terminal`
- Or press `` Ctrl + ` ``

A terminal panel opens at the bottom, already pointed at your project folder. **Run every
command below inside this terminal**, one at a time, in order.

---

## 4. Install dependencies

```
npm install
```

**Expected result:** a progress bar, then a summary like `added 90 packages…`. This
creates a `node_modules` folder — that's normal, don't open it.

> If this step fails with errors mentioning `better-sqlite3` or `sharp` and native
> build tools, make sure you installed the Node.js **LTS** version above (not a very
> new "Current" version) and try `npm install` again.

---

## 5. Create your `.env` file

The project ships with a template called `.env.example`. Copy it to a new file
named `.env`:

```
copy .env.example .env
```

Now open the new `.env` file in VS Code and edit these two lines with your own values:

```
SESSION_SECRET=any-long-random-sentence-you-like
ADMIN_EMAIL=your-real-email@example.com
ADMIN_PASSWORD=choose-a-strong-password
```

Save the file. `.env` is already excluded from version control (see `.gitignore`),
so your password never gets committed to git.

---

## 6. Initialize the database

```
npm run init-db
```

**Expected result:**

```
Database ready at: ...\database\bengaluru-friends.db
Tables: admins, gallery, contact_messages
```

A new `database/bengaluru-friends.db` file appears in your project. This is your
whole gallery database — back it up if you ever want a copy of your photo records.

---

## 7. Create the first admin account

```
npm run create-admin
```

This reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env` file and creates the
account.

**Expected result:**

```
Admin account created for: your-real-email@example.com
You can now log in at /admin.html with this email and the password from .env
```

You can run this command again later (with a new password in `.env`) to reset
your admin password.

---

## 8. Start the server

```
npm start
```

**Expected result:**

```
Bengaluru Friends Cricket Club website running at http://localhost:3000
```

Leave this terminal window running — closing it stops the website. To stop it
yourself, click into the terminal and press `Ctrl + C`.

---

## 9. Open the website

Open your browser and go to:

```
http://localhost:3000
```

**Expected result:** the full homepage — hero section with the club logo and crest,
About, Team placeholders, Gallery preview, Videos, Contact, and footer.

---

## 10. Access the admin panel

Go to:

```
http://localhost:3000/admin.html
```

**Expected result:** a dark login card with the club logo, asking for an email and
password.

---

## 11. Log in

Enter the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you set in step 5, then click **Log In**.

**Expected result:** you land on the **Gallery Management** dashboard, with stats
(Total Photos, Gallery Pages, Last Upload), an upload area, and an (empty, for now)
grid of existing photos.

---

## 12. Upload photographs

1. Either drag photo files onto the dashed box, or click it to browse your computer
2. Selected photos appear as a preview grid with small **×** buttons if you want to
   remove one before uploading
3. Click **Upload Photos**
4. Watch the progress bar fill up

**Expected result:** a small confirmation message appears bottom-right ("Uploaded
N photos"), and the photos immediately appear in the **Existing Photos** grid below.

Accepted formats: JPG, JPEG, PNG, WEBP. Max size: 12MB per photo, up to 40 photos
per upload.

---

## 13. Confirm uploaded photos appear on the public Gallery

Open a new browser tab and go to:

```
http://localhost:3000/gallery.html
```

**Expected result:** your uploaded photos appear in the public gallery grid,
newest first. Click any photo to open the full-screen viewer, and use the
arrow buttons (or ← / → keys) to move between photos, including across pages.

No code editing was needed — this is the "upload once, appears everywhere"
behaviour the client asked for.

---

## 14. Delete a photograph

Back in `/admin.html`, hover over any photo in the **Existing Photos** grid and
click the small red **×** button that appears top-right of the photo. Confirm the
prompt.

**Expected result:** the photo disappears from the admin grid immediately, and is
also removed from the public gallery (refresh `/gallery.html` to confirm) and
deleted from disk.

---

## Everyday use, after today

Once everything is set up, you only need step 8 to run the site again:

```
npm start
```

then open `http://localhost:3000`.

---

## Project structure

```
bengaluru-friends-cricket-club/
├── public/                  Everything the browser loads directly
│   ├── index.html           Homepage
│   ├── gallery.html         Public paginated gallery + lightbox
│   ├── admin.html           Admin login + dashboard
│   ├── css/styles.css       All styling
│   ├── js/
│   │   ├── main.js          Nav, scroll reveal, contact form, gallery preview
│   │   ├── gallery.js       Public gallery page logic
│   │   └── admin.js         Login, upload, delete, admin gallery grid
│   └── assets/              Logo + starter photos
├── uploads/                 Uploaded photos live here (full-size + /thumbs)
├── database/                SQLite database file (created by npm run init-db)
├── scripts/
│   ├── init-db.js           Creates the database and tables
│   └── create-admin.js      Creates/updates the admin account
├── server.js                Express server + all API routes
├── package.json
├── .env.example             Template — copy to .env
├── .gitignore
├── Dockerfile                Optional — see "Running with Docker" below
├── docker-compose.yml         Optional — see "Running with Docker" below
├── docker-entrypoint.sh        Optional — see "Running with Docker" below
└── .dockerignore
```

## What's real vs. placeholder right now

- **Logo**: your real logo, used as-is (not distorted, not regenerated)
- **Hero photo & "About" photos**: two of your real archive photos, temporarily
  standing in for a high-resolution action shot — swap `public/assets/heritage-01.jpg`
  and `heritage-02.jpg` for sharper images any time by replacing those files
  (keep the same filenames, or update the `src` in `index.html`)
- **About copy**: written from the facts you provided (founded 1994, 300+
  tournaments at state level, the exam-time origin story) — no invented history
- **Team section**: structural placeholder cards only — no invented player names.
  To add a real player, duplicate one `.team-card` block in `index.html` and fill
  in their photo, name, role and jersey number
- **Videos**: shows a "Coming Soon" empty state. To add real videos later, the
  cleanest option is to replace that block with `.video-card` elements
  embedding YouTube `<iframe>`s (a matching `.video-card` style is already in
  `styles.css`, ready to use)
- **Contact details** (phone, email, address, social links): clearly marked
  placeholders in both `index.html` and the footer — search for `to be added`
  and your own social URLs to fill in

## Moving to the cloud later

The gallery is already structured so it can grow past thousands of photos and
later move to cloud storage (Cloudinary, AWS S3, Supabase Storage, Firebase
Storage) without changing the frontend:

- All photo metadata lives in the `gallery` table in SQLite (`filename`,
  `original_filename`, `file_path`, `thumbnail_path`, `upload_date`) — swapping
  local file paths for cloud URLs only touches `server.js`
- The public API (`GET /api/gallery`) already returns ready-to-use URLs, paginated,
  so the frontend doesn't need to change when storage changes
- Thumbnails are generated on upload (500×500 WEBP) so the gallery stays fast
  even with thousands of full-size originals

## Running with Docker (alternative to steps 1–9 above)

If you'd rather run this in Docker than install Node.js directly, the project
includes a `Dockerfile`, `docker-compose.yml` and `.dockerignore`. You still
need Docker Desktop installed and running first.

1. Create your `.env` file (same as step 5 above):
   ```
   copy .env.example .env
   ```
   Edit it with your own `SESSION_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

2. Build and start the container:
   ```
   docker compose up --build
   ```

   **Expected result:** build logs, then:
   ```
   bengaluru-friends-web  | Checking database...
   bengaluru-friends-web  | Database ready at: ...
   bengaluru-friends-web  | Ensuring admin account exists...
   bengaluru-friends-web  | Admin account created for: your-email@example.com
   bengaluru-friends-web  | Starting server...
   bengaluru-friends-web  | Bengaluru Friends Cricket Club website running at http://localhost:3000
   ```

3. Open `http://localhost:3000` — same site, same `/admin.html`, same login,
   exactly as in steps 9–14 above.

**What's different from running it directly:**
- You don't need to run `npm install`, `npm run init-db` or `npm run create-admin`
  yourself — the container does all three automatically every time it starts
  (they're safe to repeat, so this never wipes existing data)
- Your uploaded photos and the SQLite database are **not** locked inside the
  container — `docker-compose.yml` maps `./uploads` and `./database` to real
  folders on your laptop, so `docker compose down` / rebuilds never lose data
- To stop it: `Ctrl + C`, then `docker compose down`
- To run it in the background: `docker compose up -d --build`
- To see logs while running in the background: `docker compose logs -f`
- To apply a code change: `docker compose up --build` again (image rebuilds,
  your `uploads/` and `database/` folders are untouched)

If you ever want to reset the admin password, edit `ADMIN_PASSWORD` in `.env`
and restart the container — the entrypoint re-runs `create-admin` on every start.

---

## Troubleshooting

- **"Database not found" when running `npm start`** → run `npm run init-db` first
- **Can't log in to /admin.html** → re-check `.env`, then re-run
  `npm run create-admin`
- **Port 3000 already in use** → change `PORT=3000` to e.g. `PORT=3001` in `.env`,
  then open `http://localhost:3001` instead
- **Uploaded photo doesn't show a thumbnail** → check the file is a real JPG/PNG/WEBP
  (not just renamed) — the server logs a warning in the terminal for any file it
  couldn't process
