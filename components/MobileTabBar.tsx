"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, MessageCircle, Plus, Wine } from "lucide-react";
import { C } from "@/lib/design-tokens";

const TABS = [
  { href: "/cave", label: "Cave", icon: Wine },
  { href: "/history", label: "Historique", icon: History },
  { href: "/chat", label: "Assistant", icon: MessageCircle },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <>
      <nav className="gloops-mobile-nav">
        {TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "6px 18px",
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 500,
                color: active ? C.copper : C.parchmentMuted,
              }}
            >
              <t.icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              {t.label}
            </Link>
          );
        })}
      </nav>
      <Link href="/add" className="gloops-fab" aria-label="Ajouter une bouteille">
        <Plus size={24} strokeWidth={2.4} />
      </Link>
    </>
  );
}
