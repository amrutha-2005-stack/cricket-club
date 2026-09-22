/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Self-hosted/Docker fix: the built-in optimizer re-processes every
    // image through sharp on each request via /_next/image. If that
    // pipeline breaks for any reason inside the container (missing/
    // mismatched native binary, a cache directory it can't write to,
    // etc.) images render as blank/broken even though the underlying
    // file is perfectly fine on disk — which is exactly the symptom
    // reported. Serving files directly removes that failure class
    // entirely. Uploaded images are already resized/re-encoded once at
    // upload time in lib/storage.ts, so there's no real loss here.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.s3.amazonaws.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

module.exports = nextConfig;
