import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import LogoutButton from "./LogoutButton";
import NavItem from "./NavItem";

const NAV_GROUPS = [
  {
    label: "Programme",
    items: [
      { href: "/dashboard", label: "Accueil", icon: "home" },
      { href: "/dashboard/programme", label: "Mon programme", icon: "stamp" },
      { href: "/dashboard/card", label: "Ma carte", icon: "card" },
      { href: "/dashboard/clients", label: "Clients", icon: "users" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/dashboard/offers", label: "Mes offres", icon: "gift" },
      { href: "/dashboard/campaigns", label: "Campagnes", icon: "send" },
      { href: "/dashboard/automations", label: "Automatisations", icon: "zap" },
    ],
  },
  {
    label: "Analyse",
    items: [
      { href: "/dashboard/analytics", label: "Analytics", icon: "chart" },
    ],
  },
];

const PLAN_LIMITS: Record<string, number> = {
  gratuit: 5,
  solo: 250,
  pro: 5000,
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, is_active, plan, logo_url")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) redirect("/onboarding");
  if (!business.is_active) redirect("/suspended");
  const userIsAdmin = isAdminEmail(user.email);

  const { count: customerCount } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id);

  const limit = PLAN_LIMITS[business.plan] ?? 5;
  const usage = customerCount ?? 0;
  const usagePct = Math.min(100, (usage / limit) * 100);

  return (
    <div className="min-h-screen flex bg-[#faf8f4]">
      <aside className="w-[260px] bg-white border-r border-neutral-200 flex flex-col">
        <div className="px-5 py-5 flex items-center gap-2.5">
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center font-bold text-sm">
              {business.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="font-display font-semibold text-ink truncate">{business.name}</div>
        </div>

        <div className="px-4 pb-4">
          <Link
            href="/dashboard/scanner"
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-b from-[#e8927c] to-[#dc7a64] hover:from-[#dc7a64] hover:to-[#cd6b54] text-white font-semibold py-2.5 rounded-xl shadow-sm transition"
          >
            <Icon name="scan" />
            Scanner
          </Link>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          {NAV_GROUPS.map((g) => (
            <div key={g.label} className="mb-5">
              <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {g.label}
              </div>
              {g.items.map((item) => (
                <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
              ))}
            </div>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-neutral-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Plan</span>
            <span className="font-semibold capitalize text-ink">{business.plan}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-burgundy to-burgundy-light" style={{ width: `${usagePct}%` }} />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Clients</span>
            <span>{usage} / {limit}</span>
          </div>
          {business.plan === "gratuit" && (
            <Link href="/dashboard/billing" className="mt-3 flex items-center justify-center gap-1.5 w-full bg-neutral-100 hover:bg-neutral-200 text-ink text-xs font-medium py-2 rounded-lg">
              ↑ Passer à Solo
            </Link>
          )}
          {userIsAdmin && (
            <Link href="/admin" className="mt-2 flex items-center justify-center gap-1.5 w-full bg-burgundy text-white text-xs font-semibold py-2 rounded-lg">
              🛡️ Console admin
            </Link>
          )}
        </div>

        <div className="px-4 py-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-[11px] font-bold text-neutral-600">
              {(user.email || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate text-ink">{business.name}</div>
              <div className="text-[10px] text-neutral-500 truncate">{user.email}</div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-10 py-8">{children}</div>
      </main>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    scan: "M3 7V4h3M3 17v3h3M21 7V4h-3M21 17v3h-3M3 12h18",
  };
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}
