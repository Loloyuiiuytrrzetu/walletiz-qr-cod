import { getCurrentBusiness } from "@/lib/business";

export const dynamic = "force-dynamic";

const PLANS = [
  { v: "gratuit", price: "0 €", perks: ["5 clients max", "Carte de fidélité basique", "QR codes"] },
  { v: "solo", price: "19 €", perks: ["250 clients", "Mécaniques tampon + points", "Offres et campagnes push", "Personnalisation totale"] },
  { v: "pro", price: "49 €", perks: ["5000 clients", "Apple/Google Wallet", "Automatisations illimitées", "Support prioritaire"] },
];

export default async function BillingPage() {
  const { business } = await getCurrentBusiness();

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-ink">Abonnement</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Votre plan actuel : <span className="font-semibold capitalize text-ink">{business?.plan}</span>
      </p>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {PLANS.map((p) => {
          const current = business?.plan === p.v;
          return (
            <div key={p.v} className={`rounded-2xl border p-6 ${current ? "border-burgundy bg-burgundy/5" : "border-neutral-200 bg-white"}`}>
              <div className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{p.v}</div>
              <div className="mt-2 text-4xl font-bold text-ink">{p.price}<span className="text-base text-neutral-500 font-medium">/mois</span></div>
              <ul className="mt-4 space-y-1.5 text-sm text-neutral-700">
                {p.perks.map((perk) => <li key={perk}>✓ {perk}</li>)}
              </ul>
              <button
                disabled={current}
                className={`mt-5 w-full py-2.5 rounded-xl font-semibold text-sm ${
                  current
                    ? "bg-neutral-100 text-neutral-500 cursor-not-allowed"
                    : "bg-burgundy text-white hover:bg-burgundy-dark"
                }`}
              >
                {current ? "Plan actuel" : "Bientôt — Stripe"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
