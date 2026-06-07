# Handoff : Walletiz – Site marketing

> **⚠️ État actuel du projet (mis à jour) :**
> - Le site est **entièrement responsive** (desktop, tablette, mobile) avec 3 paliers : ≤1024px, ≤768px, ≤480px.
> - La nav passe en **menu hamburger** sous 768px (panneau qui glisse depuis la droite, focus piégé, scroll bloqué, accessible).
> - Les sections **« Démo interactive »** et **« Sécurité & confiance »** ont été **supprimées** (ne pas les réintégrer). Les sections plus bas dans ce README qui les décrivent sont **obsolètes** — ignore-les.
> - Ordre actuel des sections : Nav → Hero → Comment ça marche → Tarifs → Avantages → Témoignages → FAQ → CTA → Footer.

## Vue d'ensemble
Site marketing pour **Walletiz**, une solution de carte de fidélité 100% digitale (Apple Wallet / Google Wallet) destinée aux commerçants. Le site présente le produit, son fonctionnement, ses avantages, les tarifs et la FAQ.

Positionnement : **N°1 de la fidélisation digitale dans les DOM-TOM**.

## À propos des fichiers de design
Les fichiers de ce dossier (`index.html` + `assets/`) sont une **référence de design réalisée en HTML/CSS/JS vanilla** — un prototype haute-fidélité qui montre le look final, les interactions et les animations attendus. **Ce n'est pas du code de production à copier tel quel.**

La mission consiste à **recréer ce design dans l'environnement cible** :
- Si un codebase existe déjà (Next.js, Vite + React, Astro, etc.) → recréer dans son framework et ses conventions.
- Sinon → choisir le framework le plus adapté (recommandé : **Next.js** ou **Astro** pour un site marketing statique avec bonnes performances SEO).

## Fidélité
**Haute-fidélité (hifi)** — Les couleurs, la typo, les espacements, les animations et les interactions sont définitifs. À reproduire au pixel près en utilisant les conventions du codebase cible.

## Identité visuelle

### Couleurs
| Token | Valeur | Usage |
|---|---|---|
| `--burgundy` | `#7a1232` | Couleur principale (CTA, accents, badges) |
| `--burgundy-dark` | `#5a0d24` | Hover des boutons principaux |
| `--burgundy-light` | `#9a1a40` | Variante claire |
| `--ink` | `#0f0f10` | Texte principal, fonds sombres |
| `--ink-2` | `#1a1a1c` | Surfaces sombres secondaires |
| `--cream` / `--cream-2` | `#ffffff` | Fond principal |
| `--gray-1` | `#f7f5f2` | Fond très clair (section pricing) |
| `--gray-2` | `#e8e3dc` | Bordures |
| `--gray-3` | `#b8b1a8` | Texte tertiaire / placeholder logos |
| `--gray-4` | `#6b6660` | Texte secondaire |
| `--gray-5` | `#2a2826` | Surface dark mode |
| `--success` | `#1f7a4d` | Indicateurs positifs |

### Typographie
- **Inter** (400, 500, 600, 700) — corps de texte
- **Inter Tight** (500, 600, 700, 800) — titres, chiffres, accents
- **JetBrains Mono** (400, 500) — éléments techniques (codes-barres, pills de démo)
- Tous via Google Fonts.

Hiérarchie :
- H1 hero : 68px, weight 700, line-height 1.05, letter-spacing -0.02em, `text-wrap: balance`
- H2 section : 48px, weight 700
- H3 story : 36px / H3 step : 18px / H3 feature : 19px
- Body : 17-18px (hero-sub), 14-16px (corps), 11-13px (méta)

### Rayons et ombres
| Token | Valeur |
|---|---|
| `--radius-sm` | `8px` |
| `--radius` | `12px` |
| `--radius-lg` | `18px` |
| `--radius-xl` | `28px` |
| `--shadow-sm` | `0 1px 2px rgba(15,15,16,0.04), 0 1px 3px rgba(15,15,16,0.06)` |
| `--shadow` | `0 4px 12px rgba(15,15,16,0.06), 0 12px 32px rgba(15,15,16,0.08)` |
| `--shadow-lg` | `0 24px 60px rgba(15,15,16,0.16)` |

