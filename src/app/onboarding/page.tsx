"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
    const { data: business, error } = await supabase
      .from("businesses")
      .insert({ owner_id: user.id, name, slug })
      .select()
      .single();
    if (error || !business) {
      setLoading(false);
      setErr(error?.message ?? "Erreur");
      return;
    }
    await supabase.from("cards").insert({ business_id: business.id });
    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold">Bienvenue !</h1>
        <p className="mt-2 text-neutral-600">
          Comment s'appelle votre commerce ?
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input
            required
            placeholder="Ex. Café Lune"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand focus:outline-none"
          />
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button
            disabled={loading || !name.trim()}
            className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:bg-brand-dark disabled:opacity-50"
          >
            {loading ? "..." : "Continuer"}
          </button>
        </form>
      </div>
    </main>
  );
}
