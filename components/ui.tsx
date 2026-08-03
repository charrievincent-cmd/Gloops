"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { C, FONTS, GAMME_LABEL, inputStyle } from "@/lib/design-tokens";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          color: C.parchmentMuted,
          marginBottom: 5,
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle(false), ...(props.style ?? {}) }} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{ ...inputStyle(false), resize: "vertical", minHeight: 60, ...(props.style ?? {}) }}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value?: string | null;
  onChange: SelectHTMLAttributes<HTMLSelectElement>["onChange"];
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <select value={value ?? ""} onChange={onChange} style={{ ...inputStyle(false), appearance: "none" }}>
      <option value="">{placeholder ?? "—"}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function GammeBadge({ gamme }: { gamme?: string | null }) {
  if (!gamme) return null;
  const isTop = gamme === "excellent";
  return (
    <span
      style={{
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        fontFamily: FONTS.mono,
        padding: "2px 7px",
        borderRadius: 20,
        color: isTop ? "#1B1712" : C.parchment,
        background: isTop ? C.gold : "rgba(255,255,255,0.08)",
        border: isTop ? "none" : `1px solid ${C.hairline}`,
      }}
    >
      {GAMME_LABEL[gamme] ?? gamme}
    </span>
  );
}

export function ActionBtn({
  onClick,
  icon,
  label,
  primary,
  danger,
  disabled,
  type = "button",
}: {
  onClick?: () => void;
  icon?: ReactNode;
  label: string;
  primary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const bg = primary
    ? `linear-gradient(160deg, ${C.bordeauxBright}, ${C.bordeaux})`
    : danger
      ? "transparent"
      : "rgba(255,255,255,0.06)";
  const color = danger ? C.danger : C.parchment;
  const border = danger ? `1px solid ${C.danger}55` : primary ? "none" : `1px solid ${C.hairline}`;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 13px",
        borderRadius: 8,
        border,
        background: bg,
        color,
        fontSize: 13,
        fontWeight: 500,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {icon}
      {label}
    </button>
  );
}
