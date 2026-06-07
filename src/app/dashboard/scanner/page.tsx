"use client";
import { useEffect, useRef, useState } from "react";
import Topbar from "@/components/Topbar";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState("");
  const lastRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    let active = true;

    (async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (!devices.length) { setError("Aucune caméra détectée"); return; }
        const back = devices.find((d) => /back|rear|environnement/i.test(d.label)) ?? devices[devices.length - 1];
        await reader.decodeFromVideoDevice(back.deviceId, videoRef.current!, (res) => {
          if (!active || !res) return;
          const code = res.getText();
          const now = Date.now();
          if (code === lastRef.current.code && now - lastRef.current.at < 3000) return;
          lastRef.current = { code, at: now };
          submit(code);
        });
      } catch (e: any) {
        setError(e?.message || "Impossible d'accéder à la caméra");
      }
    })();

    return () => {
      active = false;
      // @ts-ignore - reset exists at runtime
      readerRef.current?.reset?.();
    };
  }, []);

  async function submit(qr: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qr }) });
      const j = await res.json();
      if (j.ok) {
        const tag = j.kind === "reward" ? "🎉 RÉCOMPENSE !" : "+1 tampon";
        setResult(`${tag} · ${j.customer_name} · ${j.stamps}/${j.required}`);
        if ("vibrate" in navigator) navigator.vibrate(100);
      } else {
        setError(j.error || "Erreur");
      }
    } catch (e: any) {
      setError(e?.message || "Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Topbar crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Scanner" }]} />
      <main className="p-8 max-w-2xl">
        <h1 className="font-display text-5xl font-semibold tracking-tight">Scanner</h1>
        <p className="mt-2 text-neutral-500">Pointez la caméra vers le QR du client (Apple/Google Wallet).</p>

        <div className="mt-6 card overflow-hidden">
          <div className="relative bg-black aspect-square">
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="w-2/3 aspect-square border-4 border-white/80 rounded-2xl" />
            </div>
          </div>
        </div>

        {result && (
          <div className="mt-4 card p-4 border-emerald-200 bg-emerald-50">
            <p className="text-sm font-medium text-emerald-800">{result}</p>
          </div>
        )}
        {error && (
          <div className="mt-4 card p-4 border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); submit(manual); setManual(""); }}
          className="mt-6 card p-4 flex gap-2">
          <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Saisie manuelle du code"
            className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 outline-none focus:border-bordeaux-700" />
          <button disabled={busy || !manual} className="btn-bordeaux">Valider</button>
        </form>
      </main>
    </>
  );
}
