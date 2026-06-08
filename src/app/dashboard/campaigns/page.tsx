import { getCurrentBusiness } from "@/lib/business";
import CampaignsManager from "./CampaignsManager";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const { business, admin } = await getCurrentBusiness();
  const { data: campaigns } = await admin.from("campaigns").select("*").eq("business_id", business.id).order("created_at", { ascending: false });
  const { count: customerCount } = await admin.from("customers").select("id", { count: "exact", head: true }).eq("business_id", business.id);

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-ink">Campagnes</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Envoyez une notification push à vos clients pour les faire revenir.
      </p>
      <CampaignsManager initial={campaigns ?? []} customerCount={customerCount ?? 0} />
    </div>
  );
}
