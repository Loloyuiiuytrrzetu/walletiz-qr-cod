import Topbar from "@/components/Topbar";
import { createClient } from "@/lib/supabase/server";

const TRIGGERS = [
  { v: "signup", l: "À l'inscription", d: "Envoyée dès qu'un client s'inscrit à votre programme" },
  { v: "inactivity_30", l: "Inactivité 30 jours", d: "Relance les clients qui n'ont pas scanné depuis 30 jours" },
  { v: "birthday", l: "Anniversaire", d: "Message le jour de l'anniversaire du client" },
  { v: "reward_ready", l: "Récompense prête", d: "Quand un client atteint la récompense" },
];

export default async function AutomationsPage() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { data: business } = await sb.from("businesses").select("*").eq("owner_id", user!.id).single();
  const { data: automations } = await sb.from("automations").select("*").eq("business_id", business.id);

  const byTrigger = (t: string) => automations?.find((a: any) => a.trigger === t);

  return (
    <>
      <Topbar crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Automatisations" }]} />
      <main className="p-8 max-w-5xl">
        <h1 className="font-display text-5xl font-semibold tracking-tight">Automatisations</h1>
        <p className="mt-2 text-neutral-500">Déclencheurs automatiques pour fidéliser sans effort.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRIGGERS.map((t) => {
            const a = byTrigger(t.v);
            return (
              <div key={t.v} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{t.l}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{t.d}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a?.is_active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                    {a?.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                {a && <p className="mt-3 text-sm text-neutral-700">{a.message}</p>}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
