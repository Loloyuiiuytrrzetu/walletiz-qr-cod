"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Campaign = {
  id: string; title: string; message: string; audience: string; status: string;
  scheduled_at: string | null; sent_at: string | null; sent_count: number | null;
};

export default function CampaignsManager({ initial, businessId }: { initial: Campaign[]; businessId: string }) {
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState({ title: "", message: "", audience: "all", scheduled_at: "", link_url: "" });
  const [busy, setBusy] = useState(false);

  async function schedule(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const sb = createClient();
    const isScheduled = !!form.scheduled_at;
    const { data } = await sb.from("campaigns").insert({
      business_id: businessId,
      title: form.title,
      message: form.message,
      audience: form.audience,
      link_url: form.link_url || null,
      scheduled_at: isScheduled ? new Date(form.scheduled_at).toISOString() : null,
      status: isScheduled ? "scheduled" : "draft",
    }).select().single();
    if (data) setItems((it) => [data as Campaign, ...it]);
    setForm({ title: "", message: "", audience: "all", scheduled_at: "", link_url: "" });
    setBusy(false);
  }

  async function sendNow(id: string) {
    if (!confirm("Envoyer maintenant ?")) return;
    const res = await fetch("/api/campaigns/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campaign_id: id }) });
    const j = await res.json();
    if (j.ok) {
      setItems((it) => it.map((x) => (x.id === id ? { ...x, status: "sent", sent_at: new Date().toISOString(), sent_count: j.sent } : x)));
    } else {
      alert(j.error || "Erreur");
    }
  }

  return (
    <>
      <form onSubmit={schedule} className="mt-8 card p-6 space-y-4">
        <h2 className="font-display text-xl font-semibold">Nouvelle campagne</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input required placeholder="Titre de la notification" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-bordeaux-700 outline-none" />
          <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}
            className="px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-bordeaux-700 outline-none">
            <option value="all">Tous les clients</option>
            <option value="active">Clients actifs</option>
            <option value="inactive">Clients inactifs</option>
          </select>
        </div>
        <textarea required placeholder="Votre message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={3} className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-bordeaux-700 outline-none" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="url" placeholder="URL (optionnel)" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })}
            className="px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-bordeaux-700 outline-none" />
          <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
            className="px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-bordeaux-700 outline-none" />
        </div>
        <p className="text-xs text-neutral-500">Laissez la date vide pour enregistrer comme brouillon, ou programmez l'envoi.</p>
        <button disabled={busy} className="btn-bordeaux">{busy ? "..." : "Créer la campagne"}</button>
      </form>

      <div className="mt-8 space-y-3">
        {items.length === 0 && <p className="text-sm text-neutral-500 py-8">Aucune campagne pour l'instant.</p>}
        {items.map((c) => (
          <div key={c.id} className="card p-5 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <StatusPill status={c.status} />
                <span className="text-xs text-neutral-500">Audience: {c.audience}</span>
              </div>
              <h3 className="font-medium mt-2">{c.title}</h3>
              <p className="text-sm text-neutral-600 mt-1">{c.message}</p>
              <div className="text-xs text-neutral-400 mt-2">
                {c.sent_at ? `Envoyée le ${new Date(c.sent_at).toLocaleString("fr-FR")} · ${c.sent_count ?? 0} envois`
                  : c.scheduled_at ? `Programmée pour ${new Date(c.scheduled_at).toLocaleString("fr-FR")}`
                  : "Brouillon"}
              </div>
            </div>
            {c.status !== "sent" && (
              <button onClick={() => sendNow(c.id)} className="px-3 py-1.5 rounded-lg border border-bordeaux-700 text-bordeaux-700 text-sm hover:bg-bordeaux-50">
                Envoyer maintenant
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-700",
    scheduled: "bg-blue-50 text-blue-700",
    sending: "bg-amber-50 text-amber-700",
    sent: "bg-emerald-50 text-emerald-700",
    failed: "bg-red-50 text-red-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || ""}`}>{status}</span>;
}
