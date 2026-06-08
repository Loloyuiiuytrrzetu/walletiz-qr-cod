import { getCurrentBusiness } from "@/lib/business";
import CardEditor from "./CardEditor";

export const dynamic = "force-dynamic";

export default async function CardPage() {
  const { business, admin } = await getCurrentBusiness();
  let { data: card } = await admin.from("cards").select("*").eq("business_id", business.id).maybeSingle();
  if (!card) {
    const { data: created } = await admin.from("cards").insert({ business_id: business.id }).select().single();
    card = created;
  }
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-ink">Ma carte</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Personnalisez l'identité visuelle de votre carte de fidélité.
      </p>
      <CardEditor card={card} businessName={business.name} />
    </div>
  );
}