### Layout
- Container max-width : `1280px`, padding horizontal : `32px`
- Section padding vertical : `100px`
- Hero padding : `80px 0 100px`

## Sections (dans l'ordre)

### 1. Nav (sticky)
- Brand : logo `assets/walletiz-logo.webp` dans une div 36×36 bordeaux + nom "Walletiz" (Inter Tight 19px)
- Liens : Comment ça marche, Avantages, Témoignages, Tarifs, Sécurité, FAQ (14px, gray-4)
- CTA : "Prendre rendez-vous" (bouton bordeaux) → `https://calendly.com/walletiz`
- Backdrop blur 14px, fond `rgba(253,248,243,0.78)`

### 2. Hero
- Grid 1.05fr / 1fr, gap 64px
- Eyebrow "Nouveau · Carte de fidélité digitale" (pill bordeaux clair)
- H1 : "La fidélité **digitale** qui fait revenir vos clients." (le mot "digitale" en bordeaux, italique stylisé via `<em>`)
- Sub : description du produit (gray-4, max-width 540px)
- Actions : "Prendre rendez-vous" (bordeaux, btn-lg) + "Voir la démo" (outline, btn-lg)
- Hero-trust : "Sans engagement" + "Support FR 7j/7" avec checks bordeaux
- **Hero-claim** : "★ N°1 de la fidélisation digitale de la clientèle dans les DOM-TOM." (bordeaux, Inter Tight 15px, 600)
- **Hero mockup (côté droit)** :
  - Téléphone 280×560px, radius 38px, fond bordeaux gradient, ombre lg
  - Écran : status bar, "Bonjour / Camille 👋", carte fidélité "Café Lumière" GOLD, grille de 10 stamps (7 cochés + numéro 8/9 + 🎁), code-barres SVG en bas
  - Carte dashboard floatante : "EN DIRECT" avec point pulsé, 3 live-stats (1 443 clients actifs +55, 125 tampons aujourd'hui +125, 2 récompenses +31), mini bar chart (7 barres animées) avec L M M J V S D
  - Hauteur totale 580px

### 3. Comment ça marche (id="how")
Grille 3 colonnes pour les étapes 1-2-3, puis carte large (grid-column: 1/-1) pour l'étape 4.

- **Étape 1 — Création de votre carte** : illustration = mini-téléphone (réutilise le phone du hero) scalé à 40%
- **Étape 2 — Affichez le QR code** : vidéo `assets/qr-scanner.webm` (autoplay, loop, muted, playsinline), height 100px, margin-top 64px
- **Étape 3 — Vos clients scannent** : vidéo `assets/qr-scan.webm`, max 80×80px, margin-top 64px
- **Étape 4 — Suivez tout en temps réel** (carte WIDE, fond clair comme les autres) :
  - step-num 84×84px bordeaux
  - h3 32px, p 16px, max-width 560px
  - Illustration : 3 lignes notif animées qui slident en boucle (Julien — Récompense ! 🎁 / Anthony — 7/10 tampons 🎯 / Emma — Nouvelle cliente ✨) — animation `sn-slide` 4s ease infinite avec delays décalés

### 4. Story "L'outil pensé pour tout les commerces" (story-stack)
- H3 + p + ul.story-list 3 items avec icônes SVG bordeaux
- Image : `assets/shopkeeper-laptop.jpg` (ratio 16/9)

### 5. Story "Transformez chaque visite en client fidèle" (story alternée)
- Grid 1fr/1fr, gap 56px
- Eyebrow "L'expérience client", h3, p, 3 puces avec icônes
- Image à droite (cf. fichier)

### 6. Sécurité & confiance (id="security")
- Carte sombre `var(--ink)` radius 28px, padding 56px
- Grid 1.2fr/1fr
- H2, p, ul de 4 items (hébergement FR, RGPD, etc.) avec icônes dans pastilles
- 2 security-badges chiffrés (gradient blanc → rose pâle sur les chiffres)

### 7. Démo interactive (id="demo")
- Carte sombre full-width avec gradient bordeaux
- Grid 1fr/1.2fr
- Gauche : eyebrow, h2 "Créez votre carte de fidélité en direct.", liste de points
- Droite : `.demo-builder` interactif
  - 4 étapes (1/4 → 4/4) avec form-rows : nom boutique, secteur, couleur (palette de swatches), nombre de tampons, récompense
  - Aperçu live de la carte (`.demo-preview-card`) qui se met à jour
  - Boutons Précédent / Suivant
  - Écran final "🎉 Votre carte est prête" avec CTA

### 8. Tarifs (id="pricing", fond gray-1)
- Tabs "Mensuel" / "Annuel -30%" qui switchent les prix via `data-month` / `data-year`
- Grid 2 colonnes, max-width 880px
- 2 plans :
  - **Starter** (47€/mois, 33€/mois annuel) : 500 clients, 100 SMS/mois
  - **Pro** (97€/mois, 68€/mois annuel) — **featured** (fond noir, badge "POPULAIRE") : clients illimités, SMS illimités, multi-boutiques, support prioritaire

### 9. Avantages (id="features")
Grid 3 colonnes (rangée unique de 3 cartes) :
1. **Augmentation du CA +15 à 25%** — texte + vidéo `assets/trend-graphic.webm` (180px max, autoplay loop)
2. **Apple & Google Wallet** — texte + boutons Apple Wallet (noir pill) et Google Wallet (blanc pill bordered) en bas (`margin-top: 40px`)
3. **Push illimités** — texte + GIF `assets/notifications.gif` (full width)

Cartes : flex column, fond blanc, border gray-2, radius 18px, padding 32px.

### 10. Témoignages (id="testimonials")
- Marquee animé (`testi-scroll` 50s linear infinite)
- Cartes 380px, fond blanc, étoiles bordeaux (★★★★★), citation Inter Tight 17px, avatar 48px + nom/rôle
- Pause au hover
- Masque dégradé sur les bords (`-webkit-mask-image`)

### 11. FAQ (id="faq")
- Grid 2 colonnes (gap 12px / 32px), max-width 980px
- Items pliables : bordure-bas gray-2, toggle 28×28 qui tourne 45° et passe en bordeaux à l'ouverture
- Animation max-height + margin-top sur `.faq-a`

### 12. CTA band
- Carte bordeaux full-width, radius 28px, padding 64px, center
- H2 48px + p + 2 boutons (blanc plein + outline)
- Background-image radial gradient pour effet de relief

### 13. Footer
- Grid 1.4fr/1fr/1fr/1fr
- Brand + description + 3 colonnes de liens (Produit, Ressources, Légal)
- Bottom : copyright + liens utilitaires

## Interactions & animations clés

### Microinteractions
- **Boutons** : `transform: translateY(-1px)` au hover, transition 120ms
- **Cards (.step, .feature)** : hover `translateY(-4px)`, bordure passe à bordeaux, shadow apparaît
- **Icônes** (`.feature-ico`, `.step-num`, `.story-list .ico`...) : transitions cubic-bezier(.34,1.56,.64,1), rotations + scales au hover du parent
- **FAQ** : toggle passe à `rotate(45deg)` + fond bordeaux à l'ouverture
- **Pricing tabs** : switch instantané des `data-month` ↔ `data-year`

### Animations CSS clés (keyframes)
- `live-pulse` (1.8s) : aura qui s'agrandit autour du point "EN DIRECT"
- `bar-rise` (2.6s) : barres mini-chart respirent
- `bar-grow` (2.5s) : barres de la carte revenue
- `sn-slide` (4s) : notifications glissent en boucle dans l'étape 4
- `testi-scroll` (50s linear) : marquee témoignages
- `float-up`, `icon-pulse`, `icon-bounce`, `stars-wiggle`, `bell-shake` : micro-animations au hover

### Logique JS attendue
- **Pricing toggle** : `setBilling(tabEl, 'month'|'year')` — change la classe active et lit `data-month` / `data-year` pour chaque `.price-amount`
- **FAQ toggle** : click sur `.faq-item` → toggle classe `.open`
- **Demo builder** : state-machine 4 étapes, validation des champs, preview live de la carte, transition vers `.demo-success`
- **Témoignages** : track infini (dupliquer le contenu pour boucler proprement)

## Gestion d'état (recommandée pour la version React/Next)
- `billingPeriod: 'month' | 'year'` — Pricing
- `openFaqIds: Set<string>` — FAQ
- `demoStep: 1..4`, `demoData: { shopName, sector, color, stampCount, reward }` — Démo
- Pas de fetch nécessaire (site statique)

## Comportement responsive
Breakpoint principal : `960px`
- `hero-grid`, `demo-wrap`, `.security` → 1 colonne
- `.steps`, `.features`, `.pricing-grid`, `.faq-grid` → 1 colonne
- Hero h1 : 68px → 44px
- Marquee témoignages : cartes 380px → 300px

Mobile (à compléter selon besoins) :
- Nav : prévoir un menu burger
- Hero mockup : peut être masqué ou empilé sous le texte
- Carte d'étape 4 : `grid-template-columns: 1fr` + padding réduit

## Assets

Dossier `assets/` inclus :
| Fichier | Usage |
|---|---|
| `walletiz-logo.webp` | Logo bordeaux dans la nav et le footer |
| `qr-scanner.webm` | Vidéo étape 2 (chevalet plexiglas) |
| `qr-scan.webm` | Vidéo étape 3 (scan client) |
| `trend-graphic.webm` | Animation graphique CA en bordeaux (carte Avantages #1) |
| `notifications.gif` | Animation notifications push (carte Avantages #3) |
| `shopkeeper-laptop.jpg` | Photo commerçante avec ordinateur (story 1) |
| (autres images dans `assets/`) | Photos d'illustration des stories |

**Note** : les vidéos `.webm` sont en autoplay+loop+muted+playsinline. Prévoir un fallback `<img>` ou poster si compatibilité Safari < 14.

## Liens externes
- CTA "Prendre rendez-vous" → `https://calendly.com/walletiz` (target="_blank" rel="noopener")

## Fichiers fournis
- `index.html` — le prototype complet, structure + styles inline + scripts
- `assets/` — tous les médias et logos référencés

## Recommandations techniques
1. **Framework** : Next.js (App Router) ou Astro pour bonnes perfs SEO (le site est statique, idéal pour SSG).
2. **Style** : Tailwind CSS avec tokens custom (mapper les `--burgundy`, `--ink`, etc. dans `tailwind.config`), ou CSS Modules / vanilla-extract.
3. **Composants à découper** :
   - `<Nav />`, `<Hero />`, `<PhoneMockup />`, `<DashCard />`
   - `<HowItWorks />` (avec `<Step />` × 4)
   - `<StorySection reverse?>`, `<Security />`, `<DemoBuilder />`
   - `<Pricing />` (avec `<PriceCard />`), `<Features />` (avec `<FeatureCard />`)
   - `<Testimonials />` (marquee), `<Faq />`, `<CtaBand />`, `<Footer />`
4. **Animations** : Framer Motion pour les hovers complexes et les apparitions au scroll si désirées (le HTML actuel n'a pas de scroll-reveal mais ce serait un plus).
5. **Optimisation images** : utiliser `next/image` ou `astro:assets` ; conserver les `.webm` mais ajouter `.mp4` fallback pour Safari iOS < 14.
6. **A11y** : ajouter `aria-expanded` sur FAQ, alt texts complets, focus visible sur tous les interactifs, contraste OK (déjà respecté avec bordeaux/blanc).
7. **SEO** : titre, méta-description, OG image, sitemap, robots.txt, structured data `Product` / `Organization`.

---

Pour toute question sur l'intention design ou un détail visuel, se référer directement à `index.html` (les styles et le markup sont commentés par section).
