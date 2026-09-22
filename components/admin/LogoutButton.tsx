"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-md border border-white/15 py-2.5 text-sm font-semibold text-white/70 hover:bg-navy-800 hover:text-white transition-colors"
    >
      Log Out
    </button>
  );
}
