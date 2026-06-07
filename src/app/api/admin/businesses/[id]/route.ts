import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { action, plan, reason } = await req.json();
  const admin = createAdminClient();

  let update: any = {};
  if (action === "set_plan") {
    if (!["gratuit", "solo", "pro"].includes(plan)) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }
    update = { plan };
  } else if (action === "suspend") {
    update = {
      is_active: false,
      suspended_at: new Date().toISOString(),
      suspended_reason: reason || null,
    };
  } else if (action === "reactivate") {
    update = { is_active: true, suspended_at: null, suspended_reason: null };
  } else {
    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  }

  const { error } = await admin.from("businesses").update(update).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from("admin_logs").insert({
    admin_email: user.email,
    action,
    target_business_id: params.id,
    meta: { plan, reason },
  });

  return NextResponse.json({ ok: true });
}
