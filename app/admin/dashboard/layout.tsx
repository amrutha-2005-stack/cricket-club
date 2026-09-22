import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/admin/LogoutButton";

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "About / Site Settings", href: "/admin/dashboard/settings" },
  { label: "Founder / Owners", href: "/admin/dashboard/founders" },
  { label: "Achievements", href: "/admin/dashboard/achievements" },
  { label: "Tournaments", href: "/admin/dashboard/tournaments" },
  { label: "Sri Lanka Story", href: "/admin/dashboard/history" },
  { label: "Winner Gallery", href: "/admin/dashboard/gallery" },
  { label: "Videos", href: "/admin/dashboard/videos" },
  { label: "Old Players", href: "/admin/dashboard/former-players" },
  { label: "Present Players", href: "/admin/dashboard/current-players" },
  { label: "Events", href: "/admin/dashboard/events" },
  { label: "News", href: "/admin/dashboard/news" },
  { label: "Social Media", href: "/admin/dashboard/social" },
  { label: "Contact Messages", href: "/admin/dashboard/messages" },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">
      <aside className="hidden w-64 shrink-0 flex-col bg-navy-950 text-white lg:flex">
        <div className="flex items-center gap-3 p-5">
          <Image src="/images/logo.jpg" alt="Bengaluru Friends logo" width={36} height={38} className="h-9 w-auto rounded" />
          <span className="font-display text-sm font-bold">Admin Panel</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {SIDEBAR_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="block rounded-md px-3 py-2.5 text-sm text-white/80 hover:bg-navy-800 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}
