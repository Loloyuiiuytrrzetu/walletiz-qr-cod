"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "Erreur");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="auth-bg min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg2 overflow-hidden">
          <div className="px-8 pt-8 pb-2">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/maquette/assets/walletiz-logo.webp" alt="Walletiz" className="h-9 w-auto" />
              <div className="font-display font-bold text-lg text-ink">Walletiz</div>
            </div>
            <h1 className="mt-6 text-2xl font-bold text-ink">Bienvenue !</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Donnez un nom à votre commerce pour démarrer.
            </p>
          </div>
          <form onSubmit={onSubmit} className="px-8 pb-8 pt-4 space-y-4">
            <div>
              <label className="text-sm font-semibold text-ink">Nom du commerce</label>
              <input
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Café Lune"
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-burgundy focus:outline-none text-base"
              />
            </div>
            {err && (
              <div className="text-sm px-3 py-2.5 rounded-lg border bg-red-50 text-red-700 border-red-100">
                {err}
              </div>
            )}
            <button
              disabled={loading || !name.trim()}
              className="w-full bg-burgundy text-white py-3 rounded-xl font-semibold hover:bg-burgundy-dark disabled:opacity-50"
            >
              {loading ? "..." : "Continuer"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
