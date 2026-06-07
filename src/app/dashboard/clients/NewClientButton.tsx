"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewClientButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: business } = await supabase
      .from("businesses").select("id").eq("owner_id", user!.id).single();
    if (!business) return;
    const { data: customer } = await supabase
      .from("customers")
      .insert({
        business_id: business.id,
        first_name: first || null,
        last_name: last || null,
        email: email || null,
        phone: phone || null,
      })
      .select()
      .single();
    const { data: card } = await supabase
      .from("cards").select("id").eq("business_id", business.id).single();
    if (customer && card) {
      await supabase.from("customer_cards").insert({
        customer_id: customer.id,
        card_id: card.id,
      });
    }
    setLoading(false);
    setOpen(false);
    setFirst(""); setLast(""); setEmail(""); setPhone("");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-brand text-white px-4 py-2 rounded-full text-sm hover:bg-brand-dark"
      >
        + Nouveau client
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold">Nouveau client</h2>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="Prénom" value={first} onChange={(e) => setFirst(e.target.value)} />
                <input className="input" placeholder="Nom" value={last} onChange={(e) => setLast(e.target.value)} />
              </div>
              <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="input" placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm">Annuler</button>
              <button
                onClick={create}
                disabled={loading}
                className="bg-brand text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-dark disabled:opacity-50"
              >
                {loading ? "..." : "Créer"}
              </button>
            </div>
          </div>
          <style jsx>{`
            .input {
              width: 100%;
              padding: 0.55rem 0.85rem;
              border-radius: 0.65rem;
              border: 1px solid #d4d4d4;
            }
            .input:focus { outline: none; border-color: #7b1e2b; }
          `}</style>
        </div>
      )}
    </>
  );
}
