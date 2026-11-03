"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FONTS } from "@/lib/design-tokens";

/** Contenance de la cave (nombre de bouteilles). */
export const CAVE_CAPACITY = 90;

/** Événement envoyé par les vues quand des bouteilles changent (bue, ajoutée, supprimée…). */
export const BOTTLES_CHANGED_EVENT = "gloops:bottles-changed";

export function notifyBottlesChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(BOTTLES_CHANGED_EVENT));
}

// Bouteille couchée, culot à gauche, goulot à droite (viewBox 300 × 40).
const BOTTLE_PATH =
  "M 10 4 H 212 C 232 4 236 14 252 14 H 279 V 10.5 H 292 Q 294 10.5 294 12.5 V 27.5 Q 294 29.5 292 29.5 H 279 V 26 H 252 C 236 26 232 36 212 36 H 10 Q 2 36 2 28 V 12 Q 2 4 10 4 Z";
const FILL_START = 2;
const FILL_END = 294;

export function CaveGauge() {
  const pathname = usePathname();
  const uid = useId().replace(/:/g, "");
  const [count, setCount] = useState<number | null>(null);
  const [version, setVersion] = useState(0);

  // Recharge au changement d'onglet et quand une vue signale un changement.
  useEffect(() => {
    const onChange = () => setVersion((v) => v + 1);
    window.addEventListener(BOTTLES_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(BOTTLES_CHANGED_EVENT, onChange);
  }, []);

  useEffect(() => {
    let active = true;
    createClient()
      .from("bottles")
      .select("id", { count: "exact", head: true })
      .is("consumed_at", null)
      .then(({ count: c }) => {
        if (active && c !== null) setCount(c);
      });
    return () => {
      active = false;
    };
  }, [pathname, version]);

  const n = count ?? 0;
  const ratio = Math.min(n / CAVE_CAPACITY, 1);
  const fillX = FILL_START + ratio * (FILL_END - FILL_START);
  const label = count === null ? "…" : `${n} / ${CAVE_CAPACITY} bouteilles`;
  const title = `Cave remplie à ${Math.round((n / CAVE_CAPACITY) * 100)} %`;

  const textProps = {
    x: 112,
    y: 20,
    textAnchor: "middle" as const,
    dominantBaseline: "central" as const,
    fontFamily: FONTS.body,
    fontSize: 13.5,
    fontWeight: 600,
  };

  return (
    <div title={title} role="img" aria-label={title} style={{ flex: 1, minWidth: 0, maxWidth: 360 }}>
      <svg viewBox="0 0 300 40" style={{ width: "100%", height: "auto", display: "block", maxHeight: 40 }} aria-hidden>
        <defs>
          <clipPath id={`bottle-${uid}`}>
            <path d={BOTTLE_PATH} />
          </clipPath>
          <clipPath id={`wine-${uid}`}>
            <rect x="0" y="0" width={fillX} height="40" />
          </clipPath>
          <linearGradient id={`winegrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--maroon-bright)" />
            <stop offset="1" stopColor="var(--maroon)" />
          </linearGradient>
        </defs>

        {/* Verre */}
        <path d={BOTTLE_PATH} fill="var(--bg-alt)" />
        {/* Vin */}
        <g clipPath={`url(#bottle-${uid})`}>
          <rect
            x="0"
            y="0"
            width={fillX}
            height="40"
            fill={`url(#winegrad-${uid})`}
            style={{ transition: "width 0.6s ease" }}
          />
          {/* Reflet sur le verre */}
          <path d="M 12 8.5 H 208" stroke="#fff" strokeOpacity="0.28" strokeWidth="2.2" strokeLinecap="round" />
        </g>
        <path d={BOTTLE_PATH} fill="none" stroke="var(--ink-faint)" strokeOpacity="0.55" strokeWidth="1.4" />

        {/* Chiffres : sombres sur le verre vide, clairs sur le vin */}
        <text {...textProps} fill="var(--ink)">
          {label}
        </text>
        <text {...textProps} fill="#FFF6EA" clipPath={`url(#wine-${uid})`}>
          {label}
        </text>
      </svg>
    </div>
  );
}
