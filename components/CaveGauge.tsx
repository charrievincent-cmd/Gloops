"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BRAND_GRADIENT, C, FONTS } from "@/lib/design-tokens";

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
  const [capacity, setCapacity] = useState<number | null>(null);
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  // Recharge au changement d'onglet et quand une vue signale un changement.
  useEffect(() => {
    const onChange = () => setVersion((v) => v + 1);
    window.addEventListener(BOTTLES_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(BOTTLES_CHANGED_EVENT, onChange);
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    Promise.all([
      supabase.from("bottles").select("id", { count: "exact", head: true }).is("consumed_at", null),
      supabase.from("cave_settings").select("capacity").eq("id", 1).maybeSingle(),
    ]).then(([bottles, settings]) => {
      if (!active) return;
      if (bottles.count !== null) setCount(bottles.count);
      setCapacity((settings.data?.capacity as number | null | undefined) ?? null);
    });
    return () => {
      active = false;
    };
  }, [pathname, version]);

  const saveCapacity = async () => {
    const value = parseInt(draft, 10);
    if (!Number.isFinite(value) || value <= 0) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("cave_settings")
      .upsert({ id: 1, capacity: value, updated_at: new Date().toISOString() });
    setSaving(false);
    if (!error) {
      setCapacity(value);
      setEditing(false);
    }
  };

  const n = count ?? 0;
  const ratio = capacity ? Math.min(n / capacity, 1) : 0;
  const fillX = FILL_START + ratio * (FILL_END - FILL_START);
  const label =
    count === null ? "…" : capacity ? `${n} / ${capacity} bouteilles` : `${n} bouteille${n > 1 ? "s" : ""}`;
  const title = capacity
    ? `Cave remplie à ${Math.round((n / capacity) * 100)} % — toucher pour changer la contenance`
    : "Toucher pour définir la contenance de la cave";

  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0, maxWidth: 360, display: "flex" }}>
      <button
        onClick={() => {
          setDraft(capacity ? String(capacity) : "");
          setEditing((e) => !e);
        }}
        title={title}
        aria-label={title}
        className="gloops-btn"
        style={{ background: "none", border: "none", padding: 0, width: "100%", cursor: "pointer", display: "block" }}
      >
        <svg viewBox="0 0 300 40" style={{ width: "100%", height: "auto", display: "block", maxHeight: 40 }} role="img" aria-hidden>
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
          <text
            x="112"
            y="20"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={FONTS.body}
            fontSize="13.5"
            fontWeight="600"
            fill="var(--ink)"
          >
            {label}
          </text>
          <text
            x="112"
            y="20"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={FONTS.body}
            fontSize="13.5"
            fontWeight="600"
            fill="#FFF6EA"
            clipPath={`url(#wine-${uid})`}
          >
            {label}
          </text>
        </svg>
      </button>

      {editing && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: 0,
            right: 0,
            minWidth: 230,
            zIndex: 30,
            background: C.surfaceRaised,
            border: `1px solid ${C.hairline}`,
            borderRadius: 12,
            boxShadow: `0 12px 28px ${C.shadow}`,
            padding: 14,
          }}
        >
          <label style={{ display: "block", fontSize: 13, color: C.parchmentMuted, marginBottom: 8 }}>
            Contenance de la cave (nombre de bouteilles)
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveCapacity();
                if (e.key === "Escape") setEditing(false);
              }}
              style={{
                flex: 1,
                minWidth: 0,
                padding: "9px 11px",
                background: C.bgAlt,
                border: `1px solid ${C.hairline}`,
                borderRadius: 8,
                color: C.parchment,
                fontSize: 15,
              }}
            />
            <button
              onClick={saveCapacity}
              disabled={saving}
              className="gloops-btn"
              style={{
                padding: "9px 14px",
                background: BRAND_GRADIENT,
                color: "#FFF6EA",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {saving ? "…" : "OK"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
