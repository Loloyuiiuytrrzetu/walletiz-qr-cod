"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CampaignsManager({ initial, customerCount }: { initial: any[]; customerCount: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", audience: "all" });
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user!.id).single();
    await supabase.from("campaigns").insert({
      business_id: business!.id,
      title: form.title,
      message: form.message,
      audience: form.audience,
      status: "sent",
      sent_at: new Date().toISOString(),
      sent_count: customerCount,
    });
    setLoading(false);
    setOpen(false);
    setForm({ title: "", message: "", audience: "all" });
    router.refresh();
  }

  return (
    <>
      <div className="mt-6 flex justify-end">
        <button onClick={() => setOpen(true)} className="bg-gradient-to-b from-[#e8927c] to-[#dc7a64] text-white px-4 py-2.5 rounded-xl font-semibold text-sm">
          + Nouvelle campagne
        </button>
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {initial.length === 0 ? (
          <div className="p-10 text-center text-neutral-500 text-sm">Aucune campagne envoyée.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Titre</th>
                <th className="text-left px-5 py-3 font-semibold">Cible</th>
                <th className="text-left px-5 py-3 font-semibold">Statut</th>
                <th className="text-left px-5 py-3 font-semibold">Envoyés</th>
                <th className="text-left px-5 py-3 font-semibold">Quand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {initial.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink">{c.title}</div>
                    <div className="text-xs text-neutral-500 truncate max-w-xs">{c.message}</div>
                  </td>
                  <td className="px-5 py-3 capitalize">{c.audience}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      c.status === "sent" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
                    }`}>
                      {c.status === "sent" ? "Envoyée" : c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">{c.sent_count}</td>
                  <td className="px-5 py-3 text-neutral-500">
                    {c.sent_at ? new Date(c.sent_at).toLocaleString("fr-FR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-ink">Nouvelle campagne push</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Titre</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="On vous attend !" className="mt-1 w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Message</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Café offert ce week-end pour tous nos fidèles 💛" className="mt-1 w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Audience</label>
                <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm">
                  <option value="all">Tous mes clients ({customerCount})</option>
                  <option value="active">Clients actifs (30 derniers jours)</option>
                  <option value="inactive">Clients inactifs (+30j)</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm">Annuler</button>
              <button onClick={send} disabled={loading || !form.title || !form.message} className="bg-burgundy text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {loading ? "..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
