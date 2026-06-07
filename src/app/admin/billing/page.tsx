import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PLAN_PRICE: Record<string, number> = {
  gratuit: 0,
  solo: 19,
  pro: 49,
};

export default async function AdminBilling() {
  const admin = createAdminClient();
  const { data: businesses } = await admin
    .from("businesses")
    .select("id, name, plan, is_active, created_at");

  const counts: Record<string, number> = { gratuit: 0, solo: 0, pro: 0 };
  let mrr = 0;
  (businesses ?? []).forEach((b: any) => {
    counts[b.plan] = (counts[b.plan] || 0) + 1;
    if (b.is_active) mrr += PLAN_PRICE[b.plan] || 0;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Abonnements</h1>
      <p className="mt-1 text-neutral-400">Vue financière de la plateforme (calculs locaux, hors Stripe).</p>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <KPI label="MRR estimé" value={`${mrr} €`} accent />
        <KPI label="ARR" value={`${mrr * 12} €`} />
        <KPI label="Comptes solo" value={counts.solo} />
        <KPI label="Comptes pro" value={counts.pro} />
      </div>

      <div className="mt-10 rounded-2xl border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Restaurant</th>
              <th className="text-left px-5 py-3 font-medium">Plan</th>
              <th className="text-left px-5 py-3 font-medium">Prix</th>
              <th className="text-left px-5 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {businesses?.map((b: any) => (
              <tr key={b.id}>
                <td className="px-5 py-3 font-medium">{b.name}</td>
                <td className="px-5 py-3 capitalize">{b.plan}</td>
                <td className="px-5 py-3">{PLAN_PRICE[b.plan]} €/mois</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      b.is_active ? "bg-emerald-900/40 text-emerald-300" : "bg-red-900/40 text-red-300"
                    }`}
                  >
                    {b.is_active ? "actif" : "suspendu"}
                  </span>
                </td>
              </tr>
            ))}
            {(!businesses || businesses.length === 0) && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-neutral-500">Aucun abonné.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ label, value, accent }: { label: string; value: any; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border ${accent ? "border-brand bg-brand/10" : "border-neutral-800 bg-neutral-900/50"} px-5 py-4`}>
      <div className="text-xs uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
