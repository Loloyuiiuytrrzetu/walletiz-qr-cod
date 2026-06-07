import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fidelity — Cartes de fidélité digitales",
  description: "Le SaaS de fidélisation pour les commerçants modernes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
