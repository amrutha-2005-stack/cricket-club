// Storage abstraction so the rest of the app never talks to the filesystem
// (or a cloud SDK) directly. Swapping providers means editing this file only —
// no changes to any component, page, or API route that uses uploadFile().
//
// Local dev / Docker: STORAGE_DRIVER=local — writes into public/uploads,
// which is a persistent Docker volume (see docker-compose.yml).
//
// Production on Vercel: set STORAGE_DRIVER to "cloudinary", "s3", or
// "vercel-blob" and fill in the matching credentials in .env — Vercel's
// filesystem is not persistent, so "local" must not be used there.
// See DEPLOYMENT.md for exact setup steps for each provider.

import { randomBytes, createHash } from "crypto";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { prisma } from "./db";

export type UploadResult = {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
};

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024; // 12 MB

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

function buildSafeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
  return `${Date.now()}-${randomBytes(8).toString("hex")}${safeExt}`;
}

/**
 * Saves an uploaded image (from a FormData "File") using whichever driver
 * is configured, optimizes it, records it in the Media table, and returns
 * a public URL the frontend can render directly.
 */
export async function uploadFile(file: File, options?: { altText?: string; caption?: string }): Promise<UploadResult> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Only JPG, PNG and WEBP images are allowed.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Image is larger than the 12MB limit.");
  }

  const driver = process.env.STORAGE_DRIVER || "local";
  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  // Re-encode through sharp for every driver: strips bad EXIF orientation,
  // caps dimensions so nobody accidentally uploads a 40MB camera original.
  const optimizedBuffer = await sharp(inputBuffer)
    .rotate()
    .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
    .toBuffer();

  let result: UploadResult;

  switch (driver) {
    case "local": {
      result = await saveLocal(optimizedBuffer, file.name, file.type);
      break;
    }
    case "cloudinary": {
      result = await saveCloudinary(optimizedBuffer, file.name, file.type);
      break;
    }
    case "s3":
      throw new Error(
        "STORAGE_DRIVER=s3 but S3 isn't wired up yet. Add AWS_* vars to .env and implement saveS3() in lib/storage.ts (see DEPLOYMENT.md)."
      );
    case "vercel-blob":
      throw new Error(
        "STORAGE_DRIVER=vercel-blob but Vercel Blob isn't wired up yet. Add BLOB_READ_WRITE_TOKEN to .env and implement saveVercelBlob() in lib/storage.ts (see DEPLOYMENT.md)."
      );
    default:
      throw new Error(`Unknown STORAGE_DRIVER "${driver}".`);
  }

  await prisma.media.create({
    data: {
      url: result.url,
      filename: result.filename,
      mimeType: result.mimeType,
      size: result.size,
      altText: options?.altText,
      caption: options?.caption,
    },
  });

  return result;
}

async function saveLocal(buffer: Buffer, originalName: string, mimeType: string): Promise<UploadResult> {
  await ensureUploadDir();
  const filename = buildSafeFilename(originalName);
  const fullPath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(fullPath, buffer);

  return {
    url: `/uploads/${filename}`,
    filename,
    mimeType,
    size: buffer.byteLength,
  };
}

/**
 * Uploads directly to Cloudinary's REST API using a signed request — no
 * cloudinary npm package required. Requires CLOUDINARY_CLOUD_NAME,
 * CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.
 */
async function saveCloudinary(buffer: Buffer, originalName: string, mimeType: string): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not fully configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your environment variables.");
  }

  const filename = buildSafeFilename(originalName);
  const publicId = `bengaluru-friends/${filename.replace(/\.[^.]+$/, "")}`;
  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary signed uploads: sign every param except file/api_key/signature
  // itself, sorted alphabetically, hashed with the API secret.
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(paramsToSign + apiSecret).digest("hex");

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("public_id", publicId);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Cloudinary upload failed.");
  }

  return {
    url: data.secure_url as string,
    filename,
    mimeType,
    size: buffer.byteLength,
  };
}

/**
 * Deletes an image previously uploaded to Cloudinary, by re-deriving its
 * public_id from the URL Cloudinary gave us.
 */
async function deleteCloudinary(url: string): Promise<void> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return;

  const match = url.match(/\/upload\/v\d+\/(.+)\.[a-zA-Z0-9]+$/);
  if (!match) return;
  const publicId = match[1];

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(paramsToSign + apiSecret).digest("hex");

  const form = new FormData();
  form.append("public_id", publicId);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);

  try {
    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: form,
    });
  } catch {
    // Best-effort — if this fails, the file is just orphaned on Cloudinary,
    // which doesn't break the app.
  }
}

/**
 * Deletes a previously uploaded file. Safe to call even if the file is
 * already gone. Handles "local" and "cloudinary" — S3 / Vercel Blob should
 * get their own branch here alongside their saveX() implementation above.
 */
export async function deleteFile(url: string): Promise<void> {
  const driver = process.env.STORAGE_DRIVER || "local";

  if (driver === "cloudinary") {
    await deleteCloudinary(url);
    return;
  }
  if (driver !== "local") return;

  if (!url.startsWith("/uploads/")) return;
  const fullPath = path.join(process.cwd(), "public", url);
  try {
    await fs.unlink(fullPath);
  } catch {
    // Already deleted or never existed — nothing to do.
  }
}
