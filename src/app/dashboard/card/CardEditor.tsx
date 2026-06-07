"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Card = {
  id: string;
  name: string;
  stamps_required: number | null;
  reward_label: string | null;
  stamp_shape: string;
  expiration_months: number | null;
  style: string;
  primary_color: string;
  slogan: string | null;
};

const SHAPES = [
  { v: "circle", l: "Cercle", svg: "rounded-full" },
  { v: "square", l: "Carré", svg: "" },
  { v: "rounded", l: "Arrondi", svg: "rounded-md" },
  { v: "hexagon", l: "Hexagone", svg: "rounded-[30%]" },
];

const STYLES = [
  { v: "minimal", l: "Minimal", desc: "Fond blanc, accents colorés" },
  { v: "aura", l: "Aura", desc: "Halos lumineux et grain" },
];

const COLORS = ["#111827", "#1E40AF", "#10B981", "#7B1E2B", "#6366F1", "#EA580C", "#0E7490", "#A21CAF"];

const EXPIRATIONS = [
  { v: null, l: "Jamais" },
  { v: 3, l: "3 mois" },
  { v: 6, l: "6 mois" },
  { v: 12, l: "1 an" },
];

export default function CardEditor({ card: initial, businessName }: { card: Card; businessName: string }) {
  const [card, setCard] = useState(initial);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof Card>(k: K, v: Card[K]) {
    setCard((c) => ({ ...c, [k]: v }));
  }

  async function save() {
    setSaving(true);
    const sb = createClient();
    await sb.from("cards").update({
      name: card.name,
      stamps_required: card.stamps_required,
      reward_label: card.reward_label,
      stamp_shape: card.stamp_shape,
      expiration_months: card.expiration_months,
      style: card.style,
      primary_color: card.primary_color,
      slogan: card.slogan,
    }).eq("id", card.id);
    setSaving(false);
  }

  const shapeClass = SHAPES.find((s) => s.v === card.stamp_shape)?.svg ?? "rounded-full";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-5xl font-semibold tracking-tight">Ma carte</h1>
          <div className="flex items-center gap-2">
            <select className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm">
              <option>Carte principale</option>
            </select>
            <button className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm">+ Nouvelle carte</button>
            <button className="px-3 py-1.5 rounded-lg border border-red-200 text-sm text-red-600">🗑 Supprimer</button>
          </div>
        </div>

        <Section title="Identité de la carte" desc="Le nom affiché sur votre carte de fidélité">
          <Label>Nom de l'établissement</Label>
          <Input value={businessName} readOnly />
          <Label className="mt-4">Nom de la carte</Label>
          <Input value={card.name} onChange={(e) => set("name", e.target.value)} />
        </Section>

        <Section title="Programme de fidélité" desc="Nombre de tampons et récompense">
          <Label>Tampons requis</Label>
          <Input type="number" min={1} max={50} value={card.stamps_required ?? 8} onChange={(e) => set("stamps_required", parseInt(e.target.value))} />
          <Label className="mt-4">Récompense</Label>
          <Input value={card.reward_label ?? ""} onChange={(e) => set("reward_label", e.target.value)} placeholder="10% de réduction" />
        </Section>

        <Section title="Style des tampons" desc="Forme des cases dans l'aperçu de votre carte">
          <div className="grid grid-cols-4 gap-3">
            {SHAPES.map((s) => (
              <button key={s.v} onClick={() => set("stamp_shape", s.v)}
                className={`p-4 rounded-xl border-2 ${card.stamp_shape === s.v ? "border-bordeaux-700 bg-bordeaux-50" : "border-neutral-200"}`}>
                <div className={`w-8 h-8 mx-auto bg-bordeaux-700 ${s.svg}`} />
                <div className="mt-2 text-sm">{s.l}</div>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Expiration des tampons" desc="Les tampons sont remis à zéro si le client ne revient pas dans ce délai">
          <div className="flex gap-2 flex-wrap">
            {EXPIRATIONS.map((e) => (
              <button key={String(e.v)} onClick={() => set("expiration_months", e.v)}
                className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-2 ${card.expiration_months === e.v ? "border-bordeaux-700 text-bordeaux-700" : "border-neutral-200"}`}>
                ⏱ {e.l}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Style de la carte" desc="Quatre ambiances différentes — l'aperçu se met à jour en direct">
          <div className="grid grid-cols-2 gap-3">
            {STYLES.map((s) => (
              <button key={s.v} onClick={() => set("style", s.v)}
                className={`p-4 rounded-xl border-2 text-left ${card.style === s.v ? "border-bordeaux-700" : "border-neutral-200"}`}>
                <div className="h-16 rounded-lg" style={{ background: s.v === "minimal" ? "#fff" : `linear-gradient(135deg, ${card.primary_color}, #fff)` }} />
                <div className="mt-2 text-sm font-medium">{s.l}</div>
                <div className="text-xs text-neutral-500">{s.desc}</div>
              </button>
            ))}
          </div>

          <Label className="mt-6">Couleur principale</Label>
          <p className="text-xs text-neutral-500">Personnalisez l'apparence de votre carte</p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button key={c} onClick={() => set("primary_color", c)}
                className={`w-9 h-9 rounded-full border-2 ${card.primary_color === c ? "border-neutral-900" : "border-transparent"}`}
                style={{ background: c }} />
            ))}
            <input type="color" value={card.primary_color} onChange={(e) => set("primary_color", e.target.value)} className="w-9 h-9 rounded-full" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-9 h-9 rounded-md" style={{ background: card.primary_color }} />
            <Input value={card.primary_color} onChange={(e) => set("primary_color", e.target.value)} className="max-w-[160px]" />
          </div>

          <Label className="mt-6">Slogan <span className="text-neutral-400">· optionnel</span></Label>
          <p className="text-xs text-neutral-500">Affiché sous le nom — apparaît aussi dans Apple Wallet</p>
          <Input value={card.slogan ?? ""} onChange={(e) => set("slogan", e.target.value)} placeholder="ex: Depuis 1985, à votre service" />
        </Section>

        <div className="mt-8">
          <button onClick={save} disabled={saving} className="btn-bordeaux">
            {saving ? "Enregistrement..." : "✓ Enregistrer"}
          </button>
        </div>
      </div>

      {/* Live preview */}
      <aside className="lg:sticky lg:top-8 self-start">
        <p className="text-sm text-neutral-500 mb-3">Aperçu en temps réel · Format carte</p>
        <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: card.primary_color }}>
          <div className="p-5 text-white">
            <div className="text-sm opacity-80">{businessName}</div>
            {card.slogan && <div className="text-xs opacity-70 mt-0.5">{card.slogan}</div>}
            <div className="mt-6 text-xs opacity-70">RÉCOMPENSE · TAMPONS</div>
            <div className="flex items-center justify-between mt-1">
              <div className="font-display text-2xl font-semibold">{card.reward_label}</div>
              <div className="text-sm">5 / {card.stamps_required ?? 8}</div>
            </div>
            <div className="text-xs opacity-70 mt-2">TITULAIRE</div>
            <div className="text-sm">Client fidèle</div>
          </div>
          <div className="bg-white p-4 grid place-items-center">
            <div className="w-24 h-24 bg-neutral-900" style={{
              backgroundImage: "repeating-linear-gradient(0deg, #000 0 2px, #fff 2px 4px), repeating-linear-gradient(90deg, #000 0 2px, #fff 2px 4px)",
            }} />
          </div>
        </div>
        <div className="mt-3 p-3 rounded-lg border border-neutral-200 text-xs text-neutral-600">
          <strong>QR code du client</strong><br />
          Ajoutez un client pour prévisualiser sa carte
        </div>
      </aside>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 card p-6">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {desc && <p className="text-sm text-neutral-500 mt-1">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-xs font-medium uppercase tracking-wide text-neutral-500 mb-1 ${className}`}>{children}</div>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-bordeaux-700 outline-none ${props.className ?? ""}`} />;
}
