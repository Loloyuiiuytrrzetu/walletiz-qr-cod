import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { customer_id, subscription, user_agent } = await req.json();
  if (!customer_id || !subscription?.endpoint) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const admin = createServiceClient();
  await admin.from("push_subscriptions").upsert({
    customer_id,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    user_agent,
  }, { onConflict: "endpoint" });
  return NextResponse.json({ ok: true });
}
