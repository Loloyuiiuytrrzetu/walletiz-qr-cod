import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import BusinessActions from "./BusinessActions";

export const dynamic = "force-dynamic";

export default async function BusinessDetail({ params }: { params: { id: string } }) {
  const admin = createAdminClient();

  const { data: business } = await admin
    .from("businesses")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!business) {
    return (
      <div>
        <Link href="/admin/businesses" className="text-sm text-neutral-400">← Restaurants</Link>
        <div className="mt-4 text-neutral-400">Restaurant introuvable.</div>
      </div>
    );
  }

  const { data: ownerUser } = await admin.auth.admin.getUserById(business.owner_id);

  const [{ count: customerCount }, { count: activityCount }] = await Promise.all([
    admin.from("customers").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    admin.from("activity").select("id", { count: "exact", head: true }).eq("business_id", business.id),
  ]);

  return (
    <div>
      <Link href="/admin/businesses" className="text-sm text-neutral-400 hover:text-white">← Restaurants</Link>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">{business.name}</h1>
          <div className="text-sm text-neutral-400 mt-1">
            Owner : {ownerUser?.user?.email || "—"}
            <span className="mx-2">·</span>
            Slug : <code className="text-neutral-300">{business.slug}</code>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase px-2 py-1 rounded-full bg-neutral-800">{business.plan}</span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              business.is_active ? "bg-emerald-900/40 text-emerald-300" : "bg-red-900/40 text-red-300"
            }`}
          >
            {business.is_active ? "actif" : "suspendu"}
          </span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <KPI label="Clients" value={customerCount ?? 0} />
        <KPI label="Visites" value={activityCount ?? 0} />
        <KPI
          label="Inscrit"
          value={new Date(business.created_at).toLocaleDateString("fr-FR")}
        />
      </div>

      {business.suspended_at && (
        <div className="mt-6 rounded-xl border border-red-900/60 bg-red-950/40 p-4">
          <div className="text-sm font-semibold text-red-300">
            Suspendu le {new Date(business.suspended_at).toLocaleDateString("fr-FR")}
          </div>
          {business.suspended_reason && (
            <div className="mt-1 text-sm text-red-200/80">{business.suspended_reason}</div>
          )}
        </div>
      )}

      <BusinessActions business={business} />
    </div>
  );
}

function KPI({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 px-5 py-4">
      <div className="text-xs uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
