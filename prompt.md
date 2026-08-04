# Prompt de reconstruction — Ma Cave (Gloops)

> Ce fichier est le prompt de référence permettant de reconstruire entièrement l'application à partir de rien. Il doit être tenu à jour à chaque évolution du projet. Copier-coller son contenu (section "Prompt") dans une nouvelle conversation avec Claude Code suffit à faire regénérer l'application telle qu'elle est aujourd'hui.

## Prompt

Je veux une application de gestion de ma cave à vin. C'est une cave électrique permettant de stocker environ 90 bouteilles, principalement du vin rouge mais aussi du blanc (et parfois du rosé).

### Fonctionnalités

**1. Visualisation de la cave**
Affichage du contenu par vignettes (photo, nom, année), groupées par étagère. Cliquer sur une vignette ouvre le détail complet : nom, année, type (rouge/blanc/rosé), IGP, AOP/AOC, vignoble, cépages, gamme (basique/bon/excellent), étagère, infos de conservation, commentaire. La vue propose des filtres (recherche texte libre + type + gamme + étagère).

**2. Ajout d'une bouteille (ou d'un lot de bouteilles identiques)**
Bouton « + » → prise de photo de l'étiquette → la photo est envoyée à un modèle de vision IA qui pré-remplit automatiquement : nom, année, type, IGP, AOP/AOC, vignoble, cépages, gamme, infos de conservation. Les champs étagère et commentaire restent toujours à saisir manuellement, ainsi que tout champ que l'IA n'a pas réussi à déterminer. Un champ quantité permet d'enregistrer plusieurs bouteilles identiques en une fois.

**3. Chat sommelier (IA)**
Une page de chat permet de poser des questions en langage naturel sur l'inventaire réel de la cave, par exemple « conseille-moi un vin dont la date limite de conservation est bientôt atteinte et qui se marie bien avec de la raclette ». Les réponses doivent se baser uniquement sur les bouteilles réellement présentes.

