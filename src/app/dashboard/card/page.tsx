import { createClient } from "@/lib/supabase/server";
import CardEditor from "./CardEditor";

export const dynamic = "force-dynamic";

export default async function CardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();
  if (!business) return null;
  const { data: card } = await supabase
    .from("cards")
    .select("*")
    .eq("business_id", business.id)
    .single();
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
