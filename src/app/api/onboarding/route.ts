import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: true, business_id: existing.id });
  }

  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;

  const { data: business, error } = await admin
    .from("businesses")
    .insert({ owner_id: user.id, name, slug })
    .select()
    .single();
  if (error || !business) {
    return NextResponse.json({ error: error?.message ?? "Erreur" }, { status: 500 });
  }

  await admin.from("cards").insert({ business_id: business.id });

  return NextResponse.json({ ok: true, business_id: business.id });
}
