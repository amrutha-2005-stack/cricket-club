"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";

export type FounderFormValues = {
  name: string;
  designation: string;
  bio: string;
  message: string;
  photoUrl: string;
};

const EMPTY: FounderFormValues = { name: "", designation: "", bio: "", message: "", photoUrl: "" };

export default function FounderForm({ founderId, initialValues }: { founderId?: string; initialValues?: Partial<FounderFormValues> }) {
  const router = useRouter();
  const [values, setValues] = useState<FounderFormValues>({ ...EMPTY, ...initialValues });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FounderFormValues>(key: K, value: FounderFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(founderId ? `/api/admin/founders/${founderId}` : "/api/admin/founders", {
        method: founderId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      router.push("/admin/dashboard/founders");
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
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Designation *</label>
          <input required value={values.designation} onChange={(e) => set("designation", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Message (short quote)</label>
        <textarea rows={2} value={values.message} onChange={(e) => set("message", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Biography</label>
        <textarea rows={4} value={values.bio} onChange={(e) => set("bio", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={saving} className="rounded-md bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60">
          {saving ? "Saving…" : founderId ? "Save Changes" : "Add Founder"}
        </button>
        <button type="button" onClick={() => router.push("/admin/dashboard/founders")} className="rounded-md border border-navy-950/15 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-navy-950/5">
          Cancel
        </button>
      </div>
    </form>
  );
}
