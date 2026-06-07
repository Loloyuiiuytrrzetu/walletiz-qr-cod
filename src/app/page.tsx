import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-bordeaux-700 grid place-items-center text-white font-bold">W</div>
            <span className="font-display text-xl font-semibold">Walletiz</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-neutral-600 hover:text-neutral-900">Connexion</Link>
            <Link href="/signup" className="btn-bordeaux text-sm">Créer mon compte</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-bordeaux-700 font-medium mb-4">Cartes de fidélité digitales</p>
          <h1 className="font-display text-5xl md:text-6xl font-semibold leading-tight tracking-tight">
            Fidélisez vos clients. Sans plastique, sans appli à télécharger.
          </h1>
          <p className="mt-6 text-lg text-neutral-600">
            Walletiz remplace votre carte papier par une carte digitale dans Apple Wallet & Google Wallet.
            Programmez des notifications push, créez des offres, suivez vos clients.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/signup" className="btn-bordeaux">Démarrer gratuitement</Link>
            <Link href="/demo" className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-sm font-medium">Voir une démo</Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-6">
          {[
            { t: "Carte tampon ou points", d: "Choisissez votre mécanique. Personnalisez les couleurs, l'expiration, le style." },
            { t: "Notifications push programmables", d: "Campagnes ciblées, automatisations (inactivité, anniversaire, récompense prête)." },
            { t: "Dashboard temps réel", d: "Statistiques, historique d'activité, gestion des clients et des offres." },
          ].map((f) => (
            <div key={f.t} className="card p-6">
              <h3 className="font-display text-xl font-semibold">{f.t}</h3>
              <p className="mt-2 text-neutral-600 text-sm">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-neutral-100 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-neutral-500 flex justify-between">
          <span>© {new Date().getFullYear()} Walletiz</span>
          <span>Fait avec ♥</span>
        </div>
      </footer>
    </main>
  );
}
