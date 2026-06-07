import { createServiceClient } from "@/lib/supabase/server";
import QRCode from "qrcode";

export default async function CustomerCardPage({ params }: { params: { qr: string } }) {
  const admin = createServiceClient();
  const { data: customer } = await admin.from("customers").select("*, businesses(*)").eq("qr_code", params.qr).maybeSingle();
  if (!customer) return <div className="p-10 text-center">Carte introuvable</div>;

  const { data: card } = await admin.from("cards").select("*").eq("business_id", customer.business_id).single();
  const { data: cc } = await admin.from("customer_cards").select("*").eq("customer_id", customer.id).eq("card_id", card.id).maybeSingle();

  const stamps = cc?.stamps ?? 0;
  const required = card.stamps_required ?? 8;
  const qrDataUrl = await QRCode.toDataURL(params.qr, { margin: 1, width: 240 });

  return (
    <main className="min-h-screen bg-neutral-100 p-4 grid place-items-center">
      <div className="max-w-sm w-full">
        <div className="rounded-3xl overflow-hidden shadow-xl" style={{ background: card.primary_color }}>
          <div className="p-6 text-white">
            <div className="text-sm opacity-90">{customer.businesses.name}</div>
            {card.slogan && <div className="text-xs opacity-70">{card.slogan}</div>}
            <div className="mt-8 grid grid-cols-4 gap-2">
              {Array.from({ length: required }).map((_, i) => (
                <div key={i} className={`aspect-square rounded-full border-2 ${i < stamps ? "bg-white/90 border-white" : "border-white/40"}`} />
              ))}
            </div>
            <div className="mt-5 text-xs opacity-80">RÉCOMPENSE</div>
            <div className="font-display text-xl font-semibold">{card.reward_label}</div>
            <div className="text-xs mt-3 opacity-80">{stamps} / {required} tampons</div>
          </div>
          <div className="bg-white p-5 grid place-items-center">
            <img src={qrDataUrl} alt="QR" className="w-48 h-48" />
            <div className="text-xs text-neutral-500 mt-2">Présentez ce QR en caisse</div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <a href={`/api/wallet/apple/${customer.qr_code}`}
             className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-black text-white font-medium">
             <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 12.5c0-3 2.5-4.4 2.6-4.5-1.4-2-3.6-2.3-4.4-2.3-1.9-.2-3.6 1.1-4.6 1.1s-2.4-1.1-4-1.1c-2 0-3.9 1.2-4.9 3-2.1 3.6-.5 9 1.5 12 1 1.5 2.2 3.1 3.8 3 1.5-.1 2.1-1 3.9-1s2.3 1 3.9 1c1.6 0 2.7-1.5 3.7-3 1.2-1.7 1.6-3.3 1.7-3.4-.1 0-3.2-1.2-3.2-4.8zM14.7 4c.9-1 1.4-2.5 1.3-4-1.3 0-2.8.8-3.7 1.8-.8.9-1.5 2.4-1.3 3.8 1.4.1 2.9-.7 3.7-1.6z"/></svg>
             Ajouter à Apple Wallet
          </a>
          <a href={`/api/wallet/google/${customer.qr_code}`}
             className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#4285F4] text-white font-medium">
             <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M21 7H3c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-1 8H4V9h16v6z"/></svg>
             Ajouter à Google Wallet
          </a>
        </div>
        <p className="text-xs text-neutral-500 text-center mt-4">
          Ajoutez votre carte à votre Wallet — elle se met à jour automatiquement à chaque visite.
        </p>
      </div>
    </main>
  );
}
