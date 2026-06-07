import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/Topbar";

export default async function DashboardHome() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { data: business } = await sb.from("businesses").select("*").eq("owner_id", user!.id).single();

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isoToday = today.toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const [{ count: activeClients }, { count: stampsToday }, { count: scansToday }, { count: rewardsWeek }] = await Promise.all([
    sb.from("customers").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    sb.from("activity").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("kind", "stamp").gte("created_at", isoToday),
    sb.from("activity").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("kind", "scan").gte("created_at", isoToday),
    sb.from("activity").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("kind", "reward").gte("created_at", weekAgo),
  ]);

  const today_day = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  const stats = [
    { label: "Clients actifs", value: activeClients ?? 0, hint: "+0 ce mois" },
    { label: "Tampons aujourd'hui", value: stampsToday ?? 0, hint: "=0 vs hier" },
    { label: "Scans aujourd'hui", value: scansToday ?? 0, hint: "En temps réel" },
    { label: "Récompenses · sem.", value: rewardsWeek ?? 0, hint: "+0 vs sem. dernière" },
  ];

  const actions = [
    { icon: "⊞", title: "Scannez la carte de fidélité d'un client", cta: "Ouvrir le scanner", href: "/dashboard/scanner" },
    { icon: "💳", title: "Personnalisez votre carte de fidélité", cta: "Configurer la carte", href: "/dashboard/card" },
    { icon: "🏷️", title: "Créez et gérez vos offres exclusives", cta: "Voir mes offres", href: "/dashboard/offers" },
    { icon: "👥", title: "Invitez et fidélisez de nouveaux clients", cta: "Inviter un client", href: "/dashboard/clients?invite=1" },
  ];

  return (
    <>
      <Topbar crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Accueil" }]} />
      <main className="p-8 max-w-7xl">
        <h1 className="font-display text-5xl font-semibold tracking-tight">Accueil</h1>
        <p className="mt-2 text-neutral-500 capitalize">{today_day}</p>
        <p className="mt-1 text-neutral-700">
          Bonjour <strong>{business.name}</strong> — voici ce qui se passe chez <strong>{business.name}</strong> aujourd'hui.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="text-xs text-neutral-500">{s.label}</div>
              <div className="mt-2 font-display text-5xl font-semibold">{s.value}</div>
              <div className="mt-2 text-xs text-neutral-400">{s.hint}</div>
            </div>
          ))}
        </div>

        <h2 className="font-display text-2xl font-semibold mt-12">Boostez votre fidélité</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((a) => (
            <div key={a.title} className="card p-5 flex flex-col">
              <div className="h-32 rounded-xl bg-neutral-50 border border-neutral-100 grid place-items-center text-3xl">{a.icon}</div>
              <p className="mt-4 text-sm text-neutral-700 flex-1">{a.title}</p>
              <Link href={a.href} className="mt-4 w-full text-center bg-neutral-900 text-white rounded-xl py-2 text-sm hover:bg-neutral-800">{a.cta}</Link>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
