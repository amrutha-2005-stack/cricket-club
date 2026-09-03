// Creates (or updates) the first admin account, using ADMIN_EMAIL and
// ADMIN_PASSWORD from your .env file. Run this once after "npm run init-db".
//
// Usage:  npm run create-admin

require("dotenv").config();
const path = require("path");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "..", "database", "bengaluru-friends.db");
const db = new Database(dbPath);

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in your .env file.");
  console.error("Open .env and set both values, then run this command again.");
  process.exit(1);
}

if (password.length < 8) {
  console.error("ADMIN_PASSWORD should be at least 8 characters. Please update .env.");
  process.exit(1);
}

const passwordHash = bcrypt.hashSync(password, 12);

const existing = db.prepare("SELECT id FROM admins WHERE email = ?").get(email);

if (existing) {
  db.prepare("UPDATE admins SET password_hash = ? WHERE email = ?").run(passwordHash, email);
  console.log(`Admin account updated for: ${email}`);
} else {
  db.prepare("INSERT INTO admins (email, password_hash) VALUES (?, ?)").run(email, passwordHash);
  console.log(`Admin account created for: ${email}`);
}

console.log("You can now log in at /admin.html with this email and the password from .env");

db.close();
