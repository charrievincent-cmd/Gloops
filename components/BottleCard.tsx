"use client";

import { Wine } from "lucide-react";
import { C, FONTS, TYPE_COLOR } from "@/lib/design-tokens";
import type { BottleLot } from "@/lib/types";

export function BottleCard({
  lot,
  onClick,
  subtitle,
  hideQuantityBadge,
}: {
  lot: BottleLot;
  onClick: () => void;
  /** Remplace l'année affichée en pied de vignette (ex. date de consommation dans l'historique). */
  subtitle?: string;
  hideQuantityBadge?: boolean;
}) {
  const stripe = TYPE_COLOR[lot.type ?? ""] || C.hairline;
  return (
    <button
      onClick={onClick}
      className="gloops-card"
      style={{
        textAlign: "left",
        background: C.surface,
        border: `1px solid ${lot.gamme === "excellent" ? C.gold : C.hairline}`,
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        padding: 0,
        position: "relative",
        boxShadow: lot.gamme === "excellent" ? `0 0 0 1px ${C.gold}55, 0 2px 10px ${C.shadow}` : `0 2px 10px ${C.shadow}`,
      }}
    >
      <div style={{ height: 3, background: stripe }} />
      <div
        style={{
          position: "relative",
          aspectRatio: "1/1",
          background: C.bgAlt,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {lot.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={lot.photo_url} alt={lot.nom ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Wine size={28} color={C.parchmentFaint} strokeWidth={1.2} />
        )}
        {!hideQuantityBadge && lot.quantite > 1 && (
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              background: "rgba(21,17,13,0.85)",
              color: C.goldSoft,
              fontFamily: FONTS.mono,
              fontSize: 11,
              padding: "2px 6px",
              borderRadius: 20,
              border: `1px solid ${C.hairline}`,
            }}
          >
            ×{lot.quantite}
          </span>
        )}
      </div>
      <div style={{ padding: "8px 10px 10px" }}>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 14,
            color: C.parchment,
            lineHeight: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {lot.nom || "Vin sans nom"}
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: C.parchmentMuted, marginTop: 3 }}>
          {subtitle ?? lot.annee ?? "—"}
        </div>
      </div>
    </button>
  );
}
