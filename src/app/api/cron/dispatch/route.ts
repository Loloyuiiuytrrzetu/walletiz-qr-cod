import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/push";

// Vercel Cron / external cron hit this every minute to process scheduled campaigns.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const { data: due } = await admin.from("campaigns")
    .select("*").eq("status", "scheduled").lte("scheduled_at", new Date().toISOString()).limit(20);

  if (!due?.length) return NextResponse.json({ ok: true, processed: 0 });

  for (const campaign of due) {
    await admin.from("campaigns").update({ status: "sending" }).eq("id", campaign.id);
    const thirtyAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const { data: customers } = await admin.from("customers")
      .select("id, customer_cards(last_visit_at)").eq("business_id", campaign.business_id);
    const ids = (customers || []).filter((c: any) => {
      const lv = c.customer_cards?.[0]?.last_visit_at;
      if (campaign.audience === "active") return lv && lv > thirtyAgo;
      if (campaign.audience === "inactive") return !lv || lv <= thirtyAgo;
      return true;
    }).map((c: any) => c.id);

    const { data: subs } = await admin.from("push_subscriptions").select("*").in("customer_id", ids);
    let sent = 0, failed = 0;
    for (const s of subs ?? []) {
      try { await sendPush(s as any, { title: campaign.title, body: campaign.message, url: campaign.link_url }); sent++; }
      catch { failed++; }
    }
    await admin.from("campaigns").update({
      status: "sent", sent_at: new Date().toISOString(), sent_count: sent, failed_count: failed,
    }).eq("id", campaign.id);
  }

  return NextResponse.json({ ok: true, processed: due.length });
}
