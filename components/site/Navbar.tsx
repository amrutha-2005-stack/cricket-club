"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type SocialLinks = Partial<Record<"INSTAGRAM" | "FACEBOOK" | "YOUTUBE" | "WHATSAPP", string>>;

const NAV_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "About Us", href: "/#about" },
  { label: "Our Journey", href: "/#history" },
  { label: "Achievements", href: "/#achievements" },
  { label: "Tournaments", href: "/#tournaments" },
  {
    label: "Players",
    dropdown: [
      { label: "Current Squad", href: "/#current-players" },
      { label: "Legends", href: "/#former-players" },
    ],
  },
  {
    label: "Gallery",
    dropdown: [
      { label: "Winner Gallery", href: "/gallery" },
      { label: "Videos", href: "/#videos" },
    ],
  },
  { label: "Contact", href: "/#contact" },
] as const;

export default function Navbar({ socialLinks }: { socialLinks: SocialLinks }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const iconLinks: { key: keyof SocialLinks; label: string; path: string }[] = [
    { key: "INSTAGRAM", label: "Instagram", path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 2A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5zM17.8 6.2a1 1 0 1 1-1-1 1 1 0 0 1 1 1z" },
    { key: "FACEBOOK", label: "Facebook", path: "M15 3h3v4h-3c-1 0-1.5.5-1.5 1.5V11H18l-.5 4H13.5v9h-4v-9H7v-4h2.5V8c0-2.8 1.4-5 5-5z" },
    { key: "YOUTUBE", label: "YouTube", path: "M22.5 12a29 29 0 0 0-.46-5.32 2.78 2.78 0 0 0-2-2C18.2 4.2 12 4.2 12 4.2s-6.2 0-8 .48a2.78 2.78 0 0 0-2 2A29 29 0 0 0 1.5 12a29 29 0 0 0 .46 5.32 2.78 2.78 0 0 0 2 2c1.85.48 8 .48 8 .48s6.2 0 8-.48a2.78 2.78 0 0 0 2-2A29 29 0 0 0 22.5 12zm-13 3.6V8.4L15.5 12z" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        {/* Brand: logo + name + since 1994 */}
        <Link href="/#home" className="flex shrink-0 items-center gap-3">
          <Image src="/images/logo.jpg" alt="Bengaluru Friends logo" width={40} height={42} className="h-10 w-auto rounded-sm" />
          <span className="hidden sm:block leading-tight">
            <span className="block text-sm font-bold tracking-tight text-black">BENGALURU FRIENDS (R)</span>
            <span className="block text-[10px] font-semibold tracking-[1.5px] text-brand-gold">SINCE 1994</span>
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-6 text-sm font-semibold text-black">
          {NAV_LINKS.map((item) => (
            <li
              key={item.label}
              className="relative"
              onMouseEnter={() => "dropdown" in item && setOpenDropdown(item.label)}
              onMouseLeave={() => "dropdown" in item && setOpenDropdown(null)}
            >
              {"dropdown" in item ? (
                <>
                  <button className="flex items-center gap-1 py-2 hover:text-brand-gold transition-colors">
                    {item.label}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {openDropdown === item.label && (
                    <ul className="absolute left-0 top-full min-w-[180px] rounded-md border border-black/10 bg-white py-2 shadow-premium">
                      {item.dropdown.map((sub) => (
                        <li key={sub.label}>
                          <Link href={sub.href} className="block px-4 py-2 text-sm text-black hover:bg-black/5 hover:text-brand-gold">
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link href={item.href} className="block py-2 hover:text-brand-gold transition-colors">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2">
            {iconLinks
              .filter((i) => socialLinks[i.key])
              .map((i) => (
                <a
                  key={i.key}
                  href={socialLinks[i.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={i.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white hover:bg-brand-gold transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d={i.path} />
                  </svg>
                </a>
              ))}
          </div>
          <Link
            href="/admin/login"
            className="flex items-center gap-2 rounded-md bg-brand-gold px-4 py-2 text-sm font-bold text-white hover:bg-brand-golddark transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="11" width="14" height="9" rx="1" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            Admin Login
          </Link>
        </div>

        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="h-0.5 w-6 bg-black" />
          <span className="h-0.5 w-6 bg-black" />
          <span className="h-0.5 w-6 bg-black" />
        </button>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden border-t border-black/10 bg-white px-4 pb-4">
          <ul className="flex flex-col divide-y divide-black/10 text-black">
            {NAV_LINKS.map((item) => (
              <li key={item.label} className="py-2">
                {"dropdown" in item ? (
                  <details>
                    <summary className="cursor-pointer font-semibold">{item.label}</summary>
                    <ul className="pl-4 pt-2 flex flex-col gap-2">
                      {item.dropdown.map((sub) => (
                        <li key={sub.label}>
                          <Link href={sub.href} onClick={() => setMobileOpen(false)}>
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link href={item.href} className="font-semibold" onClick={() => setMobileOpen(false)}>
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2">
            {iconLinks
              .filter((i) => socialLinks[i.key])
              .map((i) => (
                <a
                  key={i.key}
                  href={socialLinks[i.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={i.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d={i.path} />
                  </svg>
                </a>
              ))}
          </div>
          <Link
            href="/admin/login"
            className="mt-4 inline-block rounded-md bg-brand-gold px-4 py-2 text-sm font-bold text-white"
          >
            Admin Login
          </Link>
        </div>
      )}
    </header>
  );
}
