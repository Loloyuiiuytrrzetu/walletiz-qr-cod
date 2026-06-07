import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/push";

export async function POST(req: Request) {
  const { campaign_id } = await req.json();
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createServiceClient();
  const { data: campaign } = await admin.from("campaigns").select("*, businesses!inner(owner_id)").eq("id", campaign_id).single();
  if (!campaign || campaign.businesses.owner_id !== user.id)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await admin.from("campaigns").update({ status: "sending" }).eq("id", campaign_id);

  // Filter audience
  const thirtyAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  let q = admin.from("customers").select("id, customer_cards(last_visit_at)").eq("business_id", campaign.business_id);
  const { data: customers } = await q;
  const ids = (customers || [])
    .filter((c: any) => {
      const lv = c.customer_cards?.[0]?.last_visit_at;
      if (campaign.audience === "active") return lv && lv > thirtyAgo;
      if (campaign.audience === "inactive") return !lv || lv <= thirtyAgo;
      return true;
    })
    .map((c: any) => c.id);

  if (!ids.length) {
    await admin.from("campaigns").update({ status: "sent", sent_at: new Date().toISOString(), sent_count: 0 }).eq("id", campaign_id);
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const { data: subs } = await admin.from("push_subscriptions").select("*").in("customer_id", ids);
  let sent = 0, failed = 0;
  for (const s of subs ?? []) {
    try { await sendPush(s as any, { title: campaign.title, body: campaign.message, url: campaign.link_url }); sent++; }
    catch { failed++; }
  }

  await admin.from("campaigns").update({
    status: "sent", sent_at: new Date().toISOString(), sent_count: sent, failed_count: failed,
  }).eq("id", campaign_id);

  return NextResponse.json({ ok: true, sent, failed });
}
