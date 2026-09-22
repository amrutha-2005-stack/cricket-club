"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-md rounded-xl bg-navy-900 p-8 text-white shadow-premium">
        <Image src="/images/logo.jpg" alt="Bengaluru Friends logo" width={56} height={58} className="mb-4 h-14 w-auto rounded" />
        <h1 className="font-display text-2xl font-extrabold">Admin Login</h1>
        <p className="mt-1 text-sm text-white/50">Sign in to manage the Bengaluru Friends website.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-white/50">Email</label>
            <input name="email" type="email" required autoComplete="username" className="w-full rounded-md bg-navy-950 px-3 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-brand-gold" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-white/50">Password</label>
            <input name="password" type="password" required autoComplete="current-password" className="w-full rounded-md bg-navy-950 px-3 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-brand-gold" />
          </div>

          <button type="submit" disabled={loading} className="mt-2 rounded-md bg-brand-gold py-3 text-sm font-bold text-navy-950 hover:bg-brand-golddark transition-colors disabled:opacity-60">
            {loading ? "Signing in…" : "Log In"}
          </button>

          {error && <p className="rounded-md bg-red-500/15 px-3 py-2 text-sm text-red-300">{error}</p>}
        </form>
      </div>
    </div>
  );
}
