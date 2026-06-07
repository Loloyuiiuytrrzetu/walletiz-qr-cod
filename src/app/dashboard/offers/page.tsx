import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/Topbar";
import OffersList from "./OffersList";

export default async function OffersPage() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { data: business } = await sb.from("businesses").select("*").eq("owner_id", user!.id).single();
  const { data: offers } = await sb.from("offers").select("*").eq("business_id", business.id).order("created_at", { ascending: false });

  return (
    <>
      <Topbar crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Mes offres" }]} />
      <main className="p-8 max-w-6xl">
        <h1 className="font-display text-5xl font-semibold tracking-tight">Mes offres</h1>
        <p className="mt-2 text-neutral-500">Créez et programmez vos offres exclusives.</p>
        <OffersList initial={offers ?? []} businessId={business.id} />
      </main>
    </>
  );
}
