import Topbar from "@/components/Topbar";
import { createClient } from "@/lib/supabase/server";

export default async function CustomerDetail({ params }: { params: { id: string } }) {
  const sb = createClient();
  const { data: customer } = await sb.from("customers").select("*, customer_cards(*, cards(*))").eq("id", params.id).single();
  if (!customer) return <div className="p-8">Client introuvable</div>;

  const cc = customer.customer_cards?.[0];
  const card = cc?.cards;

  return (
    <>
      <Topbar crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Clients", href: "/dashboard/clients" }, { label: customer.first_name || "Client" }]} />
      <main className="p-8 max-w-4xl">
        <h1 className="font-display text-4xl font-semibold">{customer.first_name} {customer.last_name}</h1>
        <p className="text-neutral-500 text-sm mt-1">{customer.email || customer.phone}</p>

        <div className="mt-6 card p-6">
          <h2 className="font-display text-xl font-semibold">Progression</h2>
          {cc ? (
            <p className="mt-2 text-2xl">{cc.stamps} / {card?.stamps_required ?? 8} tampons</p>
          ) : (
            <p className="text-neutral-500">Pas encore de progression</p>
          )}
        </div>

        <div className="mt-6 card p-6">
          <h2 className="font-display text-xl font-semibold">QR Code</h2>
          <code className="mt-2 block bg-neutral-50 p-3 rounded-lg text-sm">{customer.qr_code}</code>
          <a href={`/c/${customer.qr_code}`} target="_blank" className="mt-3 inline-block text-sm text-bordeaux-700 hover:underline">
            Voir la carte client →
          </a>
        </div>
      </main>
    </>
  );
}
