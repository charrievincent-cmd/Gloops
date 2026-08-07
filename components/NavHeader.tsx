"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { History, LogOut, MessageCircle, Plus, Wine } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BRAND_GRADIENT, C, FONTS } from "@/lib/design-tokens";

const NAV = [
  { href: "/cave", label: "Cave", icon: Wine },
  { href: "/add", label: "Ajouter", icon: Plus },
  { href: "/history", label: "Historique", icon: History },
  { href: "/chat", label: "Assistant", icon: MessageCircle },
];

export function NavHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: C.headerBg,
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${C.hairline}`,
        boxShadow: `0 2px 16px ${C.shadow}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", background: C.bgAlt, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-mark.png" alt="" style={{ width: "82%", height: "82%", objectFit: "contain" }} />
        </div>
        <span style={{ fontFamily: FONTS.display, fontSize: 16, color: C.parchment, whiteSpace: "nowrap" }}>
          Gloops <span style={{ color: C.copper }}>2.0</span>
        </span>
      </div>
      <nav className="gloops-desktop-nav" style={{ gap: 4, background: C.surface, padding: 4, borderRadius: 10, border: `1px solid ${C.hairline}` }}>
        {NAV.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className="gloops-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: "nowrap",
                background: active ? BRAND_GRADIENT : "transparent",
                color: active ? "#FFF6EA" : C.parchmentMuted,
              }}
            >
              <n.icon size={14} />
              <span>{n.label}</span>
            </Link>
          );
        })}
      </nav>
      <button
        onClick={logout}
        title="Se déconnecter"
        className="gloops-btn"
        style={{
          background: "none",
          border: "none",
          color: C.parchmentFaint,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          flexShrink: 0,
          borderRadius: 6,
          padding: 4,
        }}
      >
        <LogOut size={15} />
      </button>
    </header>
  );
}
