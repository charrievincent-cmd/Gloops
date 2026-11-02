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
  accord_mets_vin: string | null;
  commentaire: string | null;
  photo_url: string | null;
  created_by: string | null;
  created_at: string;
  consumed_at: string | null;
}

export type BottleFormFields = Omit<
  Bottle,
  "id" | "lot_id" | "created_by" | "created_at" | "consumed_at"
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
  accord_mets_vin: string | null;
  commentaire: string | null;
  photo_url: string | null;
  created_at: string;
  consumed_at: string | null;
}

/** Enveloppe une seule ligne (ex. bouteille consommée) au format BottleLot, pour réutiliser BottleCard/DetailModal. */
export function toSingleLot(bottle: Bottle): BottleLot {
  return {
    lot_id: bottle.id,
    quantite: 1,
    bottle_ids: [bottle.id],
    nom: bottle.nom,
    annee: bottle.annee,
    type: bottle.type,
    igp: bottle.igp,
    aop: bottle.aop,
    vignoble: bottle.vignoble,
    cepages: bottle.cepages,
    gamme: bottle.gamme,
    etagere: bottle.etagere,
    conservation: bottle.conservation,
    accord_mets_vin: bottle.accord_mets_vin,
    commentaire: bottle.commentaire,
    photo_url: bottle.photo_url,
    created_at: bottle.created_at,
    consumed_at: bottle.consumed_at,
  };
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
      accord_mets_vin: first.accord_mets_vin,
      commentaire: first.commentaire,
      photo_url: first.photo_url,
      created_at: first.created_at,
      consumed_at: first.consumed_at,
    };
  });
}
