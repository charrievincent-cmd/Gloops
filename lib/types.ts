export type WineType = "rouge" | "blanc" | "rosé";
export type Gamme = "basique" | "bon" | "excellent";

export interface Bottle {
  id: string;
  lot_id: string;
  nom: string | null;
  annee: string | null;
  type: WineType | null;
  igp: string | null;
  aop: string | null;
  vignoble: string | null;
  cepages: string | null;
  gamme: Gamme | null;
  etagere: string | null;
  conservation: string | null;
  commentaire: string | null;
  photo_url: string | null;
  created_by: string | null;
  created_at: string;
}

export type BottleFormFields = Omit<
  Bottle,
  "id" | "lot_id" | "created_by" | "created_at"
>;

/** Vue groupée : un lot = N lignes physiques identiques regroupées pour l'affichage. */
export interface BottleLot {
  lot_id: string;
  quantite: number;
  bottle_ids: string[];
  nom: string | null;
  annee: string | null;
  type: WineType | null;
  igp: string | null;
  aop: string | null;
  vignoble: string | null;
  cepages: string | null;
  gamme: Gamme | null;
  etagere: string | null;
  conservation: string | null;
  commentaire: string | null;
  photo_url: string | null;
  created_at: string;
}

export function groupIntoLots(bottles: Bottle[]): BottleLot[] {
  const byLot = new Map<string, Bottle[]>();
  for (const b of bottles) {
    const list = byLot.get(b.lot_id) ?? [];
    list.push(b);
    byLot.set(b.lot_id, list);
  }
  return [...byLot.values()].map((rows) => {
    const first = rows[0];
    return {
      lot_id: first.lot_id,
      quantite: rows.length,
      bottle_ids: rows.map((r) => r.id),
      nom: first.nom,
      annee: first.annee,
      type: first.type,
      igp: first.igp,
      aop: first.aop,
      vignoble: first.vignoble,
      cepages: first.cepages,
      gamme: first.gamme,
      etagere: first.etagere,
      conservation: first.conservation,
      commentaire: first.commentaire,
      photo_url: first.photo_url,
      created_at: first.created_at,
    };
  });
}
