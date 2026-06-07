import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const admin = createAdminClient();

  const [
    { count: businessCount },
    { count: activeBusinessCount },
    { count: customerCount },
    { count: activityCount },
    { data: planBreakdown },
    { data: recentBusinesses },
  ] = await Promise.all([
    admin.from("businesses").select("id", { count: "exact", head: true }),
    admin.from("businesses").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin.from("customers").select("id", { count: "exact", head: true }),
    admin.from("activity").select("id", { count: "exact", head: true }),
    admin.from("businesses").select("plan"),
    admin
      .from("businesses")
      .select("id, name, plan, is_active, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const plans: Record<string, number> = {};
  (planBreakdown as any[] | null)?.forEach((b) => {
    plans[b.plan] = (plans[b.plan] || 0) + 1;
  });

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-brand">Console</div>
          <h1 className="mt-1 text-3xl font-bold">Vue d'ensemble</h1>
          <p className="mt-1 text-neutral-400">Pilotage de la plateforme Fidelity.</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <KPI label="Restaurants" value={businessCount ?? 0} />
        <KPI label="Actifs" value={activeBusinessCount ?? 0} accent />
        <KPI label="Clients" value={customerCount ?? 0} />
        <KPI label="Visites" value={activityCount ?? 0} />
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-6">
        <Panel title="Répartition des plans">
          <div className="space-y-3">
            {["gratuit", "solo", "pro"].map((p) => (
              <div key={p} className="flex items-center justify-between">
                <div className="capitalize text-neutral-300">{p}</div>
                <div className="font-semibold">{plans[p] || 0}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Derniers inscrits">
          <div className="divide-y divide-neutral-800">
            {(!recentBusinesses || recentBusinesses.length === 0) && (
              <div className="text-sm text-neutral-500 py-4">Aucun restaurant inscrit.</div>
            )}
            {recentBusinesses?.map((b: any) => (
              <div key={b.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{b.name}</div>
                  <div className="text-xs text-neutral-500">
                    {new Date(b.created_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide px-2 py-1 rounded-full bg-neutral-800">
                    {b.plan}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      b.is_active ? "bg-emerald-900/40 text-emerald-300" : "bg-red-900/40 text-red-300"
                    }`}
                  >
                    {b.is_active ? "actif" : "suspendu"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function KPI({ label, value, accent }: { label: string; value: any; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border ${accent ? "border-brand bg-brand/10" : "border-neutral-800 bg-neutral-900/50"} px-5 py-4`}>
      <div className="text-xs uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="text-sm font-semibold text-neutral-200">{title}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
