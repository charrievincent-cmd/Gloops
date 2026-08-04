import type { CSSProperties } from "react";

export const C = {
  bg: "var(--bg)",
  bgAlt: "var(--bg-alt)",
  surface: "var(--surface)",
  surfaceRaised: "var(--surface-raised)",
  hairline: "var(--hairline)",
  parchment: "var(--ink)",
  parchmentMuted: "var(--ink-muted)",
  parchmentFaint: "var(--ink-faint)",
  bordeaux: "var(--maroon)",
  bordeauxBright: "var(--maroon-bright)",
  copper: "var(--copper)",
  gold: "var(--gold)",
  goldSoft: "var(--gold-soft)",
  blanc: "var(--blanc-accent)",
  rose: "var(--rose-accent)",
  danger: "var(--danger)",
  shadow: "var(--shadow)",
  overlaySoft: "var(--overlay-soft)",
  headerBg: "var(--header-bg)",
} as const;

/** Dégradé de marque (glyphe du logo) : boutons primaires, états actifs, badge. */
export const BRAND_GRADIENT = `linear-gradient(135deg, ${C.bordeaux}, ${C.copper})`;

export const FONTS = {
  display: "'Fraunces', 'Georgia', serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const;

export const WINE_TYPES = ["rouge", "blanc", "rosé"] as const;
export const GAMMES = ["basique", "bon", "excellent"] as const;

export const TYPE_COLOR: Record<string, string> = {
  rouge: C.bordeauxBright,
  blanc: C.blanc,
  rosé: C.rose,
};

export const GAMME_LABEL: Record<string, string> = {
  basique: "Basique",
  bon: "Bon",
  excellent: "Excellent",
};

export function inputStyle(withIcon: boolean): CSSProperties {
  return {
    width: "100%",
    padding: withIcon ? "10px 12px 10px 34px" : "10px 12px",
    background: C.bgAlt,
    border: `1px solid ${C.hairline}`,
    borderRadius: 8,
    color: C.parchment,
    fontSize: 14,
    outline: "none",
  };
}

export const linkBtnStyle: CSSProperties = {
  background: "none",
  border: "none",
  color: C.goldSoft,
  fontSize: 13,
  cursor: "pointer",
  textDecoration: "underline",
  textUnderlineOffset: 3,
  padding: 0,
};
