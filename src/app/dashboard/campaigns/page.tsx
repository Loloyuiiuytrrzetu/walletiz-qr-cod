import { createClient } from "@/lib/supabase/server";
import CampaignsManager from "./CampaignsManager";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
  if (!business) return null;
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });
  const { count: customerCount } = await supabase
    .from("customers").select("id", { count: "exact", head: true }).eq("business_id", business.id);

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
