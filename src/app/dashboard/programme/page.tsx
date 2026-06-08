import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProgrammePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: business } = await supabase.from("businesses").select("id, plan").eq("owner_id", user.id).single();
  if (!business) return null;
  const { data: card } = await supabase.from("cards").select("*").eq("business_id", business.id).single();

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const weekAgo = new Date(today.getTime() - 7 * 86400000).toISOString();

  const [{ count: stampsThisMonth }, { count: clientsCount }, { count: rewardsThisWeek }] = await Promise.all([
    supabase.from("activity").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("kind", "stamp").gte("created_at", monthStart),
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("activity").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("kind", "reward").gte("created_at", weekAgo),
  ]);

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-ink">Mon programme</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Composez votre fidélité — une mécanique principale, autant de compléments que vous voulez.
          </p>
        </div>
        <div className="text-xs uppercase tracking-wider text-burgundy font-semibold flex items-center gap-1.5">
          ✦ PLAN {business.plan.toUpperCase()}
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-ink">Vos cartes de fidélité</h2>
      <p className="text-xs text-neutral-500">Chaque carte repose sur une mécanique de base : tampon ou points.</p>

      <div className="mt-3 flex gap-2">
        <span className="px-3.5 py-1.5 rounded-full bg-burgundy/10 text-burgundy text-sm font-medium">● Carte principale</span>
      </div>

      <p className="mt-3 text-xs text-neutral-500">Coupons, remise et QR sont rattachés à la carte sélectionnée.</p>

      <div className="mt-6 bg-white rounded-2xl border border-neutral-200 p-7">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-2">
              MÉCANIQUE DE BASE · CARTE PRINCIPALE
              <span className="text-burgundy">● Une seule par carte</span>
            </div>
            <h3 className="mt-3 text-2xl font-bold text-ink">
              {card?.mechanic === "points" ? "Carte points" : "Carte tampon"}
            </h3>
            <p className="mt-1 text-sm text-neutral-600 max-w-md">
              {card?.mechanic === "points"
                ? `${card?.points_per_euro ?? 1} pt par € dépensé. La récompense se débloque à ${card?.points_for_reward ?? 100} points.`
                : `Un tampon offert à chaque visite. La récompense se déclenche automatiquement une fois la carte complète.`}
            </p>
            {card?.mechanic === "stamp" && (
              <div className="mt-5 flex items-center gap-1.5">
                {Array.from({ length: card?.stamps_required ?? 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full border-2 ${
                      i < Math.floor((card?.stamps_required ?? 10) * 0.4)
                        ? "bg-burgundy border-burgundy"
                        : "border-neutral-200"
                    }`}
                  />
                ))}
                <div className="ml-3 w-9 h-9 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-300">+</div>
              </div>
            )}
            <p className="mt-4 text-sm text-neutral-600">
              Carte complète à <b>{card?.stamps_required ?? 10} tampons</b> — récompense : <b>{card?.reward_label}</b>
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-2">
              <span className="px-3 py-1.5 rounded-full bg-neutral-100 text-sm flex items-center gap-1.5">● Tampon</span>
              <span className="px-3 py-1.5 rounded-full bg-neutral-100 text-sm flex items-center gap-1.5 text-neutral-400">○ Points</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ACTIVE
              </span>
              <Link href="/dashboard/card" className="text-xs font-semibold text-neutral-700 px-3 py-1.5 border border-neutral-200 rounded-full hover:bg-neutral-50">⚙️ Configurer</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6 border-t border-neutral-100 pt-6">
          <BigKPI value={stampsThisMonth ?? 0} label="Tampons donnés ce mois" />
          <BigKPI value={clientsCount ?? 0} label="Clients inscrits" />
          <BigKPI value={rewardsThisWeek ?? 0} label="Récompenses cette semaine" />
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-semibold text-ink">Ajoutez des compléments</h3>
        <p className="text-xs text-neutral-500">S'ajoutent à la mécanique de base — activez ce que vous voulez.</p>

        <div className="mt-4 grid grid-cols-3 gap-4">
          {COMPLEMENTS.map((c) => (
            <div key={c.title} className="bg-white rounded-2xl border border-neutral-200 p-5">
              <div className="text-2xl">{c.emoji}</div>
              <div className="mt-3 font-semibold text-ink">{c.title}</div>
              <div className="text-xs text-neutral-500 mt-1">{c.sub}</div>
              <button disabled className="mt-4 w-full bg-neutral-100 text-neutral-400 text-sm font-medium py-2 rounded-lg cursor-not-allowed">
                Bientôt disponible
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const COMPLEMENTS = [
  { emoji: "🎂", title: "Bonus anniversaire", sub: "Un cadeau offert chaque année." },
  { emoji: "👋", title: "Bienvenue", sub: "Un cadeau dès l'inscription." },
  { emoji: "🔥", title: "Streak hebdo", sub: "Récompense pour visites régulières." },
];

function BigKPI({ value, label }: { value: any; label: string }) {
  return (
    <div>
      <div className="text-5xl font-bold text-ink tracking-tight">{value}</div>
      <div className="mt-2 text-xs text-neutral-500">{label}</div>
    </div>
  );
}
