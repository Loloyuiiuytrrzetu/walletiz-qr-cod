import jwt from "jsonwebtoken";

type Customer = {
  id: string;
  qr_code: string;
  first_name: string | null;
  last_name: string | null;
};
type Business = { id: string; name: string; logo_url: string | null };
type Card = { primary_color: string; reward_label: string | null; stamps_required: number | null };
type CustomerCard = { stamps: number };

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID!;
const SERVICE_EMAIL = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL!;
const PRIVATE_KEY = (process.env.GOOGLE_WALLET_PRIVATE_KEY || "").replace(/\\n/g, "\n");

function classId(business: Business) {
  return `${ISSUER_ID}.walletiz_${business.id.replace(/-/g, "_")}`;
}
function objectId(business: Business, customer: Customer) {
  return `${ISSUER_ID}.cust_${customer.id.replace(/-/g, "_")}`;
}

export function buildLoyaltyObject(business: Business, card: Card, customer: Customer, cc: CustomerCard) {
  const required = card.stamps_required ?? 8;
  return {
    id: objectId(business, customer),
    classId: classId(business),
    state: "ACTIVE",
    accountId: customer.qr_code,
    accountName: `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() || "Client",
    loyaltyPoints: {
      label: "Tampons",
      balance: { string: `${cc.stamps}/${required}` },
    },
    barcode: { type: "QR_CODE", value: customer.qr_code, alternateText: customer.qr_code.slice(0, 8) },
    textModulesData: [
      { id: "reward", header: "Récompense", body: card.reward_label || "" },
    ],
  };
}

export function buildLoyaltyClass(business: Business, card: Card) {
  return {
    id: classId(business),
    issuerName: business.name,
    programName: "Carte de fidélité",
    programLogo: business.logo_url
      ? { sourceUri: { uri: business.logo_url } }
      : undefined,
    hexBackgroundColor: card.primary_color,
    reviewStatus: "UNDER_REVIEW",
  };
}

export function signSaveJwt(payload: { loyaltyClasses: any[]; loyaltyObjects: any[] }) {
  const claims = {
    iss: SERVICE_EMAIL,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    payload,
    origins: [process.env.NEXT_PUBLIC_APP_URL!],
  };
  return jwt.sign(claims, PRIVATE_KEY, { algorithm: "RS256" });
}

export function saveUrl(token: string) {
  return `https://pay.google.com/gp/v/save/${token}`;
}
