# Bengaluru Friends Cricket Club — Docker image
# Uses a Debian-based Node image (not Alpine) because better-sqlite3 and
# sharp both ship prebuilt binaries for glibc, so no compiler toolchain
# needs to be installed — faster, smaller, more reliable builds.

FROM node:20-bookworm-slim

WORKDIR /app

# Install dependencies first (better layer caching — this layer only
# rebuilds when package.json actually changes)
COPY package.json ./
RUN npm install --omit=dev

# Now copy the rest of the project
COPY . .

# Make sure the folders the app writes to exist inside the image
RUN mkdir -p uploads/thumbs database

RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
