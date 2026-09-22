#!/bin/sh
# Runs on every container start. Retries migrations a few times in case
# Postgres isn't quite ready yet, then applies migrations and seeds the
# database. Both are safe to re-run (migrate deploy only applies new
# migrations; the seed script upserts), so restarting the container never
# duplicates data or wipes the gallery.

set -e

echo "Waiting for database and applying migrations..."
attempt=0
until npx prisma migrate deploy; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 10 ]; then
    echo "Database did not become ready in time. Exiting."
    exit 1
  fi
  echo "Database not ready yet, retrying in 3s... ($attempt/10)"
  sleep 3
done

echo "Seeding database (admin account + default settings)..."
npm run seed

echo "Starting Next.js..."
exec npm start
