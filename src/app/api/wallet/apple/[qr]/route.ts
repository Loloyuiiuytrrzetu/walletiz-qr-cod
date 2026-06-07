import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { buildApplePass } from "@/lib/wallet/apple";

export async function GET(_: Request, { params }: { params: { qr: string } }) {
  const admin = createServiceClient();
  const { data: customer } = await admin.from("customers").select("*, businesses(*)").eq("qr_code", params.qr).maybeSingle();
  if (!customer) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: card } = await admin.from("cards").select("*").eq("business_id", customer.business_id).single();
  const { data: cc } = await admin.from("customer_cards").select("*").eq("customer_id", customer.id).eq("card_id", card.id).maybeSingle();

  try {
    const buffer = await buildApplePass(customer.businesses, card, customer, cc ?? { stamps: 0 });
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="walletiz-${customer.qr_code}.pkpass"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "pass generation failed" }, { status: 500 });
  }
}
