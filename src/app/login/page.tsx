"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm text-neutral-500 hover:text-black">← Retour</Link>
        <h1 className="mt-4 text-3xl font-bold">Connexion</h1>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand focus:outline-none"
            />
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button
            disabled={loading}
            className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:bg-brand-dark disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-sm text-neutral-600">
          Pas encore de compte ? <Link href="/signup" className="text-brand font-medium">Créer un compte</Link>
        </p>
      </div>
    </main>
  );
}
