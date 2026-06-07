"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Business = { name: string; logo_url: string | null; plan: string };

const programme = [
  { href: "/dashboard", label: "Accueil", icon: "🏠" },
  { href: "/dashboard/programme", label: "Mon programme", icon: "📋" },
  { href: "/dashboard/card", label: "Ma carte", icon: "💳" },
  { href: "/dashboard/clients", label: "Clients", icon: "👥" },
];
const marketing = [
  { href: "/dashboard/offers", label: "Mes offres", icon: "🏷️" },
  { href: "/dashboard/campaigns", label: "Campagnes", icon: "📣" },
  { href: "/dashboard/automations", label: "Automatisations", icon: "⚡" },
];
const analyse = [{ href: "/dashboard/analytics", label: "Statistiques", icon: "📊" }];

export default function Sidebar({ business, clientCount }: { business: Business; clientCount: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));

  const close = () => setOpen(false);

  const nav = (
    <>
      <div className="p-4 flex items-center gap-2 border-b border-neutral-100">
        <div className="w-8 h-8 rounded-lg bg-bordeaux-700 grid place-items-center text-white font-bold text-sm">
          {business.name.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-sm truncate flex-1">{business.name}</span>
        <button onClick={close} className="lg:hidden p-1 text-neutral-500" aria-label="Fermer">✕</button>
      </div>

      <div className="p-3">
        <Link href="/dashboard/scanner" onClick={close} className="btn-bordeaux w-full flex items-center justify-center gap-2">
          <span>⊞</span> Scanner
        </Link>
      </div>

      <nav className="px-2 flex-1 overflow-y-auto pb-4">
        <div className="section-label">Programme</div>
        {programme.map((l) => (
          <Link key={l.href} href={l.href} onClick={close} className={`sidebar-link ${isActive(l.href) ? "active" : ""}`}>
            <span className="w-4 text-center">{l.icon}</span> {l.label}
          </Link>
        ))}
        <div className="section-label">Marketing</div>
        {marketing.map((l) => (
          <Link key={l.href} href={l.href} onClick={close} className={`sidebar-link ${isActive(l.href) ? "active" : ""}`}>
            <span className="w-4 text-center">{l.icon}</span> {l.label}
          </Link>
        ))}
        <div className="section-label">Analyse</div>
        {analyse.map((l) => (
          <Link key={l.href} href={l.href} onClick={close} className={`sidebar-link ${isActive(l.href) ? "active" : ""}`}>
            <span className="w-4 text-center">{l.icon}</span> {l.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-neutral-100">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
          <span>Plan</span><span className="capitalize">{business.plan}</span>
        </div>
        <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
          <div className="h-full bg-bordeaux-700" style={{ width: `${Math.min(100, (clientCount / 5) * 100)}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-500 mt-2">
          <span>Clients</span><span>{clientCount} / 5</span>
        </div>
        {business.plan === "gratuit" && (
          <Link href="/dashboard/billing" onClick={close} className="mt-3 flex items-center justify-between text-sm px-3 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50">
            <span>↑ Passer à Solo</span><span>›</span>
          </Link>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-white border-b border-neutral-100 px-4 flex items-center justify-between">
        <button onClick={() => setOpen(true)} className="p-2 -ml-2" aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-bordeaux-700 grid place-items-center text-white text-xs font-bold">
            {business.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium truncate max-w-[160px]">{business.name}</span>
        </div>
        <Link href="/dashboard/scanner" className="p-2 -mr-2 text-bordeaux-700" aria-label="Scanner">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h7v7h-7z"/></svg>
        </Link>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-neutral-100 flex-col min-h-screen">
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col">
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
