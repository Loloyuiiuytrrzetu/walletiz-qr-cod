import { createClient } from "@/lib/supabase/server";
import OffersManager from "./OffersManager";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
  if (!business) return null;
  const { data: offers } = await supabase
    .from("offers").select("*").eq("business_id", business.id).order("created_at", { ascending: false });

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
