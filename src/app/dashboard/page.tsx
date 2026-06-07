import { createClient } from "@/lib/supabase/server";

export default async function DashboardHome() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();
  if (!business) return null;

  const [{ count: customerCount }, { count: activityCount }, { data: card }] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("activity").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("cards").select("*").eq("business_id", business.id).maybeSingle(),
  ]);

  const { data: recent } = await supabase
    .from("activity")
    .select("kind, amount, created_at, customers(first_name, last_name)")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div>
      <h1 className="text-3xl font-bold">Bonjour 👋</h1>
      <p className="mt-1 text-neutral-600">Voici un aperçu de votre programme.</p>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <Stat label="Clients" value={customerCount ?? 0} />
        <Stat label="Visites" value={activityCount ?? 0} />
        <Stat
          label="Mécanique"
          value={card?.mechanic === "points" ? "Points" : "Tampons"}
        />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Activité récente</h2>
        <div className="mt-4 bg-white rounded-2xl border border-neutral-200 divide-y">
          {(!recent || recent.length === 0) && (
            <div className="px-4 py-6 text-sm text-neutral-500">
              Aucune activité pour le moment. Allez dans <b>Scanner</b> pour ajouter un tampon.
            </div>
          )}
          {recent?.map((r: any, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">
                  {r.customers?.first_name ?? "Client"} {r.customers?.last_name ?? ""}
                </span>
                <span className="ml-2 text-neutral-500">
                  {r.kind === "stamp" && `+${r.amount} tampon`}
                  {r.kind === "points" && `+${r.amount} pts`}
                  {r.kind === "reward" && "récompense"}
                </span>
              </div>
              <div className="text-neutral-500">
                {new Date(r.created_at).toLocaleString("fr-FR")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 px-5 py-4">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
