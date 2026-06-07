"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { createClient } from "@/lib/supabase/client";

export default function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [amount, setAmount] = useState(1);
  const [manualQr, setManualQr] = useState("");

  useEffect(() => {
    if (!scanning) return;
    const reader = new BrowserMultiFormatReader();
    let stopped = false;
    let controls: any;
    (async () => {
      try {
        controls = await reader.decodeFromVideoDevice(undefined, videoRef.current!, (res) => {
          if (res && !stopped) {
            stopped = true;
            const text = res.getText();
            handleQr(extractQr(text));
            controls?.stop?.();
            setScanning(false);
          }
        });
      } catch (e: any) {
        setErr(e.message);
        setScanning(false);
      }
    })();
    return () => {
      stopped = true;
      controls?.stop?.();
    };
  }, [scanning]);

  function extractQr(text: string): string {
    try {
      const u = new URL(text);
      const parts = u.pathname.split("/").filter(Boolean);
      return parts[parts.length - 1] || text;
    } catch {
      return text;
    }
  }

  async function handleQr(qr: string) {
    setErr(null);
    setResult(null);
    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ qr, amount }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Erreur");
      return;
    }
    setResult(data);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Scanner</h1>
      <p className="mt-1 text-neutral-600">Scannez le QR code du client pour ajouter un tampon ou des points.</p>

      <div className="mt-8 grid md:grid-cols-2 gap-8">
        <div>
          <div className="bg-black rounded-2xl overflow-hidden aspect-square relative">
            <video ref={videoRef} className="w-full h-full object-cover" />
            {!scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setScanning(true)}
                  className="bg-brand text-white px-5 py-3 rounded-full"
                >
                  Démarrer la caméra
                </button>
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Quantité (tampons ou euros)</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-xl border border-neutral-300"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Ou saisir le code QR à la main</label>
            <div className="mt-1 flex gap-2">
              <input
                value={manualQr}
                onChange={(e) => setManualQr(e.target.value)}
                placeholder="code QR"
                className="flex-1 px-4 py-2 rounded-xl border border-neutral-300"
              />
              <button
                onClick={() => handleQr(manualQr)}
                className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm"
              >
                Valider
              </button>
            </div>
          </div>
        </div>

        <div>
          {err && (
            <div className="bg-red-50 text-red-700 rounded-2xl p-5">
              <div className="font-semibold">Erreur</div>
              <div className="text-sm mt-1">{err}</div>
            </div>
          )}
          {result && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="text-sm text-neutral-500">Scan validé ✓</div>
              <div className="mt-1 text-xl font-semibold">
                {result.customer?.first_name} {result.customer?.last_name}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <Stat label="Tampons" value={result.progress?.stamps ?? 0} />
                <Stat label="Points" value={result.progress?.points ?? 0} />
                <Stat label="Récompenses" value={result.progress?.rewards_claimed ?? 0} />
              </div>
              {result.reward_unlocked && (
                <div className="mt-4 bg-brand text-white rounded-xl px-4 py-3 text-center font-medium">
                  🎁 Récompense débloquée !
                </div>
              )}
            </div>
          )}
          {!result && !err && (
            <div className="text-sm text-neutral-500">
              Lancez la caméra et scannez un QR client.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  );
}
