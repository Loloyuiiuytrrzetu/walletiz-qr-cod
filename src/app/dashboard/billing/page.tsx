import Topbar from "@/components/Topbar";

const PLANS = [
  { id: "gratuit", name: "Gratuit", price: "0€", features: ["5 clients max", "1 carte", "Notifications limitées"] },
  { id: "solo", name: "Solo", price: "29€/mois", features: ["Clients illimités", "Campagnes programmées", "Automatisations", "Historique d'activité"], featured: true },
  { id: "pro", name: "Pro", price: "79€/mois", features: ["Tout Solo", "Multi-établissements", "API & exports", "Support prioritaire"] },
];

export default function Billing() {
  return (
    <>
      <Topbar crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Plan & facturation" }]} />
      <main className="p-8 max-w-5xl">
        <h1 className="font-display text-5xl font-semibold tracking-tight">Plan & facturation</h1>
        <p className="mt-2 text-neutral-500">Choisissez le plan qui correspond à votre activité.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <div key={p.id} className={`card p-6 ${p.featured ? "border-bordeaux-700 border-2" : ""}`}>
              {p.featured && <span className="text-xs font-medium text-bordeaux-700">Recommandé</span>}
              <h3 className="font-display text-2xl font-semibold mt-1">{p.name}</h3>
              <div className="font-display text-3xl font-bold mt-2">{p.price}</div>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                {p.features.map((f) => <li key={f}>✓ {f}</li>)}
              </ul>
              <button className={`mt-6 w-full py-2.5 rounded-xl font-medium ${p.featured ? "btn-bordeaux" : "border border-neutral-200 hover:bg-neutral-50"}`}>
                {p.id === "gratuit" ? "Plan actuel" : "Passer à " + p.name}
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
