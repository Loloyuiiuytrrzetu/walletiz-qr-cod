import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="font-semibold text-xl">
          <span className="text-brand">●</span> Fidelity
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-neutral-700 hover:text-black">Connexion</Link>
          <Link href="/signup" className="bg-brand text-white px-4 py-2 rounded-full hover:bg-brand-dark">
            Démarrer
          </Link>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            La carte de fidélité <span className="text-brand">digitale</span>
            <br />qui fait revenir vos clients.
          </h1>
          <p className="mt-6 text-lg text-neutral-600">
            Créez votre programme de fidélité en 2 minutes. Tampons ou points,
            QR code pour vos clients, scanner en caisse. Sans application à installer.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/signup" className="bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand-dark">
              Créer mon programme gratuit
            </Link>
            <Link href="#features" className="px-6 py-3 rounded-full border border-neutral-300 hover:border-neutral-500">
              Voir les fonctionnalités
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="bg-brand text-white rounded-3xl p-8 shadow-2xl rotate-2">
            <div className="text-sm opacity-80">Café Lune</div>
            <div className="mt-2 text-2xl font-semibold">Marie Dupont</div>
            <div className="mt-8 grid grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-full border-2 ${
                    i < 7 ? "bg-white border-white" : "border-white/40"
                  }`}
                />
              ))}
            </div>
            <div className="mt-6 text-sm opacity-90">7 / 10 — Plus que 3 pour un café offert !</div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            { t: "Tampons ou points", d: "Choisissez la mécanique qui colle à votre commerce." },
            { t: "QR code unique", d: "Chaque client a son QR. Scannez en caisse, c'est instantané." },
            { t: "Aucune app à installer", d: "Vos clients accèdent à leur carte via un simple lien." },
          ].map((f) => (
            <div key={f.t} className="p-6 rounded-2xl border border-neutral-200">
              <div className="text-brand text-2xl">◆</div>
              <div className="mt-3 font-semibold text-lg">{f.t}</div>
              <div className="mt-1 text-neutral-600">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Fidelity — Fait avec soin.
      </footer>
    </main>
  );
}
