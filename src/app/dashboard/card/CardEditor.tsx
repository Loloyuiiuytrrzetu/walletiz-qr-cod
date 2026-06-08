"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const COLORS = [
  "#0f172a", "#1e40af", "#15803d", "#b91c1c", "#7c3aed",
  "#ea580c", "#0891b2", "#7a1232",
];

const SHAPES = [
  { v: "circle", label: "Cercle" },
  { v: "square", label: "Carré" },
  { v: "rounded", label: "Arrondi" },
  { v: "hexagon", label: "Hexagone" },
];

const EXPIRATIONS = [
  { v: null, label: "Jamais" },
  { v: 3, label: "3 mois" },
  { v: 6, label: "6 mois" },
  { v: 12, label: "1 an" },
];

const STYLES = [
  { v: "minimal", label: "Minimal", sub: "Fond blanc, accents colorés" },
  { v: "aura", label: "Aura", sub: "Halos lumineux et grain" },
];

export default function CardEditor({ card: initial, businessName }: { card: any; businessName: string }) {
  const [card, setCard] = useState(initial);
  const [tab, setTab] = useState<"config" | "qr" | "vitrine">("config");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(patch: any) {
    setCard({ ...card, ...patch });
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const { id, ...payload } = card;
    await supabase.from("cards").update(payload).eq("id", id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mt-6 grid grid-cols-[260px_1fr_360px] gap-6">
      <aside className="bg-white rounded-2xl border border-neutral-200 p-2 h-fit">
        <button onClick={() => setTab("config")} className={tabClass(tab === "config")}>
          <Icon name="settings" /> Configuration
        </button>
        <button onClick={() => setTab("qr")} className={tabClass(tab === "qr")}>
          <Icon name="qr" /> QR Code & Wallet
        </button>
        <button onClick={() => setTab("vitrine")} className={tabClass(tab === "vitrine")}>
          <Icon name="window" /> Page vitrine
        </button>
      </aside>

      <div className="bg-white rounded-2xl border border-neutral-200 p-7">
        {tab === "config" && (
          <div className="space-y-7">
            <Section title="Identité de la carte" sub="Le nom affiché sur votre carte de fidélité.">
              <Field label="Nom de l'établissement">
                <input className="input" value={card.name ?? ""} onChange={(e) => update({ name: e.target.value })} />
              </Field>
            </Section>

            <Divider />

            <Section title="Programme de fidélité" sub="Nombre de tampons et récompense.">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Mécanique">
                  <div className="flex gap-2">
                    {[{ v: "stamp", l: "Tampon" }, { v: "points", l: "Points" }].map((o) => (
                      <button
                        key={o.v}
                        onClick={() => update({ mechanic: o.v })}
                        className={pillClass(card.mechanic === o.v)}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                </Field>
                {card.mechanic === "stamp" ? (
                  <Field label="Tampons requis">
                    <input
                      type="number" min={1} max={30} className="input"
                      value={card.stamps_required ?? 10}
                      onChange={(e) => update({ stamps_required: +e.target.value })}
                    />
                  </Field>
                ) : (
                  <Field label="Points pour récompense">
                    <input
                      type="number" min={1} className="input"
                      value={card.points_for_reward ?? 100}
                      onChange={(e) => update({ points_for_reward: +e.target.value })}
                    />
                  </Field>
                )}
              </div>
              <Field label="Récompense">
                <input className="input" value={card.reward_label ?? ""} onChange={(e) => update({ reward_label: e.target.value })} placeholder="Un café offert" />
              </Field>
            </Section>

            <Divider />

            <Section title="Style des tampons" sub="Forme des cases dans l'aperçu de votre carte.">
              <div className="grid grid-cols-4 gap-3">
                {SHAPES.map((s) => (
                  <button
                    key={s.v}
                    onClick={() => update({ stamp_shape: s.v })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition ${
                      card.stamp_shape === s.v ? "border-burgundy bg-burgundy/5" : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <ShapePreview shape={s.v} />
                    <span className="text-xs text-neutral-700">{s.label}</span>
                  </button>
                ))}
              </div>
            </Section>

            <Divider />

            <Section title="Expiration des tampons" sub="Les tampons sont remis à zéro si le client ne revient pas dans ce délai.">
              <div className="grid grid-cols-4 gap-2">
                {EXPIRATIONS.map((e) => (
                  <button
                    key={e.label}
                    onClick={() => update({ expiration_months: e.v })}
                    className={`px-3 py-2.5 rounded-xl border text-sm flex items-center justify-center gap-2 transition ${
                      (card.expiration_months ?? null) === e.v
                        ? "border-burgundy bg-burgundy/5 text-burgundy font-semibold"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <Icon name="clock" /> {e.label}
                  </button>
                ))}
              </div>
            </Section>

            <Divider />

            <Section title="Style de la carte" sub="Quatre ambiances différentes — l'aperçu se met à jour en direct.">
              <div className="grid grid-cols-2 gap-3">
                {STYLES.map((s) => (
                  <button
                    key={s.v}
                    onClick={() => update({ style: s.v })}
                    className={`p-4 rounded-xl border text-left transition ${
                      card.style === s.v ? "border-burgundy bg-burgundy/5" : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="font-semibold text-ink">{s.label}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{s.sub}</div>
                  </button>
                ))}
              </div>
            </Section>

            <Divider />

            <Section title="Couleur principale" sub="Personnalisez l'apparence de votre carte.">
              <div className="flex items-center gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => update({ primary_color: c })}
                    className={`w-9 h-9 rounded-full border-2 transition ${
                      card.primary_color === c ? "border-ink scale-110" : "border-white shadow"
                    }`}
                    style={{ background: c }}
                  />
                ))}
                <label className="ml-2 inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="color"
                    className="w-9 h-9 rounded-full border-0 cursor-pointer"
                    value={card.primary_color ?? "#7a1232"}
                    onChange={(e) => update({ primary_color: e.target.value })}
                  />
                </label>
                <input
                  className="input ml-2 w-32 font-mono uppercase"
                  value={card.primary_color ?? "#7a1232"}
                  onChange={(e) => update({ primary_color: e.target.value })}
                />
              </div>
            </Section>

            <Divider />

            <Section title="Slogan" sub="Affiché sous le nom — apparaît aussi dans Apple Wallet.">
              <input className="input" placeholder="ex: Depuis 1985, à votre service" value={card.slogan ?? ""} onChange={(e) => update({ slogan: e.target.value })} maxLength={60} />
            </Section>

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm">
                {saved && <span className="text-emerald-700 font-medium">✓ Enregistré</span>}
              </div>
              <button
                onClick={save}
                disabled={saving}
                className="bg-gradient-to-b from-[#e8927c] to-[#dc7a64] text-white px-6 py-2.5 rounded-xl font-semibold hover:from-[#dc7a64] hover:to-[#cd6b54] disabled:opacity-50 shadow-sm"
              >
                {saving ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </div>
          </div>
        )}

        {tab === "qr" && (
          <div className="space-y-4 text-sm text-neutral-700">
            <h3 className="text-lg font-semibold text-ink">QR Code & Wallet</h3>
            <p className="text-neutral-500">
              Chaque client reçoit un lien personnel <code className="bg-neutral-100 px-1.5 py-0.5 rounded">/c/&lt;qr&gt;</code> avec son QR.
              L'ajout à Apple/Google Wallet est prévu dans la prochaine itération.
            </p>
            <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">
              👉 Allez dans <b>Clients</b> pour voir et partager les QR de vos clients.
            </div>
          </div>
        )}

        {tab === "vitrine" && (
          <div className="space-y-4 text-sm text-neutral-700">
            <h3 className="text-lg font-semibold text-ink">Page vitrine publique</h3>
            <p className="text-neutral-500">
              Votre programme sera bientôt visible publiquement sur une page vitrine
              dédiée pour que de nouveaux clients puissent s'inscrire.
            </p>
          </div>
        )}
      </div>

      <aside className="space-y-4 h-fit sticky top-6">
        <div className="text-xs text-neutral-500 font-medium flex items-center justify-between">
          <span>Aperçu en temps réel</span>
          <span className="text-neutral-400">Format carte</span>
        </div>
        <CardPreview card={card} businessName={businessName} />
        <div className="text-xs text-neutral-500">
          QR code du client — Ajoutez un client pour prévisualiser sa carte
        </div>
      </aside>
    </div>
  );
}

function CardPreview({ card, businessName }: { card: any; businessName: string }) {
  const stamps = card.stamps_required ?? 10;
  const filled = Math.floor(stamps * 0.6);
  const bg = card.primary_color || "#7a1232";
  const isAura = card.style === "aura";
  return (
    <div
      className="rounded-2xl p-5 text-white shadow-lg relative overflow-hidden"
      style={{
        background: isAura
          ? `radial-gradient(circle at 30% 20%, ${lighten(bg)} 0%, ${bg} 50%, ${darken(bg)} 100%)`
          : bg,
      }}
    >
      {isAura && (
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: `radial-gradient(circle at 80% 80%, rgba(255,255,255,0.4), transparent 50%)` }} />
      )}
      <div className="relative">
        <div className="text-[10px] uppercase tracking-widest opacity-80">{card.name || "Carte principale"}</div>
        <div className="mt-1 font-display font-bold text-lg">{businessName}</div>
        {card.slogan && <div className="text-[11px] opacity-80 mt-0.5">{card.slogan}</div>}

        {card.mechanic === "stamp" ? (
          <>
            <div className="mt-4 grid grid-cols-5 gap-1.5">
              {Array.from({ length: stamps }).map((_, i) => (
                <Stamp key={i} shape={card.stamp_shape ?? "circle"} filled={i < filled} />
              ))}
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="text-[9px] opacity-70 uppercase tracking-wider">Récompense</div>
                <div className="text-xs font-semibold">{card.reward_label || "—"}</div>
              </div>
              <div>
                <div className="text-[9px] opacity-70 uppercase tracking-wider">Tampons</div>
                <div className="text-xs font-semibold">{filled} / {stamps}</div>
              </div>
              <div>
                <div className="text-[9px] opacity-70 uppercase tracking-wider">Statut</div>
                <div className="text-xs font-semibold">Client fidèle</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 text-3xl font-bold">{(card.points_for_reward ?? 100) * 0.4} pts</div>
            <div className="mt-1 text-[11px] opacity-80">{card.points_for_reward ?? 100} pts = {card.reward_label || "récompense"}</div>
          </>
        )}

        <div className="mt-4 bg-white rounded-md p-2 flex items-center justify-center">
          <div className="w-16 h-16 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 10 10%22><rect width=%2210%22 height=%2210%22 fill=%22white%22/><rect width=%221%22 height=%221%22 x=%221%22 y=%221%22/><rect width=%221%22 height=%221%22 x=%223%22 y=%221%22/><rect width=%221%22 height=%221%22 x=%225%22 y=%222%22/><rect width=%221%22 height=%221%22 x=%227%22 y=%221%22/><rect width=%221%22 height=%221%22 x=%221%22 y=%223%22/><rect width=%221%22 height=%221%22 x=%224%22 y=%223%22/><rect width=%221%22 height=%221%22 x=%226%22 y=%223%22/><rect width=%221%22 height=%221%22 x=%221%22 y=%225%22/><rect width=%221%22 height=%221%22 x=%223%22 y=%225%22/><rect width=%221%22 height=%221%22 x=%225%22 y=%225%22/><rect width=%221%22 height=%221%22 x=%227%22 y=%225%22/><rect width=%221%22 height=%221%22 x=%222%22 y=%227%22/><rect width=%221%22 height=%221%22 x=%224%22 y=%227%22/><rect width=%221%22 height=%221%22 x=%226%22 y=%227%22/></svg>')] bg-contain" />
        </div>
      </div>
    </div>
  );
}

function Stamp({ shape, filled }: { shape: string; filled: boolean }) {
  const base = "aspect-square w-full border-2";
  const cls =
    shape === "square" ? "" :
    shape === "rounded" ? "rounded-md" :
    shape === "hexagon" ? "[clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]" :
    "rounded-full";
  return <div className={`${base} ${cls} ${filled ? "bg-white border-white" : "border-white/40"}`} />;
}

function ShapePreview({ shape }: { shape: string }) {
  return (
    <div className={`w-7 h-7 bg-burgundy ${
      shape === "square" ? "" :
      shape === "rounded" ? "rounded-md" :
      shape === "hexagon" ? "[clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]" :
      "rounded-full"
    }`} />
  );
}

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-base font-semibold text-ink">{title}</div>
      <div className="text-xs text-neutral-500 mt-0.5">{sub}</div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Divider() { return <div className="border-t border-neutral-100" />; }

function tabClass(active: boolean) {
  return `flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition ${
    active ? "bg-neutral-100 text-ink font-semibold" : "text-neutral-600 hover:bg-neutral-50"
  }`;
}

function pillClass(active: boolean) {
  return `px-3.5 py-2 rounded-full border text-sm font-medium ${
    active ? "bg-burgundy text-white border-burgundy" : "bg-white border-neutral-300 text-neutral-700"
  }`;
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, JSX.Element> = {
    settings: <path d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h.1a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v.1a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" />,
    qr: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3zM18 18h3M18 18v3" /></>,
    window: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><circle cx="6" cy="6" r="0.5" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  };
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function lighten(hex: string) { return hex; }
function darken(hex: string) { return hex; }
