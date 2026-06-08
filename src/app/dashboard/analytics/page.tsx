import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
  if (!business) return null;

  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: acts } = await supabase
    .from("activity")
    .select("kind, created_at, amount")
    .eq("business_id", business.id)
    .gte("created_at", since)
    .order("created_at");

  const byDay: Record<string, { stamps: number; rewards: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    byDay[key] = { stamps: 0, rewards: 0 };
  }
  (acts || []).forEach((a: any) => {
    const key = a.created_at.slice(0, 10);
    if (!byDay[key]) byDay[key] = { stamps: 0, rewards: 0 };
    if (a.kind === "stamp") byDay[key].stamps += a.amount || 1;
    if (a.kind === "reward") byDay[key].rewards += 1;
  });

  const days = Object.entries(byDay);
  const max = Math.max(1, ...days.map(([, v]) => v.stamps));
  const totalStamps = days.reduce((s, [, v]) => s + v.stamps, 0);
  const totalRewards = days.reduce((s, [, v]) => s + v.rewards, 0);

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-ink">Analytics</h1>
      <p className="mt-1 text-sm text-neutral-500">Vue d'ensemble des 30 derniers jours.</p>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <KPI label="Tampons / scans" value={totalStamps} />
        <KPI label="Récompenses débloquées" value={totalRewards} />
        <KPI label="Visites moyennes / jour" value={(totalStamps / 30).toFixed(1)} />
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="text-sm font-semibold text-ink">Activité jour par jour</div>
        <div className="mt-5 flex items-end gap-1.5 h-44">
          {days.map(([d, v]) => (
            <div key={d} className="flex-1 flex flex-col items-center justify-end" title={`${d} — ${v.stamps} scans`}>
              <div
                className="w-full rounded-t bg-burgundy/70"
                style={{ height: `${(v.stamps / max) * 100}%`, minHeight: v.stamps > 0 ? 3 : 0 }}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-400">
          <span>{days[0]?.[0]}</span>
          <span>aujourd'hui</span>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-ink tracking-tight">{value}</div>
    </div>
  );
}
