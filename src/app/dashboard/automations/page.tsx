import { createClient } from "@/lib/supabase/server";
import AutomationsManager from "./AutomationsManager";

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
  if (!business) return null;
  const { data: automations } = await supabase.from("automations").select("*").eq("business_id", business.id).order("created_at");

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-ink">Automatisations</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Envoyez des messages déclenchés automatiquement par le comportement de vos clients.
      </p>
      <AutomationsManager initial={automations ?? []} />
    </div>
  );
}
