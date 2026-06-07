"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BusinessActions({ business }: { business: any }) {
  const router = useRouter();
  const [plan, setPlan] = useState(business.plan);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function call(action: string, body: any = {}) {
    setLoading(true);
    setMsg(null);
    const res = await fetch(`/api/admin/businesses/${business.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Erreur");
      return;
    }
    setMsg("Modifié ✓");
    router.refresh();
  }

  return (
    <div className="mt-10 grid md:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
        <div className="text-sm font-semibold">Plan d'abonnement</div>
        <div className="mt-4 flex gap-2">
          {["gratuit", "solo", "pro"].map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`px-4 py-2 rounded-full text-sm border capitalize ${
                plan === p
                  ? "bg-brand text-white border-brand"
                  : "bg-transparent border-neutral-700 text-neutral-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          disabled={loading || plan === business.plan}
          onClick={() => call("set_plan", { plan })}
          className="mt-5 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
        >
          Enregistrer le plan
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
        <div className="text-sm font-semibold">Statut du compte</div>
        {business.is_active ? (
          <>
            <textarea
              placeholder="Raison de la suspension (optionnel)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="mt-4 w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm"
            />
            <button
              disabled={loading}
              onClick={() => call("suspend", { reason })}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-40"
            >
              Suspendre ce compte
            </button>
          </>
        ) : (
          <button
            disabled={loading}
            onClick={() => call("reactivate")}
            className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-40"
          >
            Réactiver ce compte
          </button>
        )}
      </div>

      {msg && (
        <div className="md:col-span-2 text-sm text-neutral-400">{msg}</div>
      )}
    </div>
  );
}
