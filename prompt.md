# Prompt de reconstruction — Gloops 2.0

> Ce fichier est le prompt de référence permettant de reconstruire entièrement l'application à partir de rien. Il doit être tenu à jour à chaque évolution du projet. Copier-coller son contenu (section "Prompt") dans une nouvelle conversation avec Claude Code suffit à faire regénérer l'application telle qu'elle est aujourd'hui.

## Prompt

Je veux une application de gestion de ma cave à vin, appelée **Gloops 2.0**. C'est une cave électrique permettant de stocker environ 90 bouteilles, principalement du vin rouge mais aussi du blanc (et parfois du rosé).

### Fonctionnalités

**1. Visualisation de la cave**
Affichage du contenu par vignettes (photo, nom, année), groupées par étagère. Cliquer sur une vignette ouvre le détail complet : nom, année, type (rouge/blanc/rosé), IGP, AOP/AOC, vignoble, cépages, gamme (basique/bon/excellent), étagère, infos de conservation, commentaire. La vue propose des filtres (recherche texte libre + type + gamme + étagère). Seules les bouteilles **disponibles** (non consommées) apparaissent ici.

**2. Ajout d'une bouteille (ou d'un lot de bouteilles identiques)**
Bouton « + » → prise de photo de l'étiquette → la photo est envoyée à un modèle de vision IA qui pré-remplit automatiquement : nom, année, type, IGP, AOP/AOC, vignoble, cépages, gamme, infos de conservation. Les champs étagère et commentaire restent toujours à saisir manuellement, ainsi que tout champ que l'IA n'a pas réussi à déterminer. Un champ quantité permet d'enregistrer plusieurs bouteilles identiques en une fois.

**3. Consommation d'une bouteille + historique**
Depuis le détail d'une bouteille, un bouton permet de la marquer comme consommée (« J'en ai bu une » si le lot en compte plusieurs, « Marquer comme bue » s'il n'en reste qu'une). La bouteille disparaît alors de la cave disponible mais n'est **jamais supprimée** : elle passe dans un onglet **Historique**, qui liste les bouteilles bues groupées par mois, avec leur date de consommation. Depuis l'historique, deux actions : « Remettre en cave » (annule la consommation, utile en cas de clic accidentel) ou « Supprimer définitivement » (vraie suppression, pour corriger une erreur de saisie). Le bouton « Supprimer » présent dans la cave reste, lui, une suppression définitive immédiate — fonctionnellement distinct de la consommation.

**4. Chat sommelier (IA)**
Une page de chat permet de poser des questions en langage naturel sur l'inventaire réel de la cave (bouteilles disponibles), par exemple « conseille-moi un vin dont la date limite de conservation est bientôt atteinte et qui se marie bien avec de la raclette ». Les réponses doivent se baser uniquement sur les bouteilles réellement présentes.

