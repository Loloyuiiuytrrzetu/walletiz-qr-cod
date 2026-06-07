import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/push";

export async function POST(req: Request) {
  const { customer_id, title, body, url } = await req.json();
  const admin = createServiceClient();
  const { data: subs } = await admin.from("push_subscriptions").select("*").eq("customer_id", customer_id);
  if (!subs?.length) return NextResponse.json({ ok: true, sent: 0 });

  let sent = 0, failed = 0;
  for (const s of subs) {
    try { await sendPush(s as any, { title, body, url }); sent++; }
    catch { failed++; }
  }
  return NextResponse.json({ ok: true, sent, failed });
}
