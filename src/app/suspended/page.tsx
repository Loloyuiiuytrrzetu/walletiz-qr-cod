import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Suspended() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: business } = user
    ? await supabase
        .from("businesses")
        .select("name, suspended_at, suspended_reason")
        .eq("owner_id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-5xl">⏸</div>
        <h1 className="mt-4 text-3xl font-bold">Compte suspendu</h1>
        <p className="mt-2 text-neutral-600">
          {business?.name ? `${business.name} — ` : ""}votre accès au dashboard a été désactivé.
        </p>
        {business?.suspended_reason && (
          <p className="mt-2 text-sm text-neutral-500">Raison : {business.suspended_reason}</p>
        )}
        <p className="mt-6 text-sm text-neutral-500">
          Contactez le support pour réactiver votre compte.
        </p>
        <Link href="/" className="mt-6 inline-block text-brand hover:underline">
          ← Retour
        </Link>
      </div>
    </main>
  );
}
