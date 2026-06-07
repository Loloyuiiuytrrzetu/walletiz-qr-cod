import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await sb.from("businesses").select("*").eq("owner_id", user.id).maybeSingle();
  if (!business) redirect("/signup");

  const { count: clientCount } = await sb
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id);

  return (
    <div className="lg:flex bg-neutral-50 min-h-screen">
      <Sidebar business={business} clientCount={clientCount ?? 0} />
      <div className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0">{children}</div>
    </div>
  );
}
