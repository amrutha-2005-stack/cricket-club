"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";

export type TournamentFormValues = {
  name: string;
  year: string;
  location: string;
  description: string;
  winner: string;
  runnerUp: string;
  numberOfTeams: string;
  posterUrl: string;
  date: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
};

const EMPTY: TournamentFormValues = {
  name: "", year: "", location: "", description: "", winner: "", runnerUp: "", numberOfTeams: "", posterUrl: "", date: "", status: "COMPLETED",
};

export default function TournamentForm({ tournamentId, initialValues }: { tournamentId?: string; initialValues?: Partial<TournamentFormValues> }) {
  const router = useRouter();
  const [values, setValues] = useState<TournamentFormValues>({ ...EMPTY, ...initialValues });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof TournamentFormValues>(key: K, value: TournamentFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: values.name,
      year: values.year ? parseInt(values.year, 10) : null,
      location: values.location || undefined,
      description: values.description || undefined,
      winner: values.winner || undefined,
      runnerUp: values.runnerUp || undefined,
      numberOfTeams: values.numberOfTeams ? parseInt(values.numberOfTeams, 10) : null,
      posterUrl: values.posterUrl || undefined,
      date: values.date || undefined,
      status: values.status,
    };

    try {
      const res = await fetch(tournamentId ? `/api/admin/tournaments/${tournamentId}` : "/api/admin/tournaments", {
        method: tournamentId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      router.push("/admin/dashboard/tournaments");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <ImageUploadField label="Tournament Poster" value={values.posterUrl} onChange={(url) => set("posterUrl", url)} />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Name *</label>
          <input required value={values.name} onChange={(e) => set("name", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Status</label>
          <select value={values.status} onChange={(e) => set("status", e.target.value as TournamentFormValues["status"])} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold">
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Year</label>
          <input type="number" value={values.year} onChange={(e) => set("year", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Date</label>
          <input type="date" value={values.date} onChange={(e) => set("date", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Number of Teams</label>
          <input type="number" value={values.numberOfTeams} onChange={(e) => set("numberOfTeams", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Location</label>
        <input value={values.location} onChange={(e) => set("location", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Winner</label>
          <input value={values.winner} onChange={(e) => set("winner", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Runner-up</label>
          <input value={values.runnerUp} onChange={(e) => set("runnerUp", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Description</label>
        <textarea rows={3} value={values.description} onChange={(e) => set("description", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
      </div>

      <p className="mt-4 text-xs text-navy-950/40">
        Multiple photos and videos per tournament are supported in the database schema (TournamentPhoto, Video.tournamentId)
        — this form covers the core details; a dedicated per-tournament media manager can be added the same way the main
        Winner Gallery works.
      </p>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={saving} className="rounded-md bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60">
          {saving ? "Saving…" : tournamentId ? "Save Changes" : "Add Tournament"}
        </button>
        <button type="button" onClick={() => router.push("/admin/dashboard/tournaments")} className="rounded-md border border-navy-950/15 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-navy-950/5">
          Cancel
        </button>
      </div>
    </form>
  );
}
