"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, MessageCircle, Plus, Wine } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { C, FONTS } from "@/lib/design-tokens";

const NAV = [
  { href: "/cave", label: "Cave", icon: Wine },
  { href: "/add", label: "Ajouter", icon: Plus },
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
        background: "rgba(21,17,13,0.92)",
        backdropFilter: "blur(6px)",
        borderBottom: `1px solid ${C.hairline}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Wine size={18} color={C.goldSoft} />
        <span style={{ fontFamily: FONTS.display, fontSize: 16, color: C.parchment }}>Ma Cave</span>
      </div>
      <nav style={{ display: "flex", gap: 4, background: C.surface, padding: 4, borderRadius: 10, border: `1px solid ${C.hairline}` }}>
        {NAV.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 500,
                background: active ? C.bordeaux : "transparent",
                color: active ? C.parchment : C.parchmentMuted,
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
        style={{
          background: "none",
          border: "none",
          color: C.parchmentFaint,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
        }}
      >
        <LogOut size={15} />
      </button>
    </header>
  );
}
