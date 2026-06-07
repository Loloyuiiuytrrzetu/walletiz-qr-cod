import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLogs() {
  const admin = createAdminClient();
  const { data: logs } = await admin
    .from("admin_logs")
    .select("*, businesses:target_business_id(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-3xl font-bold">Journal admin</h1>
      <p className="mt-1 text-neutral-400">Toutes les actions effectuées depuis la console.</p>

      <div className="mt-8 rounded-2xl border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Quand</th>
              <th className="text-left px-5 py-3 font-medium">Admin</th>
              <th className="text-left px-5 py-3 font-medium">Action</th>
              <th className="text-left px-5 py-3 font-medium">Restaurant</th>
              <th className="text-left px-5 py-3 font-medium">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {(!logs || logs.length === 0) && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-neutral-500">Aucun événement.</td></tr>
            )}
            {logs?.map((l: any) => (
              <tr key={l.id}>
                <td className="px-5 py-3 text-neutral-400">{new Date(l.created_at).toLocaleString("fr-FR")}</td>
                <td className="px-5 py-3">{l.admin_email}</td>
                <td className="px-5 py-3 font-mono text-xs">{l.action}</td>
                <td className="px-5 py-3">{l.businesses?.name || "—"}</td>
                <td className="px-5 py-3 text-xs text-neutral-400">
                  {l.meta ? JSON.stringify(l.meta) : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
