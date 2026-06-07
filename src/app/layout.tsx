import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Walletiz — Cartes de fidélité digitales",
  description: "Créez et gérez vos cartes de fidélité digitales avec notifications push.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7B1E2B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
