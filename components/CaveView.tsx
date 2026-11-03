"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Grid3x3, Search, Wine } from "lucide-react";
import { C, FONTS, GAMMES, GAMME_LABEL, WINE_TYPES, inputStyle } from "@/lib/design-tokens";
import { groupIntoLots, type Bottle, type BottleFormFields, type BottleLot } from "@/lib/types";
import { notifyBottlesChanged } from "@/components/CaveGauge";
import { createClient } from "@/lib/supabase/client";
import { BottleCard } from "@/components/BottleCard";
import { DetailModal } from "@/components/DetailModal";

export function CaveView({ initialBottles }: { initialBottles: Bottle[] }) {
  const [bottles, setBottles] = useState(initialBottles);
  const [filters, setFilters] = useState({ type: "", gamme: "", search: "" });
  const searchParams = useSearchParams();
  const [selectedLotId, setSelectedLotId] = useState<string | null>(() => searchParams.get("open"));

  const supabase = createClient();

  // Lien « ?open=<lot> » (depuis l'assistant) : on nettoie l'URL avant que la fiche
  // n'ajoute son entrée d'historique (useLayoutEffect passe avant useEffect), pour
  // que la touche retour ferme la fiche et reste sur /cave.
  useLayoutEffect(() => {
    if (searchParams.get("open")) {
      window.history.replaceState(window.history.state, "", "/cave");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = async () => {
    const { data } = await supabase
      .from("bottles")
      .select("*")
      .is("consumed_at", null)
      .order("created_at", { ascending: false });
    setBottles((data as Bottle[]) ?? []);
    notifyBottlesChanged();
  };

  // La page peut venir du cache du téléphone (navigation instantanée) :
  // on recharge les données en arrière-plan pour qu'elles restent à jour.
  useEffect(() => {
    let active = true;
    supabase
      .from("bottles")
      .select("*")
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active && data) setBottles(data as Bottle[]);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lots = useMemo(() => groupIntoLots(bottles), [bottles]);

  const filtered = lots.filter((l) => {
    if (filters.type && l.type !== filters.type) return false;
    if (filters.gamme && l.gamme !== filters.gamme) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = [l.nom, l.vignoble, l.cepages, l.aop, l.igp, l.annee].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const groups = new Map<string, BottleLot[]>();
  filtered.forEach((l) => {
    const key = l.etagere || "Non classé";
    const list = groups.get(key) ?? [];
    list.push(l);
    groups.set(key, list);
  });
  const groupKeys = [...groups.keys()].sort((a, b) =>
    a === "Non classé" ? 1 : b === "Non classé" ? -1 : a.localeCompare(b, "fr", { numeric: true }),
  );

  const selectedLot = selectedLotId ? lots.find((l) => l.lot_id === selectedLotId) ?? null : null;

  const saveLot = async (lotId: string, fields: Partial<BottleFormFields>) => {
    await supabase.from("bottles").update(fields).eq("lot_id", lotId);
    await refetch();
  };

  const changePhoto = async (lot: BottleLot, photoUrl: string) => {
    const { error } = await supabase.from("bottles").update({ photo_url: photoUrl }).eq("lot_id", lot.lot_id);
    if (error) throw error;
    await refetch();
  };

  const deleteLot = async (lot: BottleLot) => {
    await supabase.from("bottles").delete().eq("lot_id", lot.lot_id);
    setSelectedLotId(null);
    await refetch();
  };

  const consumeOne = async (lot: BottleLot) => {
    const idToConsume = lot.bottle_ids[0];
    await supabase.from("bottles").update({ consumed_at: new Date().toISOString() }).eq("id", idToConsume);
    await refetch();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
        <div>
          <h1 style={{ fontFamily: FONTS.display, fontSize: 26, color: C.parchment, margin: 0 }}>Ma cave</h1>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}>
          <Search size={14} color={C.parchmentFaint} style={{ position: "absolute", left: 10, top: 11 }} />
          <input
            placeholder="Rechercher un nom, un cépage, un vignoble…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            style={{ ...inputStyle(true), paddingLeft: 32 }}
          />
        </div>
        <select
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
          style={{ ...inputStyle(false), width: 130 }}
        >
          <option value="">Tous types</option>
          {WINE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={filters.gamme}
          onChange={(e) => setFilters((f) => ({ ...f, gamme: e.target.value }))}
          style={{ ...inputStyle(false), width: 130 }}
        >
          <option value="">Toutes gammes</option>
          {GAMMES.map((g) => (
            <option key={g} value={g}>
              {GAMME_LABEL[g]}
            </option>
          ))}
        </select>
      </div>

      {bottles.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <p style={{ color: C.parchmentMuted, textAlign: "center", padding: "40px 0" }}>
          Aucune bouteille ne correspond à ces filtres.
        </p>
      ) : (
        groupKeys.map((key) => (
          <div key={key} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Grid3x3 size={14} color={C.goldSoft} />
              <h3 style={{ fontFamily: FONTS.mono, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: C.goldSoft, margin: 0 }}>
                {key === "Non classé" ? "Non classé" : `Étagère ${key}`}
              </h3>
              <div style={{ flex: 1, height: 1, background: C.hairline }} />
              <span style={{ fontSize: 11, color: C.parchmentFaint, fontFamily: FONTS.mono }}>
                {groups.get(key)!.reduce((s, l) => s + l.quantite, 0)} bout.
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
              {groups.get(key)!.map((l) => (
                <BottleCard key={l.lot_id} lot={l} onClick={() => setSelectedLotId(l.lot_id)} />
              ))}
            </div>
          </div>
        ))
      )}

      {selectedLot && (
        <DetailModal
          key={selectedLot.lot_id}
          lot={selectedLot}
          onClose={() => setSelectedLotId(null)}
          onSave={saveLot}
          onDeleteLot={deleteLot}
          onPhotoChange={changePhoto}
          onConsumeOne={consumeOne}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", border: `1px dashed ${C.hairline}`, borderRadius: 12 }}>
      <Wine size={32} color={C.parchmentFaint} strokeWidth={1.2} style={{ marginBottom: 12 }} />
      <p style={{ color: C.parchmentMuted, fontSize: 14, maxWidth: 320, margin: "0 auto" }}>
        Votre cave est vide pour l&apos;instant. Ajoutez votre première bouteille avec le bouton « Ajouter ».
      </p>
    </div>
  );
}
