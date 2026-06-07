"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const sb = createClient();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
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
        <h1 className="font-display text-3xl font-semibold">Connexion</h1>
        <p className="text-sm text-neutral-500 mt-1">Accédez à votre dashboard</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-bordeaux-700 outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">Mot de passe</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-bordeaux-700 outline-none" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="btn-bordeaux w-full">{loading ? "Connexion..." : "Se connecter"}</button>
        </form>

        <p className="text-sm text-neutral-500 mt-6 text-center">
          Pas de compte ? <Link href="/signup" className="text-bordeaux-700 font-medium">Créer un compte</Link>
        </p>
      </div>
    </main>
  );
}
