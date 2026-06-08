"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OffersManager({ initial }: { initial: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", discount_label: "", ends_at: "" });
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user!.id).single();
    await supabase.from("offers").insert({
      business_id: business!.id,
      title: form.title,
      description: form.description || null,
      discount_label: form.discount_label || null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    });
    setLoading(false);
    setOpen(false);
    setForm({ title: "", description: "", discount_label: "", ends_at: "" });
    router.refresh();
  }

  async function toggle(offer: any) {
    const supabase = createClient();
    await supabase.from("offers").update({ is_active: !offer.is_active }).eq("id", offer.id);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette offre ?")) return;
    const supabase = createClient();
    await supabase.from("offers").delete().eq("id", id);
    router.refresh();
  }

  return (
    <>
      <div className="mt-6 flex justify-end">
        <button onClick={() => setOpen(true)} className="bg-gradient-to-b from-[#e8927c] to-[#dc7a64] text-white px-4 py-2.5 rounded-xl font-semibold text-sm">
          + Nouvelle offre
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {initial.length === 0 && (
          <div className="col-span-3 bg-white rounded-2xl border border-neutral-200 p-10 text-center text-neutral-500 text-sm">
            Aucune offre. Créez votre première promotion ↑
          </div>
        )}
        {initial.map((o) => (
          <div key={o.id} className="bg-white rounded-2xl border border-neutral-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                {o.discount_label && (
                  <span className="inline-block px-2.5 py-1 rounded-full bg-burgundy/10 text-burgundy text-xs font-bold">
                    {o.discount_label}
                  </span>
                )}
                <div className="mt-2 font-semibold text-ink">{o.title}</div>
                {o.description && <div className="text-xs text-neutral-500 mt-1">{o.description}</div>}
              </div>
              <div className={`text-[10px] px-2 py-1 rounded-full font-semibold ${o.is_active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                {o.is_active ? "ACTIVE" : "OFF"}
              </div>
            </div>
            <div className="mt-4 text-xs text-neutral-500">
              {o.ends_at ? `Jusqu'au ${new Date(o.ends_at).toLocaleDateString("fr-FR")}` : "Sans date de fin"}
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => toggle(o)} className="flex-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50">
                {o.is_active ? "Désactiver" : "Activer"}
              </button>
              <button onClick={() => remove(o.id)} className="text-xs text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-ink">Nouvelle offre</h2>
            <div className="mt-4 space-y-3">
              <Input label="Titre" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Café offert" />
              <Input label="Pastille remise" value={form.discount_label} onChange={(v) => setForm({ ...form, discount_label: v })} placeholder="-20%" />
              <Input label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="(optionnel)" />
              <Input label="Date de fin" type="date" value={form.ends_at} onChange={(v) => setForm({ ...form, ends_at: v })} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm">Annuler</button>
              <button onClick={create} disabled={loading || !form.title.trim()} className="bg-burgundy text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {loading ? "..." : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full px-3 py-2 rounded-lg border border-neutral-200 focus:border-burgundy focus:outline-none text-sm"
      />
    </div>
  );
}
