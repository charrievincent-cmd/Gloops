import type { CSSProperties } from "react";

export const C = {
  bg: "#15110D",
  bgAlt: "#1C1712",
  surface: "#241D16",
  surfaceRaised: "#2C2318",
  hairline: "#3A2E20",
  parchment: "#EDE3CE",
  parchmentMuted: "#A99A80",
  parchmentFaint: "#6E6350",
  bordeaux: "#7A2036",
  bordeauxBright: "#9C3049",
  gold: "#C9A227",
  goldSoft: "#E4CC7A",
  blanc: "#C9B458",
  rose: "#D98A9B",
  danger: "#B23A3A",
} as const;

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
