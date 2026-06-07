import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CustomerCard({ params }: { params: { qr: string } }) {
  const admin = createAdminClient();

  const { data: customer } = await admin
    .from("customers")
    .select("id, first_name, last_name, business_id")
    .eq("qr_code", params.qr)
    .single();

  if (!customer) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <div className="text-3xl">🔍</div>
          <h1 className="mt-3 text-2xl font-bold">Carte introuvable</h1>
          <p className="mt-1 text-neutral-600">Le lien semble incorrect.</p>
        </div>
      </main>
    );
  }

  const { data: business } = await admin
    .from("businesses")
    .select("name")
    .eq("id", customer.business_id)
    .single();

  const { data: card } = await admin
    .from("cards")
    .select("*")
    .eq("business_id", customer.business_id)
    .single();

  const { data: cc } = await admin
    .from("customer_cards")
    .select("*")
    .eq("customer_id", customer.id)
    .eq("card_id", card.id)
    .maybeSingle();

  const stamps = cc?.stamps ?? 0;
  const points = cc?.points ?? 0;
  const total = card.stamps_required ?? 10;

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-10">
      <div className="text-sm text-neutral-500">{business?.name}</div>
      <h1 className="mt-1 text-xl font-semibold">
        {customer.first_name || ""} {customer.last_name || ""}
      </h1>

      <div
        className="mt-8 w-full max-w-md rounded-3xl p-8 text-white shadow-2xl"
        style={{ background: card.primary_color || "#7B1E2B" }}
      >
        <div className="text-sm opacity-80">{card.name}</div>

        {card.mechanic === "stamp" ? (
          <>
            <div className="mt-6 grid grid-cols-5 gap-3">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-full border-2 ${
                    i < stamps ? "bg-white border-white" : "border-white/40"
                  }`}
                />
              ))}
            </div>
            <div className="mt-5 text-sm opacity-90">
              {stamps} / {total} — {card.reward_label}
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 text-5xl font-bold">{points} pts</div>
            <div className="mt-2 text-sm opacity-90">
              {card.points_for_reward} pts = {card.reward_label}
            </div>
          </>
        )}
      </div>

      <div className="mt-8 text-sm text-neutral-600 text-center max-w-md">
        Présentez ce QR code au commerçant à votre prochaine visite.
      </div>
    </main>
  );
}