**5. Authentification**
Plusieurs comptes utilisateurs peuvent se connecter et partagent la même cave (pas d'isolation des données par utilisateur). Il n'y a pas d'auto-inscription publique : les comptes sont créés manuellement par l'administrateur (moi) via le dashboard du fournisseur d'authentification. L'app n'expose qu'un écran de connexion (email + mot de passe), qui affiche le message d'erreur réel renvoyé par le fournisseur d'auth en cas d'échec (pas un message générique).

### Contraintes techniques imposées

- **Plateforme** : application web responsive installable en PWA (utilisée principalement depuis un téléphone pour prendre les photos), icône basée sur le logo de marque.
- **Hébergement** : cloud managé (pas de self-hosting).
- **IA** : API Claude (Anthropic), modèle `claude-sonnet-5`, appelée **uniquement côté serveur** (jamais depuis le navigateur, pour ne jamais exposer la clé API) — pour l'analyse photo (vision) et pour le chat sommelier.
- **Modèle de données** : une ligne de base de données = une bouteille physique (pas un simple champ quantité). Un « lot » de bouteilles identiques ajoutées ensemble partage un même `lot_id` ; l'affichage regroupe les lignes disponibles d'un même lot en une seule vignette avec un badge `×N`. Consommer une bouteille pose une date de consommation sur une seule ligne du lot (elle n'est pas supprimée). Modifier une vignette met à jour en masse tous les champs descriptifs des lignes du lot (pas d'édition bouteille-par-bouteille dans l'UI).

### Stack technique à utiliser

- **Next.js (App Router) + TypeScript**, déployé sur **Vercel**.
- **Supabase** : Postgres (données), Auth (comptes utilisateurs, email/mot de passe, auto-inscription publique désactivée), Storage (photos des étiquettes, bucket public en lecture, écriture réservée aux utilisateurs authentifiés).
- **Anthropic Claude API** côté serveur (routes API Next.js) pour la vision (analyse photo) et le chat.
- Styles : objet de design tokens en styles inline React dont les valeurs sont des `var(--xxx)` pointant vers des variables CSS définies dans `globals.css` (support clair/dark natif via `prefers-color-scheme`, sans changer l'API des composants), `lucide-react` pour les icônes. Quelques classes utilitaires globales (`gloops-card`, `gloops-btn`) portent les interactions `:hover`/`:focus-visible` que les styles inline ne peuvent pas exprimer.
- PWA : `manifest.json` + icônes installables, générées à partir du logo de marque.

### Identité de marque et design system

Nom : **Gloops 2.0**. Logo : glyphe circulaire (carafe qui verse du vin dans un verre, motif cépage/circuit) en dégradé bordeaux → cuivre, mot-clé « Gloops » en bordeaux foncé, « 2.0 » en cuivre, sur fond papier crème. L'icône d'app est un recadrage carré de ce seul glyphe (sans le mot-clé texte), sur fond papier assorti au thème clair.

Palette en variables CSS (`:root` = thème clair par défaut, inspiré du logo ; `@media (prefers-color-scheme: dark)` = variante sombre, même accent) :

```
Clair (défaut)                          Sombre (prefers-color-scheme: dark)
--bg: #F5F1E8   --bg-alt: #EDE6D6         --bg: #15110D   --bg-alt: #1C1712
--surface: #FFFDF8  --surface-raised: #FFFFFF   --surface: #241D16  --surface-raised: #2C2318
--hairline: #E3D9C6                      --hairline: #3A2E20
--ink: #2B1712  --ink-muted: #6B5D4F  --ink-faint: #9C8F7D    --ink: #EDE3CE  --ink-muted: #A99A80  --ink-faint: #6E6350
--maroon: #6B1B2A  --maroon-bright: #8B2635    --maroon: #7A2036  --maroon-bright: #9C3049
--copper: #C17A4A (identique dans les deux thèmes — dégradé de marque : linear-gradient(135deg, var(--maroon), var(--copper)))
--gold: #A9782E  --gold-soft: #8C6425          --gold: #C9A227  --gold-soft: #E4CC7A
--blanc-accent: #A9822A  --rose-accent: #C36B82   --blanc-accent: #C9B458  --rose-accent: #D98A9B
--danger: #B23A3A (identique)
--shadow: rgba(43,23,18,0.12)             --shadow: rgba(0,0,0,0.4)
--overlay-soft, --header-bg               (variantes clair/sombre, voir globals.css)
```

Typographies : `Fraunces` (titres/serif display), `Inter` (texte courant), `IBM Plex Mono` (données chiffrées : années, quantités, badges, dates).

Modernité visuelle : ombres douces sur les cartes/boutons primaires (élévation plutôt que panneaux plats), dégradé de marque bordeaux→cuivre sur les boutons primaires et états actifs de navigation, effet de survol (légère élévation) sur les vignettes bouteille.

### Modèle de données (SQL — Supabase/Postgres)

```sql
create table public.bottles (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null default gen_random_uuid(),
  nom text,
  annee text,
  type text check (type in ('rouge', 'blanc', 'rosé')),
  igp text,
  aop text,
  vignoble text,
  cepages text,
  gamme text check (gamme in ('basique', 'bon', 'excellent')),
  etagere text,
  conservation text,
  commentaire text,
  photo_url text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  consumed_at timestamptz
);

alter table public.bottles enable row level security;
create policy "authenticated read" on public.bottles for select to authenticated using (true);
create policy "authenticated insert" on public.bottles for insert to authenticated with check (true);
create policy "authenticated update" on public.bottles for update to authenticated using (true);
create policy "authenticated delete" on public.bottles for delete to authenticated using (true);

insert into storage.buckets (id, name, public) values ('bottle-photos', 'bottle-photos', true) on conflict (id) do nothing;
create policy "public read bottle photos" on storage.objects for select using (bucket_id = 'bottle-photos');
create policy "authenticated upload bottle photos" on storage.objects for insert to authenticated with check (bucket_id = 'bottle-photos');
create policy "authenticated delete bottle photos" on storage.objects for delete to authenticated using (bucket_id = 'bottle-photos');
```

`consumed_at` : `null` = bouteille disponible (visible en cave), renseigné = bouteille consommée (visible en historique uniquement).

### Structure du projet

```
app/
  layout.tsx                # layout racine, manifest PWA, meta thème clair/sombre
  page.tsx                  # redirige vers /cave
  login/page.tsx
  (app)/layout.tsx           # nav + garde de session, dynamic="force-dynamic"
  (app)/cave/page.tsx        # server component, bouteilles disponibles (consumed_at is null)
  (app)/add/page.tsx
  (app)/history/page.tsx     # server component, bouteilles consommées (consumed_at is not null)
  (app)/chat/page.tsx
  api/analyze-photo/route.ts # POST image -> Claude vision -> JSON structuré
  api/chat/route.ts          # POST message+historique -> Claude -> réponse texte
components/
  ui.tsx                    # Field, TextInput, TextArea, Select, ActionBtn, GammeBadge
  BottleCard.tsx             # accepte subtitle/hideQuantityBadge (réutilisé par Cave et Historique)
  DetailModal.tsx            # prop mode: "cave" | "history" bascule les actions affichées
  CaveView.tsx, AddView.tsx, ChatView.tsx, HistoryView.tsx
  AuthForm.tsx, NavHeader.tsx
lib/
  design-tokens.ts          # palette C (valeurs var(--xxx)), BRAND_GRADIENT, FONTS, TYPE_COLOR, GAMME_LABEL, WINE_TYPES, GAMMES
  types.ts                  # Bottle, BottleLot, groupIntoLots(), toSingleLot()
  image.ts                  # resizeImage (canvas), dataUrlToBlob
  anthropic.ts               # client Anthropic serveur (server-only), modèle claude-sonnet-5
  supabase/client.ts          # client navigateur (@supabase/ssr)
  supabase/server.ts          # client serveur (cookies Next.js)
proxy.ts                     # garde d'authentification Next.js (anciennement middleware.ts)
supabase/schema.sql           # script SQL ci-dessus + section migration consumed_at
public/manifest.json, public/icons/ (icon-192.png, icon-512.png, icon-mark.png générés depuis logo.jpg)
logo.jpg                      # logo source (glyphe + wordmark), à la racine du projet
.env.local.example
```

### Détails d'implémentation importants

- Les pages sous `(app)` (cave, add, chat, history) doivent être en rendu dynamique forcé (`export const dynamic = "force-dynamic"`) car elles dépendent de la session utilisateur — jamais de contenu statique partagé entre utilisateurs.
- Le fichier de garde d'authentification s'appelle `proxy.ts` à la racine (export nommé `proxy`, pas `middleware`) — convention Next.js 16 qui remplace `middleware.ts`. Il redirige les visiteurs non authentifiés vers `/login`, et les utilisateurs authentifiés visitant `/login` vers `/cave`. Les routes `/api/*` sont exclues de cette redirection : elles vérifient elles-mêmes l'authentification et renvoient un 401 JSON.
- Les erreurs de connexion affichent le message d'erreur réel renvoyé par Supabase (`signInError.message`), pas un message générique, pour faciliter le diagnostic.
- Prompt d'analyse photo : demander à Claude de répondre uniquement en JSON avec les clés `nom, annee, type, igp, aop, vignoble, cepages, gamme, conservation`, avec `null` pour tout champ non déterminable.
- Prompt du chat sommelier : fournir tout l'inventaire courant (regroupé par lot avec quantité) en JSON dans le system prompt, consigne stricte de ne jamais citer un vin absent de la liste.
- L'icône d'app est recadrée depuis `logo.jpg` (glyphe seul, sans le mot-clé texte) puis posée sur un fond carré de la couleur de fond du thème clair (`#F5F1E8`), pour un rendu propre en petite taille.
- Toute nouvelle valeur de couleur codée en dur (`rgba(255,255,255,...)`, `rgba(21,17,13,...)`, etc.) doit être évitée au profit d'une variable CSS thème-aware, sauf pour les éléments qui se superposent à une photo (badges/boutons sur vignette) où une teinte sombre fixe reste volontairement indépendante du thème.

### Variables d'environnement nécessaires

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

### Déploiement

Dépôt GitHub : `charrievincent-cmd/Gloops` (public). Déployé sur Vercel (projet `gloops`), URL de production : `https://gloops-smoky.vercel.app`. Les mêmes variables d'environnement que `.env.local` doivent être configurées dans les paramètres du projet Vercel. Toute modification du schéma de base de données (ex. ajout d'une colonne) doit être appliquée manuellement dans l'éditeur SQL Supabase avant ou en même temps que le déploiement du code qui en dépend.

---

## Historique des évolutions

- **2026-08-03** — Version initiale : les 4 fonctionnalités cœur (visualisation, ajout par photo + IA, chat sommelier, authentification), stack Next.js + Supabase + Claude, déployée sur Vercel.
- **2026-08-04** — Refonte design (thème clair « papier » par défaut + variante sombre, dégradé de marque bordeaux→cuivre, ombres/hover), rebranding complet « Ma Cave » → **Gloops 2.0** avec nouveau logo (icône PWA, favicon, badges dans l'app), ajout de la consommation de bouteille (`consumed_at`) qui la retire de la cave sans la supprimer, nouvel onglet **Historique** (bouteilles consommées groupées par mois, avec restauration possible).
