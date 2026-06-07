# Walletiz

SaaS de cartes de fidélité digitales avec notifications push programmables.

Thème : **bordeaux & blanc**. Stack : **Next.js 14 (App Router) + Supabase + Web Push (VAPID)**.

## Fonctionnalités

- **Multi-tenant** : chaque commerçant gère son business et ses clients
- **Carte de fidélité personnalisable** : forme des tampons, couleur, slogan, expiration, ambiance
- **Programme tampon ou points** (extensible)
- **Scanner QR** : ajoute un tampon, déclenche la récompense automatiquement
- **Page carte client publique** (`/c/[qr_code]`) — installable sur le téléphone (PWA)
- **Push notifications** Web Push (VAPID) :
  - Notification automatique quand la récompense est débloquée
  - Campagnes manuelles et programmées (audience all / actifs / inactifs)
  - Automatisations (signup, inactivité 30j, anniversaire, récompense prête)
- **Dashboard admin** : accueil avec stats, clients, offres, campagnes, automatisations, statistiques
- **Plans** : Gratuit / Solo / Pro

## Installation

```bash
npm install
cp .env.example .env.local
# Remplir les variables (Supabase + VAPID)
npx web-push generate-vapid-keys
```

### Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter `supabase/schema.sql` dans le SQL editor
3. Copier `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`

### Lancer

```bash
npm run dev
```

### Cron des campagnes programmées

Configurer un cron (Vercel Cron, GitHub Action, etc.) toutes les minutes :

```
GET /api/cron/dispatch
Authorization: Bearer $CRON_SECRET
```

## Structure

```
src/
  app/
    page.tsx                  → Landing
    login/                    → Connexion commerçant
    signup/                   → Création de compte + business
    dashboard/
      layout.tsx              → Sidebar + auth guard
      page.tsx                → Accueil (stats + actions)
      programme/              → Mécanique de fidélité
      card/                   → Personnalisation de la carte (live preview)
      clients/                → Liste + détail client
      offers/                 → Offres
      campaigns/              → Campagnes push (manuel & programmé)
      automations/            → Déclencheurs auto
      scanner/                → Scan QR
      analytics/              → Stats & activité
      billing/                → Plans
    c/[qr]/                   → Page carte client publique (PWA)
    api/
      onboarding/             → Création business
      scan/                   → +1 tampon
      customers/              → CRUD clients
      push/subscribe/         → Enregistrer une push sub
      push/notify-customer/   → Push à un client
      campaigns/send/         → Envoyer une campagne maintenant
      cron/dispatch/          → Worker des campagnes programmées
  lib/
    supabase/                 → Clients SSR + Service role
    push.ts                   → web-push wrapper
  components/
    Sidebar.tsx               → Navigation latérale (style Cagnotiz, bordeaux)
    Topbar.tsx                → Breadcrumb + recherche
supabase/schema.sql           → Schéma complet (RLS)
public/sw.js                  → Service worker pour push
```

## TODO suite

- Scanner QR caméra (jsQR) en plus du code manuel
- Apple/Google Wallet pass generation (.pkpass)
- Stripe pour la facturation des plans
- i18n
- Tests
