"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";
type OtpStep = "email" | "code";

export default function AuthCard({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [useOtp, setUseOtp] = useState(false);
  const [otpStep, setOtpStep] = useState<OtpStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function resetMessages() { setErr(null); setInfo(null); }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    const supabase = createClient();
    const action =
      mode === "signup"
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password });
    const { error } = await action;
    setLoading(false);
    if (error) {
      setErr(translate(error.message));
      return;
    }
    if (mode === "signup") {
      setInfo("Compte créé. Vérifiez votre email pour confirmer votre inscription.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: mode === "signup" },
    });
    setLoading(false);
    if (error) { setErr(translate(error.message)); return; }
    setOtpStep("code");
    setInfo("Code envoyé. Vérifiez votre email (et vos spams).");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    setLoading(false);
    if (error) { setErr(translate(error.message)); return; }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="auth-bg min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm">
          ← Retour à l'accueil
        </Link>

        <div className="mt-6 bg-white rounded-2xl shadow-lg2 overflow-hidden">
          <div className="px-8 pt-8 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-burgundy flex items-center justify-center text-white text-sm font-bold">W</div>
              <div className="font-display font-bold text-lg text-ink">Walletiz</div>
            </div>
            <h1 className="mt-6 text-2xl font-bold text-ink">
              {mode === "login" ? "Connectez-vous" : "Créer votre compte"}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {mode === "login"
                ? "Accédez à votre dashboard Walletiz."
                : "Démarrez votre programme de fidélité en 2 minutes."}
            </p>

            <div className="mt-6 grid grid-cols-2 bg-neutral-100 rounded-full p-1 text-sm">
              <button
                onClick={() => { setMode("login"); resetMessages(); setUseOtp(false); setOtpStep("email"); }}
                className={`py-2 rounded-full font-medium transition ${
                  mode === "login" ? "bg-white shadow-sm text-ink" : "text-neutral-500"
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => { setMode("signup"); resetMessages(); setUseOtp(false); setOtpStep("email"); }}
                className={`py-2 rounded-full font-medium transition ${
                  mode === "signup" ? "bg-white shadow-sm text-ink" : "text-neutral-500"
                }`}
              >
                Inscription
              </button>
            </div>
          </div>

          <div className="px-8 py-6">
            {!useOtp ? (
              <form onSubmit={handlePassword} className="space-y-4">
                <Field label="Email">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@example.com"
                    className="input"
                  />
                </Field>
                <Field
                  label="Mot de passe"
                  hint={mode === "signup" ? "Minimum 6 caractères" : undefined}
                >
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                  />
                </Field>
                {err && <Alert kind="error">{err}</Alert>}
                {info && <Alert kind="info">{info}</Alert>}
                <button
                  disabled={loading}
                  className="w-full bg-burgundy text-white py-3 rounded-xl font-semibold hover:bg-burgundy-dark transition disabled:opacity-50"
                >
                  {loading
                    ? "..."
                    : mode === "signup" ? "Créer mon compte" : "Se connecter"}
                </button>
              </form>
            ) : otpStep === "email" ? (
              <form onSubmit={sendOtp} className="space-y-4">
                <Field label="Email">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@example.com"
                    className="input"
                  />
                </Field>
                {err && <Alert kind="error">{err}</Alert>}
                <button
                  disabled={loading || !email}
                  className="w-full bg-burgundy text-white py-3 rounded-xl font-semibold hover:bg-burgundy-dark transition disabled:opacity-50"
                >
                  {loading ? "Envoi..." : "Recevoir un code"}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-4">
                <div className="text-sm text-neutral-500">
                  Code à 6 chiffres envoyé à <b className="text-ink">{email}</b>
                </div>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full px-4 py-4 rounded-xl border border-neutral-300 focus:border-burgundy focus:outline-none text-center text-2xl tracking-[0.5em] font-mono"
                />
                {err && <Alert kind="error">{err}</Alert>}
                {info && <Alert kind="info">{info}</Alert>}
                <button
                  disabled={loading || code.length !== 6}
                  className="w-full bg-burgundy text-white py-3 rounded-xl font-semibold hover:bg-burgundy-dark transition disabled:opacity-50"
                >
                  {loading ? "Vérification..." : "Confirmer"}
                </button>
                <button
                  type="button"
                  onClick={() => { setOtpStep("email"); setCode(""); resetMessages(); }}
                  className="w-full text-sm text-neutral-500 hover:text-ink"
                >
                  ← Changer d'email
                </button>
              </form>
            )}

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => { setUseOtp((v) => !v); setOtpStep("email"); resetMessages(); }}
                className="text-sm text-burgundy hover:underline font-medium"
              >
                {useOtp
                  ? "Utiliser un mot de passe"
                  : "Connexion par code à 6 chiffres"}
              </button>
            </div>
          </div>

          <div className="bg-neutral-50 border-t border-neutral-100 px-8 py-4 text-xs text-neutral-500 text-center">
            En continuant vous acceptez nos conditions d'utilisation.
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.85rem 1rem;
          border-radius: 12px;
          border: 1px solid #e5e5e5;
          background: white;
          font-size: 15px;
          transition: border-color 0.15s;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #7a1232;
          box-shadow: 0 0 0 3px rgba(122, 18, 50, 0.08);
        }
      `}</style>
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-semibold text-ink">{label}</label>
        {hint && <span className="text-xs text-neutral-400">{hint}</span>}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Alert({ kind, children }: { kind: "error" | "info"; children: React.ReactNode }) {
  const styles = kind === "error"
    ? "bg-red-50 text-red-700 border-red-100"
    : "bg-emerald-50 text-emerald-800 border-emerald-100";
  return (
    <div className={`text-sm px-3 py-2.5 rounded-lg border ${styles}`}>{children}</div>
  );
}

function translate(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return "Email ou mot de passe incorrect.";
  if (/user already registered/i.test(msg)) return "Cet email est déjà utilisé. Connectez-vous.";
  if (/email rate limit/i.test(msg)) return "Trop de tentatives. Réessayez dans quelques minutes.";
  if (/invalid token/i.test(msg)) return "Code invalide ou expiré.";
  if (/password should be at least/i.test(msg)) return "Le mot de passe doit faire au moins 6 caractères.";
  return msg;
}
