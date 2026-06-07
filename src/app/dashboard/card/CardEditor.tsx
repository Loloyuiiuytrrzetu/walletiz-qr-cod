"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CardEditor({ card }: { card: any }) {
  const [c, setC] = useState(card);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("cards")
      .update({
        name: c.name,
        mechanic: c.mechanic,
        stamps_required: c.stamps_required,
        reward_label: c.reward_label,
        points_per_euro: c.points_per_euro,
        points_for_reward: c.points_for_reward,
        primary_color: c.primary_color,
      })
      .eq("id", c.id);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="mt-8 grid md:grid-cols-2 gap-10">
      <div className="space-y-5">
        <Field label="Nom de la carte">
          <input
            value={c.name ?? ""}
            onChange={(e) => setC({ ...c, name: e.target.value })}
            className="input"
          />
        </Field>

        <Field label="Mécanique">
          <div className="flex gap-2">
            {[
              { v: "stamp", l: "Tampons" },
              { v: "points", l: "Points" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setC({ ...c, mechanic: o.v })}
                className={`px-4 py-2 rounded-full text-sm border ${
                  c.mechanic === o.v
                    ? "bg-brand text-white border-brand"
                    : "bg-white border-neutral-300"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </Field>

        {c.mechanic === "stamp" ? (
          <>
            <Field label="Nombre de tampons pour la récompense">
              <input
                type="number"
                min={1}
                max={30}
                value={c.stamps_required ?? 10}
                onChange={(e) => setC({ ...c, stamps_required: +e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Récompense">
              <input
                value={c.reward_label ?? ""}
                onChange={(e) => setC({ ...c, reward_label: e.target.value })}
                className="input"
                placeholder="Un café offert"
              />
            </Field>
          </>
        ) : (
          <>
            <Field label="Points gagnés par euro dépensé">
              <input
                type="number"
                min={1}
                value={c.points_per_euro ?? 1}
                onChange={(e) => setC({ ...c, points_per_euro: +e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Points pour récompense">
              <input
                type="number"
                min={1}
                value={c.points_for_reward ?? 100}
                onChange={(e) => setC({ ...c, points_for_reward: +e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Récompense">
              <input
                value={c.reward_label ?? ""}
                onChange={(e) => setC({ ...c, reward_label: e.target.value })}
                className="input"
              />
            </Field>
          </>
        )}

        <Field label="Couleur">
          <input
            type="color"
            value={c.primary_color ?? "#7B1E2B"}
            onChange={(e) => setC({ ...c, primary_color: e.target.value })}
            className="h-10 w-20 rounded-md border border-neutral-300"
          />
        </Field>

        <button
          onClick={save}
          disabled={saving}
          className="bg-brand text-white px-5 py-3 rounded-xl font-medium hover:bg-brand-dark disabled:opacity-50"
        >
          {saving ? "Sauvegarde..." : saved ? "Enregistré ✓" : "Enregistrer"}
        </button>
      </div>

      <div>
        <div className="text-xs uppercase text-neutral-500 mb-3">Aperçu</div>
        <Preview card={c} />
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.6rem 0.9rem;
          border-radius: 0.75rem;
          border: 1px solid #d4d4d4;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: #7b1e2b;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}

function Preview({ card }: { card: any }) {
  const stamps = card.stamps_required ?? 10;
  return (
    <div
      className="rounded-3xl p-7 text-white shadow-2xl"
      style={{ background: card.primary_color ?? "#7B1E2B" }}
    >
      <div className="text-sm opacity-80">{card.name ?? "Carte"}</div>
      <div className="mt-1 text-xl font-semibold">Prénom Nom</div>
      {card.mechanic === "stamp" ? (
        <>
          <div className="mt-6 grid grid-cols-5 gap-2">
            {Array.from({ length: stamps }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-full border-2 ${
                  i < Math.floor(stamps * 0.4) ? "bg-white border-white" : "border-white/40"
                }`}
              />
            ))}
          </div>
          <div className="mt-4 text-sm opacity-90">
            Récompense : {card.reward_label || "—"}
          </div>
        </>
      ) : (
        <>
          <div className="mt-6 text-4xl font-bold">350 pts</div>
          <div className="mt-2 text-sm opacity-90">
            {card.points_for_reward ?? 100} pts = {card.reward_label || "récompense"}
          </div>
        </>
      )}
    </div>
  );
}
