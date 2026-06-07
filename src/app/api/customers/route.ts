import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { first_name, last_name, email, phone } = await req.json();
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: business } = await sb.from("businesses").select("id").eq("owner_id", user.id).single();
  if (!business) return NextResponse.json({ error: "no business" }, { status: 400 });

  const admin = createServiceClient();
  const { data, error } = await admin.from("customers").insert({
    business_id: business.id, first_name, last_name, email, phone,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, customer: data });
}
