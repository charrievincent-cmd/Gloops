import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Garde en mémoire côté téléphone les pages déjà visitées (Cave, Historique…)
    // pendant 5 minutes : revenir sur un onglet est instantané. Les vues
    // rechargent ensuite leurs données en arrière-plan pour rester à jour.
    staleTimes: {
      dynamic: 300,
    },
  },
};

export default nextConfig;
