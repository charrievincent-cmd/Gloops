"use client";

import { useMemo, useState } from "react";
import { CalendarDays, History as HistoryIcon } from "lucide-react";
import { C, FONTS } from "@/lib/design-tokens";
import { toSingleLot, type Bottle, type BottleLot } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { BottleCard } from "@/components/BottleCard";
import { DetailModal } from "@/components/DetailModal";

function monthLabel(iso: string) {
  const d = new Date(iso);
  const label = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function HistoryView({ initialBottles }: { initialBottles: Bottle[] }) {
  const [bottles, setBottles] = useState(initialBottles);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const supabase = createClient();

  const refetch = async () => {
    const { data } = await supabase
      .from("bottles")
      .select("*")
      .not("consumed_at", "is", null)
      .order("consumed_at", { ascending: false });
    setBottles((data as Bottle[]) ?? []);
  };

  const groups = new Map<string, Bottle[]>();
  bottles.forEach((b) => {
    const key = b.consumed_at ? monthLabel(b.consumed_at) : "Date inconnue";
    const list = groups.get(key) ?? [];
    list.push(b);
    groups.set(key, list);
  });
  const groupKeys = [...groups.keys()];

  const selectedLot = useMemo(() => {
    const b = selectedId ? bottles.find((x) => x.id === selectedId) : null;
    return b ? toSingleLot(b) : null;
  }, [selectedId, bottles]);

  const totalConsumed = bottles.length;

  const restore = async (lot: BottleLot) => {
    await supabase.from("bottles").update({ consumed_at: null }).eq("id", lot.bottle_ids[0]);
    setSelectedId(null);
    await refetch();
  };

  const deleteEntry = async (lot: BottleLot) => {
    await supabase.from("bottles").delete().eq("id", lot.bottle_ids[0]);
    setSelectedId(null);
    await refetch();
  };

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: FONTS.display, fontSize: 26, color: C.parchment, margin: 0 }}>Historique</h1>
        <p style={{ color: C.parchmentMuted, fontSize: 13, margin: "4px 0 0" }}>
          {totalConsumed} bouteille{totalConsumed > 1 ? "s" : ""} consommée{totalConsumed > 1 ? "s" : ""}
        </p>
      </div>

      {bottles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", border: `1px dashed ${C.hairline}`, borderRadius: 12 }}>
          <HistoryIcon size={32} color={C.parchmentFaint} strokeWidth={1.2} style={{ marginBottom: 12 }} />
          <p style={{ color: C.parchmentMuted, fontSize: 14, maxWidth: 320, margin: "0 auto" }}>
            Aucune bouteille consommée pour l&apos;instant. Elles apparaîtront ici après avoir été marquées comme
            bues depuis la cave.
          </p>
        </div>
      ) : (
        groupKeys.map((key) => (
          <div key={key} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <CalendarDays size={14} color={C.goldSoft} />
              <h3 style={{ fontFamily: FONTS.mono, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: C.goldSoft, margin: 0 }}>
                {key}
              </h3>
              <div style={{ flex: 1, height: 1, background: C.hairline }} />
              <span style={{ fontSize: 11, color: C.parchmentFaint, fontFamily: FONTS.mono }}>
                {groups.get(key)!.length} bout.
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
              {groups.get(key)!.map((b) => (
                <BottleCard
                  key={b.id}
                  lot={toSingleLot(b)}
                  subtitle={b.consumed_at ? dayLabel(b.consumed_at) : undefined}
                  hideQuantityBadge
                  onClick={() => setSelectedId(b.id)}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {selectedLot && (
        <DetailModal
          key={selectedLot.lot_id}
          lot={selectedLot}
          mode="history"
          onClose={() => setSelectedId(null)}
          onDeleteLot={deleteEntry}
          onRestore={restore}
        />
      )}
    </div>
  );
}
