"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";

export type AchievementFormValues = {
  title: string;
  description: string;
  year: string;
  tournamentName: string;
  trophyImageUrl: string;
  teamPhotoUrl: string;
  videoUrl: string;
};

const EMPTY: AchievementFormValues = {
  title: "",
  description: "",
  year: "",
  tournamentName: "",
  trophyImageUrl: "",
  teamPhotoUrl: "",
  videoUrl: "",
};

export default function AchievementForm({
  achievementId,
  initialValues,
}: {
  achievementId?: string;
  initialValues?: Partial<AchievementFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<AchievementFormValues>({ ...EMPTY, ...initialValues });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof AchievementFormValues>(key: K, value: AchievementFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: values.title,
      description: values.description || undefined,
      year: values.year ? parseInt(values.year, 10) : null,
      tournamentName: values.tournamentName || undefined,
      trophyImageUrl: values.trophyImageUrl || undefined,
      teamPhotoUrl: values.teamPhotoUrl || undefined,
      videoUrl: values.videoUrl || undefined,
    };

    try {
      const res = await fetch(
        achievementId ? `/api/admin/achievements/${achievementId}` : "/api/admin/achievements",
        {
          method: achievementId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      router.push("/admin/dashboard/achievements");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2">
        <ImageUploadField label="Trophy / Championship Image" value={values.trophyImageUrl} onChange={(url) => set("trophyImageUrl", url)} />
        <ImageUploadField label="Team Photo" value={values.teamPhotoUrl} onChange={(url) => set("teamPhotoUrl", url)} />
      </div>

      <div className="mt-5">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Title *</label>
        <input required value={values.title} onChange={(e) => set("title", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Year</label>
          <input type="number" value={values.year} onChange={(e) => set("year", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Tournament Name</label>
          <input value={values.tournamentName} onChange={(e) => set("tournamentName", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Description</label>
        <textarea rows={4} value={values.description} onChange={(e) => set("description", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Video URL (optional)</label>
        <input value={values.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://youtube.com/..." className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={saving} className="rounded-md bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60">
          {saving ? "Saving…" : achievementId ? "Save Changes" : "Create Achievement"}
        </button>
        <button type="button" onClick={() => router.push("/admin/dashboard/achievements")} className="rounded-md border border-navy-950/15 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-navy-950/5">
          Cancel
        </button>
      </div>
    </form>
  );
}
