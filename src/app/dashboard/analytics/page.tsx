import Topbar from "@/components/Topbar";
import { createClient } from "@/lib/supabase/server";

export default async function Analytics() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { data: business } = await sb.from("businesses").select("*").eq("owner_id", user!.id).single();

  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

  const [{ count: totalCustomers }, { count: scansWeek }, { count: rewardsMonth }] = await Promise.all([
    sb.from("customers").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    sb.from("activity").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("kind", "scan").gte("created_at", weekAgo),
    sb.from("activity").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("kind", "reward").gte("created_at", monthAgo),
  ]);

  const { data: recent } = await sb.from("activity").select("*, customers(first_name, last_name)").eq("business_id", business.id).order("created_at", { ascending: false }).limit(20);

  return (
    <>
      <Topbar crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Statistiques" }]} />
      <main className="p-8 max-w-6xl">
        <h1 className="font-display text-5xl font-semibold tracking-tight">Statistiques</h1>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat l="Clients totaux" v={totalCustomers ?? 0} />
          <Stat l="Scans (7j)" v={scansWeek ?? 0} />
          <Stat l="Récompenses (30j)" v={rewardsMonth ?? 0} />
        </div>
        <h2 className="font-display text-xl font-semibold mt-10">Activité récente</h2>
        <div className="mt-4 card divide-y divide-neutral-100">
          {(!recent || recent.length === 0) && <div className="p-6 text-sm text-neutral-500">Aucune activité.</div>}
          {recent?.map((a: any) => (
            <div key={a.id} className="p-4 flex items-center justify-between text-sm">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-xs mr-2">{a.kind}</span>
                {a.customers?.first_name || "Client"} {a.customers?.last_name || ""}
              </div>
              <div className="text-xs text-neutral-400">{new Date(a.created_at).toLocaleString("fr-FR")}</div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

function Stat({ l, v }: { l: string; v: number }) {
  return (
    <div className="stat-card">
      <div className="text-xs text-neutral-500">{l}</div>
      <div className="mt-2 font-display text-5xl font-semibold">{v}</div>
    </div>
  );
}
