"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Founder = { id: string; name: string; designation: string; order: number };

export default function FoundersAdminPage() {
  const [items, setItems] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/founders");
    const data = await res.json();
    setItems(data.founders || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this leadership entry?")) return;
    await fetch(`/api/admin/founders/${id}`, { method: "DELETE" });
    load();
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = items[index + direction];
    const current = items[index];
    if (!target) return;
    await Promise.all([
      fetch(`/api/admin/founders/${current.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: target.order }) }),
      fetch(`/api/admin/founders/${target.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: current.order }) }),
    ]);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold text-navy-950">Founder / Leadership</h1>
        <Link href="/admin/dashboard/founders/new" className="rounded-md bg-navy-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-navy-800">
          + Add Entry
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-navy-950/50">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-navy-950/50">No leadership entries added yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-navy-950/10 bg-navy-950/[0.02] text-left text-xs uppercase text-navy-950/40">
              <tr><th className="p-4">Name</th><th className="p-4">Designation</th><th className="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-navy-950/5 last:border-0">
                  <td className="p-4 font-semibold text-navy-950">{item.name}</td>
                  <td className="p-4 text-navy-950/60">{item.designation}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleMove(index, -1)} disabled={index === 0} className="rounded border border-navy-950/15 px-2 py-1 disabled:opacity-30">↑</button>
                      <button onClick={() => handleMove(index, 1)} disabled={index === items.length - 1} className="rounded border border-navy-950/15 px-2 py-1 disabled:opacity-30">↓</button>
                      <Link href={`/admin/dashboard/founders/${item.id}`} className="rounded border border-navy-950/15 px-3 py-1 font-semibold hover:bg-navy-950/5">Edit</Link>
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
