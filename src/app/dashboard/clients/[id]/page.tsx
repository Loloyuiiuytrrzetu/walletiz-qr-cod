import Link from "next/link";
import QRCode from "qrcode";
import { getCurrentBusiness } from "@/lib/business";

export const dynamic = "force-dynamic";

export default async function ClientDetail({ params }: { params: { id: string } }) {
  const { business, admin } = await getCurrentBusiness();

  const { data: customer } = await admin
    .from("customers")
    .select("*, customer_cards(stamps, points, rewards_claimed, last_visit_at, card_id)")
    .eq("id", params.id)
    .eq("business_id", business.id)
    .single();
  if (!customer) return <div>Client introuvable</div>;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cardLink = `${appUrl}/c/${customer.qr_code}`;
  const qrDataUrl = await QRCode.toDataURL(cardLink, { width: 320, margin: 1 });

  const cc = customer.customer_cards?.[0];

  return (
    <div>
      <Link href="/dashboard/clients" className="text-sm text-neutral-500 hover:text-black">← Clients</Link>
      <h1 className="mt-2 text-3xl font-bold">
        {customer.first_name || "—"} {customer.last_name || ""}
      </h1>
      <div className="mt-1 text-neutral-600">{customer.email || customer.phone || ""}</div>

      <div className="mt-8 grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="text-sm text-neutral-500">Progression</div>
          <div className="mt-3 grid grid-cols-3 gap-4 text-center">
            <Stat label="Tampons" value={cc?.stamps ?? 0} />
            <Stat label="Points" value={cc?.points ?? 0} />
            <Stat label="Récompenses" value={cc?.rewards_claimed ?? 0} />
          </div>
          <div className="mt-4 text-xs text-neutral-500">
            Dernière visite : {cc?.last_visit_at ? new Date(cc.last_visit_at).toLocaleString("fr-FR") : "jamais"}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center">
          <div className="text-sm text-neutral-500 mb-3">QR code du client</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR" className="mx-auto" />
          <a
            href={cardLink}
            target="_blank"
            className="mt-3 inline-block text-xs text-brand hover:underline break-all"
          >
            {cardLink}
          </a>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  );
}
