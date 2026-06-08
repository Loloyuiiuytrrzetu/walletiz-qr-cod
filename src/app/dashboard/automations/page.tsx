import { getCurrentBusiness } from "@/lib/business";
import AutomationsManager from "./AutomationsManager";

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const { business, admin } = await getCurrentBusiness();
  const { data: automations } = await admin.from("automations").select("*").eq("business_id", business.id).order("created_at");

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
