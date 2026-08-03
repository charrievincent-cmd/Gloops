import { C } from "@/lib/design-tokens";
import { NavHeader } from "@/components/NavHeader";

// Pages sous ce groupe dépendent de la session utilisateur (cave, ajout, chat) :
// jamais de rendu statique / cache partagé entre utilisateurs.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <NavHeader />
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px 60px" }}>{children}</main>
    </div>
  );
}
