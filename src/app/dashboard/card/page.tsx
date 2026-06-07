import { createClient } from "@/lib/supabase/server";
import CardEditor from "./CardEditor";

export default async function CardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
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
      <h1 className="text-3xl font-bold">Ma carte</h1>
      <p className="mt-1 text-neutral-600">Personnalisez le programme que verront vos clients.</p>
      <CardEditor card={card} />
    </div>
  );
}
