import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { qr, amount = 1 } = await req.json();
  if (!qr) return NextResponse.json({ error: "QR manquant" }, { status: 400 });

  const admin = createAdminClient();

  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!business) return NextResponse.json({ error: "Aucun business" }, { status: 400 });

  const { data: customer } = await admin
    .from("customers")
    .select("id, first_name, last_name, business_id")
    .eq("qr_code", qr)
    .single();
  if (!customer || customer.business_id !== business.id) {
    return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  }

  const { data: card } = await admin
    .from("cards")
    .select("*")
    .eq("business_id", business.id)
    .single();
  if (!card) return NextResponse.json({ error: "Carte non configurée" }, { status: 400 });

  let { data: cc } = await admin
    .from("customer_cards")
    .select("*")
    .eq("customer_id", customer.id)
    .eq("card_id", card.id)
    .maybeSingle();

  if (!cc) {
    const ins = await admin
      .from("customer_cards")
      .insert({ customer_id: customer.id, card_id: card.id })
      .select()
      .single();
    cc = ins.data!;
  }

  let stamps = cc.stamps;
  let points = cc.points;
  let rewards = cc.rewards_claimed;
  let rewardUnlocked = false;
  let activityKind: "stamp" | "points" = "stamp";

  if (card.mechanic === "stamp") {
    stamps += amount;
    if (stamps >= (card.stamps_required ?? 10)) {
      rewards += 1;
      stamps = stamps - (card.stamps_required ?? 10);
      rewardUnlocked = true;
    }
  } else {
    const earned = amount * (card.points_per_euro ?? 1);
    points += earned;
    activityKind = "points";
    while (points >= (card.points_for_reward ?? 100)) {
      points -= card.points_for_reward ?? 100;
      rewards += 1;
      rewardUnlocked = true;
    }
  }

  const { data: updated } = await admin
    .from("customer_cards")
    .update({
      stamps,
      points,
      rewards_claimed: rewards,
      last_visit_at: new Date().toISOString(),
    })
    .eq("id", cc.id)
    .select()
    .single();

  await admin.from("activity").insert({
    business_id: business.id,
    customer_id: customer.id,
    card_id: card.id,
    kind: activityKind,
    amount: card.mechanic === "stamp" ? amount : amount * (card.points_per_euro ?? 1),
  });

  if (rewardUnlocked) {
    await admin.from("activity").insert({
      business_id: business.id,
      customer_id: customer.id,
      card_id: card.id,
      kind: "reward",
      amount: 1,
    });
  }

  return NextResponse.json({
    ok: true,
    customer: { first_name: customer.first_name, last_name: customer.last_name },
    progress: updated,
    reward_unlocked: rewardUnlocked,
  });
}
