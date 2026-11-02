import { C } from "@/lib/design-tokens";
import { NavHeader } from "@/components/NavHeader";
import { MobileTabBar } from "@/components/MobileTabBar";

// Pages sous ce groupe dépendent de la session utilisateur (cave, ajout, chat) :
// jamais de rendu statique / cache partagé entre utilisateurs.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <NavHeader />
      {/* Pas de padding-bottom ici : il est géré par .gloops-main (globals.css) pour
          laisser la place à la barre d'onglets mobile. */}
      <main className="gloops-main" style={{ maxWidth: 1000, margin: "0 auto", paddingTop: 24, paddingLeft: 20, paddingRight: 20 }}>
        {children}
      </main>
      <MobileTabBar />
    </div>
  );
}
