"use client";

import { useState, FormEvent } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
    };

    if (!data.name || !data.email || !data.message) {
      setStatus("error");
      setErrorMsg("Name, email and message are required.");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="reveal rounded-xl bg-navy-900 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-white/50">Name</label>
          <input name="name" required className="w-full rounded-md bg-navy-950 px-3 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-brand-gold" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-white/50">Phone</label>
          <input name="phone" className="w-full rounded-md bg-navy-950 px-3 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-brand-gold" />
        </div>
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-white/50">Email</label>
        <input name="email" type="email" required className="w-full rounded-md bg-navy-950 px-3 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-brand-gold" />
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-white/50">Message</label>
        <textarea name="message" required rows={4} className="w-full rounded-md bg-navy-950 px-3 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-brand-gold" />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 w-full rounded-md bg-brand-gold py-3 text-sm font-bold text-navy-950 hover:bg-brand-golddark transition-colors disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>

      {status === "success" && (
        <p className="mt-3 rounded-md bg-emerald-500/15 px-3 py-2 text-sm text-emerald-300">
          Thanks — your message has been sent.
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 rounded-md bg-red-500/15 px-3 py-2 text-sm text-red-300">{errorMsg}</p>
      )}
    </form>
  );
}
