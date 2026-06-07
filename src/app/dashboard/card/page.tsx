import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/Topbar";
import CardEditor from "./CardEditor";

export default async function CardPage() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { data: business } = await sb.from("businesses").select("*").eq("owner_id", user!.id).single();
  let { data: card } = await sb.from("cards").select("*").eq("business_id", business.id).maybeSingle();

  if (!card) {
    const { data: created } = await sb.from("cards").insert({ business_id: business.id }).select().single();
    card = created;
  }

  return (
    <>
      <Topbar crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Ma carte" }]} />
      <main className="p-8 max-w-7xl">
        <CardEditor card={card} businessName={business.name} />
      </main>
    </>
  );
}
