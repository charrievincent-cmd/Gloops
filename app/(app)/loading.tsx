import { Loader2 } from "lucide-react";
import { C } from "@/lib/design-tokens";

// Affiché immédiatement au changement d'onglet, le temps que la page arrive.
export default function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "80px 0", color: C.goldSoft }}>
      <Loader2 size={26} style={{ animation: "spin 1s linear infinite" }} aria-label="Chargement" />
    </div>
  );
}
