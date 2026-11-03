"use client";

import { useRouter } from "next/navigation";
import { LogOut, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BRAND_GRADIENT, C, FONTS } from "@/lib/design-tokens";

export function NotAllowed({ email }: { email: string | null }) {
  const router = useRouter();
  const logout = async () => {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 380, textAlign: "center", background: C.surface, border: `1px solid ${C.hairline}`, borderRadius: 12, padding: 28 }}>
        <ShieldAlert size={34} color={C.copper} />
        <h1 style={{ fontFamily: FONTS.display, fontSize: 22, color: C.parchment, margin: "12px 0 8px" }}>Accès non autorisé</h1>
        <p style={{ color: C.parchmentMuted, fontSize: 14, lineHeight: 1.5, margin: "0 0 20px" }}>
          {email ? <>Le compte <strong>{email}</strong> n&apos;a pas accès à cette cave.</> : "Ce compte n'a pas accès à cette cave."}{" "}
          Demande à la personne qui gère la cave d&apos;ajouter ton adresse.
        </p>
        <button
          onClick={logout}
          className="gloops-btn"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", border: "none", borderRadius: 9, background: BRAND_GRADIENT, color: "#FFF6EA", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
        >
          <LogOut size={15} /> Changer de compte
        </button>
      </div>
    </div>
  );
}
