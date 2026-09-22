"use client";

import { useEffect, useState } from "react";

const PLATFORMS = ["INSTAGRAM", "FACEBOOK", "YOUTUBE", "WHATSAPP"] as const;

export default function SocialAdminPage() {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingPlatform, setSavingPlatform] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/social")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, string> = {};
        (data.links || []).forEach((l: { platform: string; url: string }) => (map[l.platform] = l.url));
        setUrls(map);
        setLoading(false);
      });
  }, []);

  async function handleSave(platform: string) {
    setSavingPlatform(platform);
    await fetch("/api/admin/social", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, url: urls[platform] || "" }),
    });
    setSavingPlatform(null);
  }

  if (loading) return <p className="text-sm text-navy-950/50">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">Social Media</h1>
      <p className="mt-1 text-sm text-navy-950/50">Leave a URL blank to hide that icon from the website.</p>

      <div className="mt-6 max-w-xl rounded-xl bg-white p-6 shadow-sm">
        {PLATFORMS.map((platform) => (
          <div key={platform} className="mb-5 last:mb-0">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">{platform}</label>
            <div className="flex gap-2">
              <input
                value={urls[platform] || ""}
                onChange={(e) => setUrls((u) => ({ ...u, [platform]: e.target.value }))}
                placeholder="https://…"
                className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold"
              />
              <button
                onClick={() => handleSave(platform)}
                disabled={savingPlatform === platform}
                className="shrink-0 rounded-md bg-navy-950 px-4 py-2 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60"
              >
                {savingPlatform === platform ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
