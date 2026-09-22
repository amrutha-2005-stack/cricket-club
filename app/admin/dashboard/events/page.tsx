"use client";

import { useEffect, useState } from "react";

type EventItem = { id: string; title: string; location: string | null; eventDate: string };

export default function EventsAdminPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/events");
    const data = await res.json();
    setItems(data.events || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setLocation("");
    setEventDate("");
  }

  function startEdit(item: EventItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setLocation(item.location || "");
    setEventDate(item.eventDate.slice(0, 10));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { title, location: location || undefined, eventDate };

    await fetch(editingId ? `/api/admin/events/${editingId}` : "/api/admin/events", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    resetForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">Upcoming Events</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-xl rounded-xl bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm font-semibold text-navy-950">{editingId ? "Edit Event" : "Add Event"}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Date *</label>
            <input required type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div className="mt-5 flex gap-3">
          <button type="submit" disabled={saving} className="rounded-md bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60">
            {saving ? "Saving…" : editingId ? "Save Changes" : "Add Event"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-md border border-navy-950/15 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-navy-950/5">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-navy-950/50">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-navy-950/50">No events added yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-navy-950/10 bg-navy-950/[0.02] text-left text-xs uppercase text-navy-950/40">
              <tr><th className="p-4">Title</th><th className="p-4">Date</th><th className="p-4">Location</th><th className="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-navy-950/5 last:border-0">
                  <td className="p-4 font-semibold text-navy-950">{item.title}</td>
                  <td className="p-4 text-navy-950/60">{new Date(item.eventDate).toLocaleDateString()}</td>
                  <td className="p-4 text-navy-950/60">{item.location ?? "—"}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(item)} className="rounded border border-navy-950/15 px-3 py-1 font-semibold hover:bg-navy-950/5">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="rounded border border-red-200 px-3 py-1 font-semibold text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
