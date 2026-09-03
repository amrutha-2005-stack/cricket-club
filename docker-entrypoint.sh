#!/bin/sh
# Runs once per container start. Both scripts are safe to re-run —
# init-db only creates tables if missing, create-admin only creates/updates
# the one admin row for ADMIN_EMAIL. So restarting the container never
# duplicates data or wipes the gallery.

set -e

echo "Checking database..."
node scripts/init-db.js

if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo "Ensuring admin account exists..."
  node scripts/create-admin.js
else
  echo "ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin creation."
fi

echo "Starting server..."
exec node server.js
