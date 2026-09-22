"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";

export type CurrentPlayerFormValues = {
  name: string;
  photoUrl: string;
  jerseyNumber: string;
  role: string;
  battingStyle: string;
  bowlingStyle: string;
  bio: string;
  socialLink: string;
};

const EMPTY: CurrentPlayerFormValues = {
  name: "", photoUrl: "", jerseyNumber: "", role: "", battingStyle: "", bowlingStyle: "", bio: "", socialLink: "",
};

export default function CurrentPlayerForm({ playerId, initialValues }: { playerId?: string; initialValues?: Partial<CurrentPlayerFormValues> }) {
  const router = useRouter();
  const [values, setValues] = useState<CurrentPlayerFormValues>({ ...EMPTY, ...initialValues });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof CurrentPlayerFormValues>(key: K, value: CurrentPlayerFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: values.name,
      photoUrl: values.photoUrl || undefined,
      jerseyNumber: values.jerseyNumber ? parseInt(values.jerseyNumber, 10) : null,
      role: values.role || undefined,
      battingStyle: values.battingStyle || undefined,
      bowlingStyle: values.bowlingStyle || undefined,
      bio: values.bio || undefined,
      socialLink: values.socialLink || undefined,
    };

    try {
      const res = await fetch(playerId ? `/api/admin/current-players/${playerId}` : "/api/admin/current-players", {
        method: playerId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      router.push("/admin/dashboard/current-players");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <ImageUploadField label="Photo" value={values.photoUrl} onChange={(url) => set("photoUrl", url)} />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Name *</label>
          <input required value={values.name} onChange={(e) => set("name", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Jersey Number</label>
          <input type="number" value={values.jerseyNumber} onChange={(e) => set("jerseyNumber", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Role</label>
          <input value={values.role} onChange={(e) => set("role", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Batting Style</label>
          <input value={values.battingStyle} onChange={(e) => set("battingStyle", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Bowling Style</label>
          <input value={values.bowlingStyle} onChange={(e) => set("bowlingStyle", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Short Bio</label>
        <textarea rows={3} value={values.bio} onChange={(e) => set("bio", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Social Link</label>
        <input value={values.socialLink} onChange={(e) => set("socialLink", e.target.value)} placeholder="https://instagram.com/…" className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={saving} className="rounded-md bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60">
          {saving ? "Saving…" : playerId ? "Save Changes" : "Add Player"}
        </button>
        <button type="button" onClick={() => router.push("/admin/dashboard/current-players")} className="rounded-md border border-navy-950/15 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-navy-950/5">
          Cancel
        </button>
      </div>
    </form>
  );
}
