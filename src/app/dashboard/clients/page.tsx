import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business";
import NewClientButton from "./NewClientButton";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { business, admin } = await getCurrentBusiness();
  const { data: customers } = await admin
    .from("customers")
    .select("id, first_name, last_name, email, phone, qr_code, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="mt-1 text-neutral-600">Vos clients fidèles et leurs QR codes.</p>
        </div>
        <NewClientButton />
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-neutral-200 divide-y">
        {(!customers || customers.length === 0) && (
          <div className="px-5 py-10 text-center text-sm text-neutral-500">
            Aucun client pour le moment. Ajoutez votre premier client →
          </div>
        )}
        {customers?.map((c: any) => (
          <Link
            key={c.id}
            href={`/dashboard/clients/${c.id}`}
            className="flex items-center justify-between px-5 py-4 hover:bg-neutral-50"
          >
            <div>
              <div className="font-medium">
                {c.first_name || "—"} {c.last_name || ""}
              </div>
              <div className="text-sm text-neutral-500">
                {c.email || c.phone || "Pas de contact"}
              </div>
            </div>
            <div className="text-xs text-neutral-400 font-mono">{c.qr_code.slice(0, 8)}…</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
