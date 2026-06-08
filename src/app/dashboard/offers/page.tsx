import { getCurrentBusiness } from "@/lib/business";
import OffersManager from "./OffersManager";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const { business, admin } = await getCurrentBusiness();
  const { data: offers } = await admin.from("offers").select("*").eq("business_id", business.id).order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-ink">Mes offres</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Créez des promotions ponctuelles que vos clients verront dans leur carte.
      </p>
      <OffersManager initial={offers ?? []} />
    </div>
  );
}
