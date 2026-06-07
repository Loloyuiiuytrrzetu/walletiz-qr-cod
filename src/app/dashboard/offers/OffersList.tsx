"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Offer = { id: string; title: string; description: string | null; discount_label: string | null; ends_at: string | null; is_active: boolean };

export default function OffersList({ initial, businessId }: { initial: Offer[]; businessId: string }) {
  const [offers, setOffers] = useState(initial);
  const [form, setForm] = useState({ title: "", discount_label: "", description: "" });
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const sb = createClient();
    const { data } = await sb.from("offers").insert({ ...form, business_id: businessId }).select().single();
    if (data) setOffers((o) => [data as Offer, ...o]);
    setForm({ title: "", discount_label: "", description: "" });
    setBusy(false);
  }

  async function toggle(id: string, val: boolean) {
    const sb = createClient();
    await sb.from("offers").update({ is_active: val }).eq("id", id);
    setOffers((o) => o.map((x) => (x.id === id ? { ...x, is_active: val } : x)));
  }

  return (
    <>
      <form onSubmit={add} className="mt-8 card p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input required placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="px-3 py-2 rounded-lg border border-neutral-200 outline-none focus:border-bordeaux-700" />
        <input placeholder="-20% / Café offert" value={form.discount_label} onChange={(e) => setForm({ ...form, discount_label: e.target.value })}
          className="px-3 py-2 rounded-lg border border-neutral-200 outline-none focus:border-bordeaux-700" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="px-3 py-2 rounded-lg border border-neutral-200 outline-none focus:border-bordeaux-700" />
        <button disabled={busy} className="btn-bordeaux">{busy ? "..." : "+ Ajouter"}</button>
      </form>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.length === 0 && <div className="text-neutral-500 text-sm py-10">Aucune offre. Créez-en une ci-dessus.</div>}
        {offers.map((o) => (
          <div key={o.id} className="card p-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${o.is_active ? "bg-emerald-500" : "bg-neutral-300"}`} />
                {o.is_active ? "Active" : "Désactivée"}
              </div>
              <div className="mt-2 font-medium">{o.title}</div>
              {o.discount_label && <div className="text-sm text-bordeaux-700 mt-0.5">{o.discount_label}</div>}
              {o.description && <div className="text-sm text-neutral-500 mt-1">{o.description}</div>}
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={o.is_active} onChange={(e) => toggle(o.id, e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 bg-neutral-200 rounded-full peer-checked:bg-bordeaux-700 relative transition-colors">
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
              </div>
            </label>
          </div>
        ))}
      </div>
    </>
  );
}
