import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/Topbar";
import Link from "next/link";

export default async function ProgrammePage() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { data: business } = await sb.from("businesses").select("*").eq("owner_id", user!.id).single();
  const { data: card } = await sb.from("cards").select("*").eq("business_id", business.id).maybeSingle();

  const stampsGiven = 0; // could query activity
  const customersOnCard = 0;
  const rewardsWeek = 0;

  return (
    <>
      <Topbar crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Mon programme" }]} />
      <main className="p-8 max-w-6xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-5xl font-semibold tracking-tight">Mon programme</h1>
            <p className="mt-2 text-neutral-500">Composez votre fidélité — une mécanique principale, autant de compléments que vous voulez.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-neutral-100 text-xs font-medium">⌗ PLAN GRATUIT</span>
        </div>

        <h2 className="font-display text-xl font-semibold mt-10">Vos cartes de fidélité</h2>
        <p className="text-xs text-neutral-500">Chaque carte repose sur <strong>une</strong> mécanique de base : tampon ou points.</p>

        <div className="mt-3 flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-bordeaux-700 text-white text-sm font-medium">● Carte principale</span>
        </div>
        <p className="mt-2 text-xs text-neutral-500">Coupons, remise et QR sont rattachés à la carte sélectionnée.</p>

        <div className="mt-4 card p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="w-6 h-6 rounded-full bg-bordeaux-50 grid place-items-center">●</span>
                MÉCANIQUE DE BASE · CARTE PRINCIPALE
              </div>
              <div className="text-xs text-neutral-400 mt-1">● Une seule par carte</div>
              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm flex items-center gap-1.5">👋 Tampon</span>
                <span className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm flex items-center gap-1.5">⊕ Points</span>
              </div>
              <h3 className="mt-6 font-display text-3xl font-semibold">Carte tampon</h3>
              <p className="text-sm text-neutral-600 mt-1">Un tampon offert à chaque visite. La récompense se déclenche automatiquement une fois la carte complète.</p>
              <div className="mt-6 flex items-center gap-2">
                {Array.from({ length: card?.stamps_required ?? 8 }).map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-bordeaux-200" />
                ))}
                <div className="w-8 h-8 rounded-full bg-bordeaux-50 border-2 border-bordeaux-300 grid place-items-center text-bordeaux-700">★</div>
              </div>
              <p className="mt-3 text-sm text-neutral-600">
                Carte complète à <strong>{card?.stamps_required ?? 8} tampons</strong> — récompense : <strong>{card?.reward_label ?? "10% de réduction"}</strong>
              </p>
            </div>
            <div className="flex flex-col items-end gap-3 min-w-[200px]">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> ACTIVE
              </div>
              <Link href="/dashboard/card" className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs hover:bg-neutral-50 flex items-center gap-1.5">⚙ Configurer</Link>
              <div className="text-right">
                <div className="font-display text-4xl font-semibold">{stampsGiven}</div>
                <div className="text-xs text-neutral-400">Tampons donnés ce mois</div>
              </div>
              <div className="text-right">
                <div className="font-display text-4xl font-semibold">{customersOnCard}</div>
                <div className="text-xs text-neutral-400">Clients inscrits</div>
              </div>
              <div className="text-right">
                <div className="font-display text-4xl font-semibold">{rewardsWeek}</div>
                <div className="text-xs text-neutral-400">Récompenses cette semaine</div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="font-display text-xl font-semibold mt-10">Ajoutez des compléments</h2>
        <p className="text-xs text-neutral-500">S'ajoutent à la mécanique de base — activez ce que vous voulez.</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Coupons à durée limitée", "Récompense d'anniversaire", "Parrainage"].map((t) => (
            <div key={t} className="card p-5">
              <div className="text-sm font-medium">{t}</div>
              <p className="text-xs text-neutral-500 mt-1">Bientôt disponible</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
