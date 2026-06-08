"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TRIGGERS = [
  { v: "signup", emoji: "👋", label: "Bienvenue à l'inscription", default: "Bienvenue chez nous ! Voici votre carte de fidélité." },
  { v: "birthday", emoji: "🎂", label: "Anniversaire du client", default: "Joyeux anniversaire 🎉 Profitez d'un cadeau aujourd'hui !" },
  { v: "inactivity_30", emoji: "💤", label: "Inactivité 30 jours", default: "On vous attend ! Voici une petite attention pour votre retour." },
  { v: "reward_ready", emoji: "🎁", label: "Récompense débloquée", default: "Bravo, votre récompense est prête à être utilisée !" },
];

export default function AutomationsManager({ initial }: { initial: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  function getByTrigger(t: string) {
    return initial.find((a) => a.trigger === t);
  }

  async function enable(trigger: string) {
    setLoading(trigger);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user!.id).single();
    const def = TRIGGERS.find((t) => t.v === trigger)!;
    await supabase.from("automations").insert({
      business_id: business!.id,
      name: def.label,
      trigger: def.v,
      message: def.default,
      is_active: true,
    });
    setLoading(null);
    router.refresh();
  }

  async function toggle(a: any) {
    setLoading(a.trigger);
    const supabase = createClient();
    await supabase.from("automations").update({ is_active: !a.is_active }).eq("id", a.id);
    setLoading(null);
    router.refresh();
  }

  async function updateMessage(a: any, message: string) {
    const supabase = createClient();
    await supabase.from("automations").update({ message }).eq("id", a.id);
    router.refresh();
  }

  return (
    <div className="mt-6 grid gap-4">
      {TRIGGERS.map((t) => {
        const auto = getByTrigger(t.v);
        return (
          <div key={t.v} className="bg-white rounded-2xl border border-neutral-200 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{t.emoji}</div>
                <div>
                  <div className="font-semibold text-ink">{t.label}</div>
                  {auto ? (
                    <input
                      defaultValue={auto.message}
                      onBlur={(e) => updateMessage(auto, e.target.value)}
                      className="mt-2 w-full text-sm px-3 py-2 rounded-lg border border-neutral-200 focus:border-burgundy focus:outline-none min-w-[400px]"
                    />
                  ) : (
                    <div className="text-xs text-neutral-500 mt-1">{t.default}</div>
                  )}
                </div>
              </div>
              <div>
                {auto ? (
                  <button
                    onClick={() => toggle(auto)}
                    disabled={loading === t.v}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                      auto.is_active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {auto.is_active ? "● ACTIVE" : "○ OFF"}
                  </button>
                ) : (
                  <button
                    onClick={() => enable(t.v)}
                    disabled={loading === t.v}
                    className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-neutral-200 hover:bg-neutral-50"
                  >
                    Activer
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
