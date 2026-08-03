# Gloops — Ma Cave

Application de gestion de cave à vin (cave électrique ~90 bouteilles) : visualisation avec filtres, ajout de bouteille par photo avec reconnaissance automatique par IA, chat sommelier, authentification multi-utilisateurs.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Supabase](https://supabase.com) : base de données Postgres, authentification, stockage des photos
- [Claude (Anthropic)](https://console.anthropic.com) : analyse des étiquettes par vision, chat sommelier

## Démarrer en local

1. Copier `.env.local.example` vers `.env.local` et renseigner les clés Supabase et Anthropic.
2. Exécuter `supabase/schema.sql` dans l'éditeur SQL de ton projet Supabase (table `bottles`, RLS, bucket de stockage).
3. Installer les dépendances puis lancer le serveur de dev :

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Déploiement

Pensé pour être déployé sur [Vercel](https://vercel.com), avec les mêmes variables d'environnement que `.env.local` renseignées dans les paramètres du projet.
