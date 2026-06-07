import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

const NAV = [
  { href: "/dashboard", label: "Vue d'ensemble" },
  { href: "/dashboard/card", label: "Ma carte" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/scanner", label: "Scanner" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) redirect("/onboarding");

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-neutral-200 px-4 py-6 flex flex-col">
        <Link href="/dashboard" className="font-semibold text-lg px-2">
          <span className="text-brand">●</span> Fidelity
        </Link>
        <div className="mt-1 text-xs text-neutral-500 px-2 truncate">{business.name}</div>
        <nav className="mt-8 flex-1 space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </aside>
      <main className="flex-1 px-8 py-8 max-w-5xl">{children}</main>
    </div>
  );
}
