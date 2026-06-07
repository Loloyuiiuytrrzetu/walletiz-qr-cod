import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { name, slug } = await req.json();
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createServiceClient();
  // Ensure slug uniqueness
  let finalSlug = slug || "business";
  for (let i = 0; i < 5; i++) {
    const { data } = await admin.from("businesses").select("id").eq("slug", finalSlug).maybeSingle();
    if (!data) break;
    finalSlug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data: business, error } = await admin.from("businesses")
    .insert({ owner_id: user.id, name, slug: finalSlug }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Create default card
  await admin.from("cards").insert({ business_id: business.id });

  return NextResponse.json({ ok: true, business });
}