**4. Authentification**
Plusieurs comptes utilisateurs peuvent se connecter et partagent la même cave (pas d'isolation des données par utilisateur). Il n'y a pas d'auto-inscription publique : les comptes sont créés manuellement par l'administrateur (moi) via le dashboard du fournisseur d'authentification. L'app n'expose qu'un écran de connexion (email + mot de passe).

### Contraintes techniques imposées

- **Plateforme** : application web responsive installable en PWA (utilisée principalement depuis un téléphone pour prendre les photos).
- **Hébergement** : cloud managé (pas de self-hosting).
- **IA** : API Claude (Anthropic), modèle `claude-sonnet-5`, appelée **uniquement côté serveur** (jamais depuis le navigateur, pour ne jamais exposer la clé API) — pour l'analyse photo (vision) et pour le chat sommelier.
- **Modèle de données** : une ligne de base de données = une bouteille physique (pas un simple champ quantité). Un « lot » de bouteilles identiques ajoutées ensemble partage un même `lot_id` ; l'affichage regroupe les lignes d'un même lot en une seule vignette avec un badge `×N`. Consommer une bouteille (« j'en ai bu une ») supprime une seule ligne du lot. Modifier une vignette met à jour en masse tous les champs descriptifs des lignes du lot (pas d'édition bouteille-par-bouteille dans l'UI).

### Stack technique à utiliser

- **Next.js (App Router) + TypeScript**, déployé sur **Vercel**.
- **Supabase** : Postgres (données), Auth (comptes utilisateurs, email/mot de passe, auto-inscription publique désactivée), Storage (photos des étiquettes, bucket public en lecture, écriture réservée aux utilisateurs authentifiés).
- **Anthropic Claude API** côté serveur (routes API Next.js) pour la vision (analyse photo) et le chat.
- Styles : objet de design tokens en styles inline React (pas de framework CSS), `lucide-react` pour les icônes.
- PWA : `manifest.json` + icônes installables.

### Design system

Palette sombre, univers « cave à vin / parchemin » :

```
bg: #15110D          bgAlt: #1C1712         surface: #241D16
surfaceRaised: #2C2318   hairline: #3A2E20
parchment: #EDE3CE   parchmentMuted: #A99A80   parchmentFaint: #6E6350
bordeaux: #7A2036    bordeauxBright: #9C3049
gold: #C9A227         goldSoft: #E4CC7A
blanc: #C9B458         rose: #D98A9B
danger: #B23A3A
```

Typographies : `Fraunces` (titres/serif display), `Inter` (texte courant), `IBM Plex Mono` (données chiffrées : années, quantités, badges).

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
  created_at timestamptz not null default now()
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

### Structure du projet

```
app/
  layout.tsx                # layout racine, manifest PWA, polices
  page.tsx                  # redirige vers /cave
  login/page.tsx
  (app)/layout.tsx           # nav + garde de session, dynamic="force-dynamic"
  (app)/cave/page.tsx        # server component, charge les bouteilles initiales
  (app)/add/page.tsx
  (app)/chat/page.tsx
  api/analyze-photo/route.ts # POST image -> Claude vision -> JSON structuré
  api/chat/route.ts          # POST message+historique -> Claude -> réponse texte
components/
  ui.tsx                    # Field, TextInput, TextArea, Select, ActionBtn, GammeBadge
  BottleCard.tsx, DetailModal.tsx, CaveView.tsx, AddView.tsx, ChatView.tsx
  AuthForm.tsx, NavHeader.tsx
lib/
  design-tokens.ts          # palette C, FONTS, TYPE_COLOR, GAMME_LABEL, WINE_TYPES, GAMMES
  types.ts                  # Bottle, BottleLot, groupIntoLots()
  image.ts                  # resizeImage (canvas), dataUrlToBlob
  anthropic.ts               # client Anthropic serveur (server-only), modèle claude-sonnet-5
  supabase/client.ts          # client navigateur (@supabase/ssr)
  supabase/server.ts          # client serveur (cookies Next.js)
proxy.ts                     # garde d'authentification Next.js (anciennement middleware.ts)
supabase/schema.sql           # script SQL ci-dessus
public/manifest.json, public/icons/
.env.local.example
```

### Détails d'implémentation importants

- Les pages sous `(app)` (cave, add, chat) doivent être en rendu dynamique forcé (`export const dynamic = "force-dynamic"`) car elles dépendent de la session utilisateur — jamais de contenu statique partagé entre utilisateurs.
- Le fichier de garde d'authentification s'appelle `proxy.ts` à la racine (export nommé `proxy`, pas `middleware`) — convention Next.js 16 qui remplace `middleware.ts`. Il redirige les visiteurs non authentifiés vers `/login`, et les utilisateurs authentifiés visitant `/login` vers `/cave`. Les routes `/api/*` sont exclues de cette redirection : elles vérifient elles-mêmes l'authentification et renvoient un 401 JSON.
- Les erreurs de connexion doivent afficher le message d'erreur réel renvoyé par Supabase (`signInError.message`), pas un message générique, pour faciliter le diagnostic.
- Prompt d'analyse photo : demander à Claude de répondre uniquement en JSON avec les clés `nom, annee, type, igp, aop, vignoble, cepages, gamme, conservation`, avec `null` pour tout champ non déterminable.
- Prompt du chat sommelier : fournir tout l'inventaire courant (regroupé par lot avec quantité) en JSON dans le system prompt, consigne stricte de ne jamais citer un vin absent de la liste.

### Variables d'environnement nécessaires

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

### Déploiement

Dépôt GitHub : `charrievincent-cmd/Gloops` (public). Déployé sur Vercel (projet `gloops`), URL de production : `https://gloops-smoky.vercel.app`. Les mêmes variables d'environnement que `.env.local` doivent être configurées dans les paramètres du projet Vercel.

---

## Historique des évolutions

- **2026-08-03** — Version initiale : les 4 fonctionnalités ci-dessus, stack Next.js + Supabase + Claude, déployée sur Vercel.
