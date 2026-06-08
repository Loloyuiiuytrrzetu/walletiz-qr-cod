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
  const [step, setStep] = useState<"form" | "code">("form");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Crée l'établissement puis ouvre le dashboard (appelé une fois la session active).
  async function finishOnboarding() {
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: businessName, slug: slugify(businessName) }),
    });
    if (!res.ok) { setLoading(false); return setError("Échec de création de l'établissement"); }
    router.push("/dashboard");
    router.refresh();
  }

  // Étape 1 : email + mot de passe → Supabase envoie un code à 6 chiffres.
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const sb = createClient();
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error || !data.user) { setLoading(false); return setError(error?.message || "Erreur"); }

    // Si la confirmation email est désactivée, la session existe déjà : on enchaîne.
    if (data.session) return finishOnboarding();

    // Sinon : un code à 6 chiffres a été envoyé par email → on passe à l'étape 2.
    setLoading(false);
    setStep("code");
    setInfo(`Un code à 6 chiffres a été envoyé à ${email}.`);
  }

  // Étape 2 : vérification du code → crée la session → onboarding.
  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const sb = createClient();
    // Selon la config Supabase, le code de signup se vérifie avec "signup" ou "email".
    // On tente "signup" puis on retombe sur "email" pour éviter un faux négatif.
    let { data, error } = await sb.auth.verifyOtp({ email, token: code.trim(), type: "signup" });
    if (error) {
      ({ data, error } = await sb.auth.verifyOtp({ email, token: code.trim(), type: "email" }));
    }
    if (error || !data.session) {
      setLoading(false);
      return setError(error?.message || "Code invalide ou expiré.");
    }
    await finishOnboarding();
  }

  // Renvoyer un nouveau code.
  async function onResend() {
    setError(null);
    setInfo(null);
    const sb = createClient();
    const { error } = await sb.auth.resend({ type: "signup", email });
    if (error) return setError(error.message);
    setInfo("Nouveau code envoyé.");
  }

  return (
    <main className="min-h-screen grid place-items-center bg-neutral-50 px-4">
      <div className="card w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-bordeaux-700 grid place-items-center text-white font-bold">W</div>
          <span className="font-display text-xl font-semibold">Walletiz</span>
        </div>

        {step === "form" ? (
          <>
            <h1 className="font-display text-3xl font-semibold">Créer mon compte</h1>
            <p className="text-sm text-neutral-500 mt-1">Lancez votre programme en 1 minute</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">Nom de l&apos;établissement</label>
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
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-semibold">Vérifie ton email</h1>
            <p className="text-sm text-neutral-500 mt-1">{info ?? "Saisis le code reçu par email."}</p>

            <form onSubmit={onVerify} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">Code à 6 chiffres</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoFocus
                  placeholder="••••••"
                  className="mt-1 w-full px-3 py-3 rounded-xl border border-neutral-200 focus:border-bordeaux-700 outline-none text-center text-2xl tracking-[0.5em] font-semibold" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button disabled={loading || code.length < 6} className="btn-bordeaux w-full">
                {loading ? "Vérification..." : "Vérifier et continuer"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <button onClick={() => { setStep("form"); setError(null); setInfo(null); }} className="text-neutral-500 hover:text-neutral-800">
                ← Modifier
              </button>
              <button onClick={onResend} className="text-bordeaux-700 font-medium">Renvoyer le code</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
