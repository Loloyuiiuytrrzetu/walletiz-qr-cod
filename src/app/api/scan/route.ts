import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { qr } = await req.json();
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: business } = await sb.from("businesses").select("*").eq("owner_id", user.id).single();
  if (!business) return NextResponse.json({ error: "no business" }, { status: 400 });

  const admin = createServiceClient();
  const { data: customer } = await admin.from("customers").select("*").eq("qr_code", qr).eq("business_id", business.id).maybeSingle();
  if (!customer) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

  const { data: card } = await admin.from("cards").select("*").eq("business_id", business.id).single();

  let { data: cc } = await admin.from("customer_cards")
    .select("*").eq("customer_id", customer.id).eq("card_id", card.id).maybeSingle();

  if (!cc) {
    const { data } = await admin.from("customer_cards").insert({ customer_id: customer.id, card_id: card.id }).select().single();
    cc = data;
  }

  let stamps = (cc.stamps ?? 0) + 1;
  let rewards_claimed = cc.rewards_claimed ?? 0;
  let kind = "stamp";

  const required = card.stamps_required ?? 8;
  if (stamps >= required) {
    stamps = 0;
    rewards_claimed += 1;
    kind = "reward";
  }

  await admin.from("customer_cards").update({
    stamps, rewards_claimed, last_visit_at: new Date().toISOString(),
  }).eq("id", cc.id);

  await admin.from("activity").insert({
    business_id: business.id,
    customer_id: customer.id,
    card_id: card.id,
    kind,
    amount: 1,
  });

  // Trigger push: reward_ready
  if (kind === "reward") {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/push/notify-customer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: customer.id, title: "🎉 Récompense débloquée !", body: card.reward_label || "Votre récompense est prête" }),
    }).catch(() => {});
  }

  return NextResponse.json({
    ok: true,
    customer_name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Client",
    stamps, required, kind,
  });
}
