require("dotenv").config();

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const session = require("express-session");
const multer = require("multer");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");

const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";

const dbPath = path.join(__dirname, "database", "bengaluru-friends.db");

if (!fs.existsSync(dbPath)) {
  console.error("Database not found. Run this first:");
  console.error("  npm run init-db");
  process.exit(1);
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// ---------- Folders ----------

const uploadsDir = path.join(__dirname, "uploads");
const thumbsDir = path.join(uploadsDir, "thumbs");

for (const dir of [uploadsDir, thumbsDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ---------- App setup ----------

const app = express();

app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsDir));

// ---------- Auth helpers ----------

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: "Not logged in." });
}

// ---------- Admin auth routes ----------

app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(email);

  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  req.session.isAdmin = true;
  req.session.adminEmail = admin.email;
  res.json({ success: true, email: admin.email });
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get("/api/admin/session", (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.json({ loggedIn: true, email: req.session.adminEmail });
  }
  res.json({ loggedIn: false });
});

// ---------- Gallery: public read ----------

app.get("/api/gallery", (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 40));
  const offset = (page - 1) * limit;

  const total = db.prepare("SELECT COUNT(*) AS count FROM gallery").get().count;

  const rows = db
    .prepare(
      `SELECT id, filename, thumbnail_filename, original_filename, upload_date
       FROM gallery
       ORDER BY id DESC
       LIMIT ? OFFSET ?`
    )
    .all(limit, offset);

  const photos = rows.map((row) => ({
    id: row.id,
    url: `/uploads/${row.filename}`,
    thumbnailUrl: `/uploads/thumbs/${row.thumbnail_filename}`,
    originalFilename: row.original_filename,
    uploadDate: row.upload_date,
  }));

  res.json({
    photos,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

// ---------- Gallery: protected upload ----------

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024; // 12 MB per photo
const MAX_FILES_PER_UPLOAD = 40;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${safeExt}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: MAX_FILES_PER_UPLOAD },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and WEBP images are allowed."));
    }
  },
});

app.post("/api/gallery/upload", requireAdmin, (req, res) => {
  upload.array("photos", MAX_FILES_PER_UPLOAD)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed." });
    }

    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const insertStatement = db.prepare(
      `INSERT INTO gallery (filename, thumbnail_filename, original_filename, file_path, thumbnail_path)
       VALUES (?, ?, ?, ?, ?)`
    );

    const saved = [];
    const failed = [];

    for (const file of files) {
      try {
        const thumbnailFilename = `thumb-${file.filename.replace(/\.[^.]+$/, ".webp")}`;
        const thumbnailPath = path.join(thumbsDir, thumbnailFilename);

        await sharp(file.path)
          .rotate()
          .resize(500, 500, { fit: "cover" })
          .webp({ quality: 78 })
          .toFile(thumbnailPath);

        const info = insertStatement.run(
          file.filename,
          thumbnailFilename,
          file.originalname,
          path.join("uploads", file.filename),
          path.join("uploads", "thumbs", thumbnailFilename)
        );

        saved.push({
          id: info.lastInsertRowid,
          url: `/uploads/${file.filename}`,
          thumbnailUrl: `/uploads/thumbs/${thumbnailFilename}`,
          originalFilename: file.originalname,
        });
      } catch (thumbError) {
        console.error("Thumbnail generation failed for", file.originalname, thumbError);
        failed.push(file.originalname);
        // Clean up the original file if we couldn't process it
        fs.unlink(file.path, () => {});
      }
    }

    res.json({ success: true, saved, failed });
  });
});

// ---------- Gallery: protected delete ----------

app.delete("/api/gallery/:id", requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid photo id." });
  }

  const row = db.prepare("SELECT * FROM gallery WHERE id = ?").get(id);
  if (!row) {
    return res.status(404).json({ error: "Photo not found." });
  }

  db.prepare("DELETE FROM gallery WHERE id = ?").run(id);

  const fullPath = path.join(__dirname, row.file_path);
  const thumbPath = path.join(__dirname, row.thumbnail_path);
  fs.unlink(fullPath, () => {});
  fs.unlink(thumbPath, () => {});

  res.json({ success: true });
});

// ---------- Contact form ----------

app.post("/api/contact", (req, res) => {
  const { name, email, phone, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email and message are required." });
  }

  db.prepare(
    "INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)"
  ).run(name, email, phone || null, message);

  // NOTE for later: this is where you'd call an email service (e.g. Nodemailer,
  // SendGrid, Resend) to notify the club whenever a new message comes in.
  res.json({ success: true });
});

// ---------- Start server ----------

app.listen(PORT, () => {
  console.log(`Bengaluru Friends Cricket Club website running at http://localhost:${PORT}`);
});
