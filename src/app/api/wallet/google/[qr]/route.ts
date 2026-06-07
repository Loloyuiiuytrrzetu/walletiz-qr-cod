import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { buildLoyaltyClass, buildLoyaltyObject, signSaveJwt, saveUrl } from "@/lib/wallet/google";

export async function GET(_: Request, { params }: { params: { qr: string } }) {
  const admin = createServiceClient();
  const { data: customer } = await admin.from("customers").select("*, businesses(*)").eq("qr_code", params.qr).maybeSingle();
  if (!customer) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: card } = await admin.from("cards").select("*").eq("business_id", customer.business_id).single();
  const { data: cc } = await admin.from("customer_cards").select("*").eq("customer_id", customer.id).eq("card_id", card.id).maybeSingle();

  const business = customer.businesses;
  const loyaltyClass = buildLoyaltyClass(business, card);
  const loyaltyObject = buildLoyaltyObject(business, card, customer, cc ?? { stamps: 0 });

  const token = signSaveJwt({ loyaltyClasses: [loyaltyClass], loyaltyObjects: [loyaltyObject] });
  return NextResponse.redirect(saveUrl(token));
}
