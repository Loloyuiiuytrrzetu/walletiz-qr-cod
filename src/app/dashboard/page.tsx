import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const { business, admin } = await getCurrentBusiness();

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const weekAgo = new Date(today.getTime() - 7 * 86400000).toISOString();

  const [
    { count: activeCustomers },
    { count: newCustomersMonth },
    { count: stampsToday },
    { count: scansToday },
    { count: rewardsWeek },
  ] = await Promise.all([
    admin.from("customers").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    admin.from("customers").select("id", { count: "exact", head: true }).eq("business_id", business.id).gte("created_at", monthStart),
    admin.from("activity").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("kind", "stamp").gte("created_at", todayStart),
    admin.from("activity").select("id", { count: "exact", head: true }).eq("business_id", business.id).gte("created_at", todayStart),
    admin.from("activity").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("kind", "reward").gte("created_at", weekAgo),
  ]);

  const dayLabel = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-ink">Accueil</h1>
          <p className="mt-1 text-sm text-neutral-500 capitalize">{dayLabel}</p>
          <p className="mt-1 text-sm text-neutral-600">
            Bonjour <b>{business.name}</b> — voici ce qui se passe chez vous aujourd'hui.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <KPI label="Clients actifs" value={activeCustomers ?? 0} sub={`+${newCustomersMonth ?? 0} ce mois`} />
        <KPI label="Tampons aujourd'hui" value={stampsToday ?? 0} sub="=0 vs hier" />
        <KPI label="Scans aujourd'hui" value={scansToday ?? 0} sub="En temps réel" live />
        <KPI label="Récompenses · sem" value={rewardsWeek ?? 0} sub="+0 vs sem. dernière" />
      </div>

      <h2 className="mt-12 text-2xl font-bold text-ink">Boostez votre fidélité</h2>

      <div className="mt-5 grid grid-cols-4 gap-4">
        <ActionCard title="Scannez la carte de fidélité d'un client" cta="Ouvrir le scanner" href="/dashboard/scanner" illustration="qr" />
        <ActionCard title="Personnalisez votre carte de fidélité" cta="Configurer la carte" href="/dashboard/card" illustration="card" />
        <ActionCard title="Créez et gérez vos offres exclusives" cta="Voir mes offres" href="/dashboard/offers" illustration="offers" />
        <ActionCard title="Invitez et fidélisez de nouveaux clients" cta="Inviter un client" href="/dashboard/clients" illustration="invite" />
      </div>
    </div>
  );
}

function KPI({ label, value, sub, live }: { label: string; value: any; sub: string; live?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 hover:shadow-sm transition">
      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-500">{label}</div>
        {live && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        )}
      </div>
      <div className="mt-2 text-5xl font-bold text-ink tracking-tight">{value}</div>
      <div className="mt-2 text-xs text-neutral-500">{sub}</div>
    </div>
  );
}

function ActionCard({ title, cta, href, illustration }: { title: string; cta: string; href: string; illustration: "qr" | "card" | "offers" | "invite" }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col">
      <div className="h-32 bg-neutral-50 rounded-xl flex items-center justify-center">
        <Illustration kind={illustration} />
      </div>
      <div className="mt-4 text-sm font-medium text-ink leading-snug min-h-[2.6rem]">{title}</div>
      <Link href={href} className="mt-4 w-full bg-neutral-900 text-white text-sm font-semibold py-2.5 rounded-xl text-center hover:bg-neutral-800">
        {cta}
      </Link>
    </div>
  );
}

function Illustration({ kind }: { kind: "qr" | "card" | "offers" | "invite" }) {
  if (kind === "qr") {
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0f0f10" strokeWidth="1.5" strokeLinecap="round">
        <path d="M3 7V4h3M3 17v3h3M21 7V4h-3M21 17v3h-3" />
        <rect x="7" y="7" width="4" height="4" />
        <rect x="13" y="7" width="4" height="4" />
        <rect x="7" y="13" width="4" height="4" />
      </svg>
    );
  }
  if (kind === "card") {
    return (
      <div className="bg-burgundy rounded-xl px-4 py-3 text-white shadow-md w-32">
        <div className="text-[9px] uppercase tracking-wider opacity-80">FIDELITE</div>
        <div className="mt-1.5 grid grid-cols-5 gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < 6 ? "bg-[#e8927c]" : "bg-white/30"}`} />
          ))}
        </div>
      </div>
    );
  }
  if (kind === "offers") {
    return (
      <div className="flex flex-col gap-1.5 w-36">
        <div className="bg-white border border-neutral-200 rounded-lg px-2 py-1.5 flex items-center justify-between text-[10px]">
          <span>● -20% sur croissant</span><span className="text-neutral-400">3j</span>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg px-2 py-1.5 flex items-center justify-between text-[10px]">
          <span>● Café offert × 10</span><span className="text-neutral-400">∞</span>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg px-2 py-1.5 flex items-center justify-between text-[10px]">
          <span>● Happy hour 17h</span><span className="text-neutral-400">2sem</span>
        </div>
      </div>
    );
  }
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0f0f10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="4" />
      <path d="M3 21v-1a6 6 0 0112 0v1" />
      <path d="M17 11v6M14 14h6" />
    </svg>
  );
}
