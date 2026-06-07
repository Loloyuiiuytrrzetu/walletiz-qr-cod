import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/Topbar";
import CampaignsManager from "./CampaignsManager";

export default async function CampaignsPage() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { data: business } = await sb.from("businesses").select("*").eq("owner_id", user!.id).single();
  const { data: campaigns } = await sb.from("campaigns").select("*").eq("business_id", business.id).order("created_at", { ascending: false });

  return (
    <>
      <Topbar crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Campagnes" }]} />
      <main className="p-8 max-w-6xl">
        <h1 className="font-display text-5xl font-semibold tracking-tight">Campagnes</h1>
        <p className="mt-2 text-neutral-500">Notifications push programmables vers vos clients.</p>
        <CampaignsManager initial={campaigns ?? []} businessId={business.id} />
      </main>
    </>
  );
}
