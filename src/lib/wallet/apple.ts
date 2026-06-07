import { PKPass } from "passkit-generator";
import fs from "node:fs";
import path from "node:path";

type Customer = { id: string; qr_code: string; first_name: string | null; last_name: string | null };
type Business = { id: string; name: string };
type Card = { primary_color: string; reward_label: string | null; stamps_required: number | null; slogan: string | null };
type CustomerCard = { stamps: number };

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

export async function buildApplePass(business: Business, card: Card, customer: Customer, cc: CustomerCard) {
  const required = card.stamps_required ?? 8;
  const certDir = process.env.APPLE_PASS_CERT_PATH ? path.dirname(process.env.APPLE_PASS_CERT_PATH) : "./certs";

  const pass = await PKPass.from(
    {
      model: path.join(process.cwd(), "passkit-model"),
      certificates: {
        wwdr: fs.readFileSync(process.env.APPLE_WWDR_PATH!),
        signerCert: fs.readFileSync(process.env.APPLE_PASS_CERT_PATH!),
        signerKey: fs.readFileSync(process.env.APPLE_PASS_CERT_PATH!),
        signerKeyPassphrase: process.env.APPLE_PASS_CERT_PASSWORD,
      },
    },
    {
      serialNumber: customer.id,
      description: `Carte ${business.name}`,
      organizationName: business.name,
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID!,
      teamIdentifier: process.env.APPLE_TEAM_ID!,
      foregroundColor: "rgb(255,255,255)",
      backgroundColor: hexToRgb(card.primary_color),
      labelColor: "rgb(255,255,255)",
      logoText: business.name,
      webServiceURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/wallet/apple/`,
      authenticationToken: customer.qr_code,
    }
  );

  pass.setBarcodes({ format: "PKBarcodeFormatQR", message: customer.qr_code, messageEncoding: "iso-8859-1" });

  pass.primaryFields.push({
    key: "stamps",
    label: "TAMPONS",
    value: `${cc.stamps}/${required}`,
  });
  pass.secondaryFields.push({
    key: "reward",
    label: "RÉCOMPENSE",
    value: card.reward_label || "—",
  });
  pass.auxiliaryFields.push({
    key: "name",
    label: "TITULAIRE",
    value: `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() || "Client",
  });
  if (card.slogan) {
    pass.backFields.push({ key: "slogan", label: "À propos", value: card.slogan });
  }

  return pass.getAsBuffer();
}
