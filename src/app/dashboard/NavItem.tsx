"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS: Record<string, string> = {
  home: "M3 11l9-8 9 8M5 9v11a1 1 0 001 1h4v-7h4v7h4a1 1 0 001-1V9",
  stamp: "M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4 7.2 17l.9-5.4-3.9-3.8 5.4-.8L12 2z",
  card: "M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 11h18",
  users: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  gift: "M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  chart: "M3 3v18h18M7 14l3-3 4 4 5-6",
};

export default function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  const pathname = usePathname();
  const active =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition mb-0.5 ${
        active
          ? "bg-[#fdf3ee] text-[#cd6b54] font-semibold"
          : "text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={ICONS[icon]} />
      </svg>
      {label}
    </Link>
  );
}
