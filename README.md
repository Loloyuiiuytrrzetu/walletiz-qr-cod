# Fidelity SaaS

SaaS de cartes de fidélité digitales pour commerçants.

- **Mécaniques** : tampons (X achats = 1 offert) et points / cashback
- **Client** : reçoit un lien `/c/<qr>` avec sa carte et son QR code
- **Commerçant** : dashboard pour créer sa carte, voir ses clients, scanner les QR codes

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (Auth + Postgres + RLS)
- QR code scan via `@zxing/browser`

## Setup local

```bash
npm install
cp .env.example .env.local
# Renseigner les clés Supabase
```

Dans Supabase, exécuter le contenu de `supabase/schema.sql` dans le SQL editor.

```bash
npm run dev
```

## Structure

- `/` — landing
- `/signup`, `/login` — auth commerçant
- `/onboarding` — création du business à la 1ère connexion
- `/dashboard` — vue d'ensemble
- `/dashboard/card` — éditeur de carte
- `/dashboard/clients` — liste clients + QR codes
- `/dashboard/scanner` — scanner QR pour ajouter un tampon / des points
- `/c/[qr]` — page publique du client (sa carte)
