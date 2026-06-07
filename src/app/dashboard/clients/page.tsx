import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/Topbar";
import Link from "next/link";

export default async function ClientsPage() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { data: business } = await sb.from("businesses").select("*").eq("owner_id", user!.id).single();

  const { data: customers, count } = await sb
    .from("customers")
    .select("*, customer_cards(stamps,points,last_visit_at)", { count: "exact" })
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  const active = (customers || []).filter((c: any) => c.customer_cards?.[0]?.last_visit_at).length;

  return (
    <>
      <Topbar crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Clients" }]} />
      <main className="p-8 max-w-7xl">
        <h1 className="font-display text-5xl font-semibold tracking-tight">Clients</h1>
        <p className="mt-2 text-neutral-500">{count ?? 0} client{(count ?? 0) > 1 ? "s" : ""} enregistré{(count ?? 0) > 1 ? "s" : ""}</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-2 text-xs text-neutral-500"><span className="w-2 h-2 rounded-full bg-bordeaux-700" /> TOTAL CLIENTS</div>
            <div className="mt-2 font-display text-5xl font-semibold">{count ?? 0}</div>
            <div className="mt-2 text-xs text-neutral-400">enregistrés</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-xs text-neutral-500"><span className="w-2 h-2 rounded-full bg-emerald-500" /> ACTIFS</div>
            <div className="mt-2 font-display text-5xl font-semibold">{active}</div>
            <div className="mt-2 text-xs text-neutral-400">en cours</div>
          </div>
        </div>

        <div className="mt-8 card p-4">
          <div className="flex items-center justify-between gap-3">
            <select className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm">
              <option>Tous ({count ?? 0})</option>
              <option>Actifs</option>
              <option>Inactifs</option>
            </select>
            <input placeholder="Rechercher..." className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm w-64" />
          </div>

          {!customers || customers.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-4xl">👥</div>
              <p className="mt-3 font-medium">Aucun client trouvé</p>
              <p className="text-sm text-neutral-500">Essayez une autre recherche</p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-neutral-100">
              {customers.map((c: any) => (
                <li key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.first_name || "Client"} {c.last_name || ""}</div>
                    <div className="text-xs text-neutral-500">{c.email || c.phone || c.qr_code.slice(0, 8)}</div>
                  </div>
                  <Link href={`/dashboard/clients/${c.id}`} className="text-sm text-bordeaux-700 hover:underline">Voir →</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 card p-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-bordeaux-50 text-bordeaux-700 font-semibold">SOLO</span>
            <span className="font-medium">Historique d'activité</span>
          </div>
          <p className="mt-2 text-sm text-neutral-600">Consultez chaque évènement tampon, récompense et visite sur l'ensemble de vos clients.</p>
        </div>
      </main>
    </>
  );
}
