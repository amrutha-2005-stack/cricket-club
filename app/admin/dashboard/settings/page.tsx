"use client";

import { useEffect, useState } from "react";

type Settings = {
  siteTitle: string;
  metaDescription: string;
  tagline: string;
  topBarTagline: string;
  bannerQuote: string;
  foundedYear: string;
  totalTournaments: string;
  totalChampionships: string;
  aboutText: string;
  address: string;
  phone: string;
  email: string;
  mapUrl: string;
};

const EMPTY: Settings = {
  siteTitle: "",
  metaDescription: "",
  tagline: "",
  topBarTagline: "",
  bannerQuote: "",
  foundedYear: "",
  totalTournaments: "",
  totalChampionships: "",
  aboutText: "",
  address: "",
  phone: "",
  email: "",
  mapUrl: "",
};

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">{label}</label>
      <input {...props} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
    </div>
  );
}

export default function SettingsAdminPage() {
  const [values, setValues] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings;
        if (s) {
          setValues({
            siteTitle: s.siteTitle || "",
            metaDescription: s.metaDescription || "",
            tagline: s.tagline || "",
            topBarTagline: s.topBarTagline || "",
            bannerQuote: s.bannerQuote || "",
            foundedYear: s.foundedYear?.toString() || "",
            totalTournaments: s.totalTournaments?.toString() || "",
            totalChampionships: s.totalChampionships?.toString() || "",
            aboutText: s.aboutText || "",
            address: s.address || "",
            phone: s.phone || "",
            email: s.email || "",
            mapUrl: s.mapUrl || "",
          });
        }
        setLoading(false);
      });
  }, []);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");

    const payload = {
      siteTitle: values.siteTitle || undefined,
      metaDescription: values.metaDescription || undefined,
      tagline: values.tagline || undefined,
      topBarTagline: values.topBarTagline || undefined,
      bannerQuote: values.bannerQuote || undefined,
      foundedYear: values.foundedYear ? parseInt(values.foundedYear, 10) : undefined,
      totalTournaments: values.totalTournaments ? parseInt(values.totalTournaments, 10) : null,
      totalChampionships: values.totalChampionships ? parseInt(values.totalChampionships, 10) : null,
      aboutText: values.aboutText || undefined,
      address: values.address || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      mapUrl: values.mapUrl || undefined,
    };

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    setSavedMsg(res.ok ? "Saved." : "Could not save.");
  }

  if (loading) return <p className="text-sm text-navy-950/50">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">About / Site Settings</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Site Title" value={values.siteTitle} onChange={(e) => set("siteTitle", e.target.value)} />
          <Field label="Founded Year" type="number" value={values.foundedYear} onChange={(e) => set("foundedYear", e.target.value)} />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Meta Description (SEO)</label>
          <textarea rows={2} value={values.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Hero Tagline" value={values.tagline} onChange={(e) => set("tagline", e.target.value)} />
          <Field label="Top Bar Tagline (cursive line)" value={values.topBarTagline} onChange={(e) => set("topBarTagline", e.target.value)} />
        </div>
        <Field label="Homepage Quote Banner" value={values.bannerQuote} onChange={(e) => set("bannerQuote", e.target.value)} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Total Tournaments (leave blank to auto-count)" type="number" value={values.totalTournaments} onChange={(e) => set("totalTournaments", e.target.value)} />
          <Field label="Total Championships" type="number" value={values.totalChampionships} onChange={(e) => set("totalChampionships", e.target.value)} />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">About Text</label>
          <textarea rows={5} value={values.aboutText} onChange={(e) => set("aboutText", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
          <Field label="Email" value={values.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <Field label="Address" value={values.address} onChange={(e) => set("address", e.target.value)} />
        <Field label="Google Maps URL" value={values.mapUrl} onChange={(e) => set("mapUrl", e.target.value)} />

        <button type="submit" disabled={saving} className="mt-6 rounded-md bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60">
          {saving ? "Saving…" : "Save Settings"}
        </button>
        {savedMsg && <span className="ml-4 text-sm text-navy-950/60">{savedMsg}</span>}
      </form>
    </div>
  );
}
