"use client";
export default function Topbar({ crumbs }: { crumbs: { label: string; href?: string }[] }) {
  return (
    <header className="hidden lg:flex h-14 border-b border-neutral-100 bg-white px-6 items-center justify-between">
      <nav className="text-sm text-neutral-500 flex items-center gap-2">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-neutral-300">›</span>}
            {c.href ? <a href={c.href} className="hover:text-neutral-900">{c.label}</a> : <span className="text-neutral-900">{c.label}</span>}
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <input placeholder="Rechercher un client..." className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 focus:border-bordeaux-700 outline-none w-64" />
        <button className="w-9 h-9 rounded-lg hover:bg-neutral-100 grid place-items-center" aria-label="Notifications">🔔</button>
      </div>
    </header>
  );
}
