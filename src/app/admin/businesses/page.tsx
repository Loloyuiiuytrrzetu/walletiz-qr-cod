import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminBusinesses() {
  const admin = createAdminClient();
  const { data: businesses } = await admin
    .from("businesses")
    .select("id, name, slug, plan, is_active, created_at, owner_id")
    .order("created_at", { ascending: false });

  const ownerIds = (businesses ?? []).map((b: any) => b.owner_id);
  const { data: users } =
    ownerIds.length > 0
      ? await admin.auth.admin.listUsers()
      : ({ data: { users: [] as any[] } } as any);

  const emailById = new Map<string, string>();
  (users?.users ?? []).forEach((u: any) => emailById.set(u.id, u.email ?? ""));

  return (
    <div>
      <h1 className="text-3xl font-bold">Restaurants</h1>
      <p className="mt-1 text-neutral-400">{businesses?.length ?? 0} inscrits sur la plateforme.</p>

      <div className="mt-8 rounded-2xl border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Nom</th>
              <th className="text-left px-5 py-3 font-medium">Email owner</th>
              <th className="text-left px-5 py-3 font-medium">Plan</th>
              <th className="text-left px-5 py-3 font-medium">Statut</th>
              <th className="text-left px-5 py-3 font-medium">Inscrit</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {(!businesses || businesses.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-neutral-500">
                  Aucun restaurant pour le moment.
                </td>
              </tr>
            )}
            {businesses?.map((b: any) => (
              <tr key={b.id} className="hover:bg-neutral-900/60">
                <td className="px-5 py-3 font-medium">{b.name}</td>
                <td className="px-5 py-3 text-neutral-400">{emailById.get(b.owner_id) || "—"}</td>
                <td className="px-5 py-3">
                  <span className="text-xs uppercase px-2 py-1 rounded-full bg-neutral-800">{b.plan}</span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      b.is_active ? "bg-emerald-900/40 text-emerald-300" : "bg-red-900/40 text-red-300"
                    }`}
                  >
                    {b.is_active ? "actif" : "suspendu"}
                  </span>
                </td>
                <td className="px-5 py-3 text-neutral-400">
                  {new Date(b.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/admin/businesses/${b.id}`} className="text-brand hover:underline">
                    Gérer →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
