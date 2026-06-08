"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export default function SignupPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const sb = createClient();
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error || !data.user) { setLoading(false); return setError(error?.message || "Erreur"); }

    // Si la confirmation email est activée dans Supabase, il n'y a PAS de session
    // à ce stade : inutile d'appeler l'onboarding (il renverrait 401) et surtout
    // ne pas rediriger vers /dashboard (ce qui repartait en boucle login).
    if (!data.session) {
      setLoading(false);
      return setError(
        "Compte créé. Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi."
      );
    }

    // Create business via API (uses service role to bypass RLS edge cases)
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: businessName, slug: slugify(businessName) }),
    });
    setLoading(false);
    if (!res.ok) return setError("Échec de création de l'établissement");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen grid place-items-center bg-neutral-50 px-4">
      <div className="card w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-bordeaux-700 grid place-items-center text-white font-bold">W</div>
          <span className="font-display text-xl font-semibold">Walletiz</span>
        </div>
        <h1 className="font-display text-3xl font-semibold">Créer mon compte</h1>
        <p className="text-sm text-neutral-500 mt-1">Lancez votre programme en 1 minute</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">Nom de l'établissement</label>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required
              placeholder="Café Lumière"
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-bordeaux-700 outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-bordeaux-700 outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">Mot de passe</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-bordeaux-700 outline-none" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="btn-bordeaux w-full">{loading ? "Création..." : "Créer mon compte"}</button>
        </form>

        <p className="text-sm text-neutral-500 mt-6 text-center">
          Déjà un compte ? <Link href="/login" className="text-bordeaux-700 font-medium">Se connecter</Link>
        </p>
      </div>
    </main>
  );
}
