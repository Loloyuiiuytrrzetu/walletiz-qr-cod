import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import AdminLogoutButton from "./LogoutButton";

const NAV = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/businesses", label: "Restaurants" },
  { href: "/admin/billing", label: "Abonnements" },
  { href: "/admin/logs", label: "Journal" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  return (
    <div className="min-h-screen flex bg-neutral-950 text-neutral-100">
      <aside className="w-64 bg-black border-r border-neutral-800 px-4 py-6 flex flex-col">
        <div className="px-2">
          <div className="text-xs uppercase tracking-widest text-brand">Super admin</div>
          <div className="mt-1 font-semibold">Fidelity Console</div>
          <div className="text-xs text-neutral-500 mt-0.5 truncate">{user.email}</div>
        </div>
        <nav className="mt-8 flex-1 space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link href="/dashboard" className="text-xs text-neutral-500 hover:text-white px-3 py-2">
          ← Mon dashboard
        </Link>
        <AdminLogoutButton />
      </aside>
      <main className="flex-1 px-10 py-10 max-w-6xl">{children}</main>
    </div>
  );
}
