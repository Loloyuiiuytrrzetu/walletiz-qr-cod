"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
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

        {step === "email" ? (
          <>
            <h1 className="mt-4 text-3xl font-bold">Connexion / Inscription</h1>
            <p className="mt-2 text-neutral-600">
              Entrez votre email. Vous recevrez un code à 6 chiffres pour vous connecter.
            </p>
            <form onSubmit={sendCode} className="mt-8 space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@example.com"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand focus:outline-none"
                />
              </div>
              {err && <div className="text-sm text-red-600">{err}</div>}
              <button
                disabled={loading || !email}
                className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:bg-brand-dark disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Recevoir mon code"}
              </button>
            </form>
            <p className="mt-6 text-xs text-neutral-500">
              Pas besoin de mot de passe. Si c'est votre première connexion, votre compte sera créé automatiquement.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-3xl font-bold">Entrez votre code</h1>
            <p className="mt-2 text-neutral-600">
              Code envoyé à <b>{email}</b>. Vérifiez votre boîte mail (et les spams).
            </p>
            <form onSubmit={verifyCode} className="mt-8 space-y-4">
              <div>
                <label className="text-sm font-medium">Code à 6 chiffres</label>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand focus:outline-none text-center text-2xl tracking-[0.5em] font-mono"
                />
              </div>
              {err && <div className="text-sm text-red-600">{err}</div>}
              <button
                disabled={loading || code.length !== 6}
                className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:bg-brand-dark disabled:opacity-50"
              >
                {loading ? "Vérification..." : "Se connecter"}
              </button>
            </form>
            <button
              onClick={() => { setStep("email"); setCode(""); setErr(null); }}
              className="mt-6 text-sm text-neutral-500 hover:text-black"
            >
              ← Changer d'email
            </button>
          </>
        )}
      </div>
    </main>
  );
}
