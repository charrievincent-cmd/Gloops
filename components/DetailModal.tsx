"use client";

import { useRef, useState } from "react";
import { Camera, Check, Loader2, Minus, Pencil, RotateCcw, Trash2, Wine, X } from "lucide-react";
import { C, FONTS, GAMMES, TYPE_COLOR, WINE_TYPES } from "@/lib/design-tokens";
import type { BottleLot, BottleFormFields } from "@/lib/types";
import { ActionBtn, Field, GammeBadge, Select, TextArea, TextInput } from "@/components/ui";
import { useCloseOnBack } from "@/lib/useCloseOnBack";
import { dataUrlToBlob, resizeImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";

const DETAIL_FIELDS: [keyof BottleFormFields, string][] = [
  ["igp", "IGP"],
  ["aop", "AOP / AOC"],
  ["vignoble", "Vignoble"],
  ["cepages", "Cépages"],
  ["etagere", "Étagère"],
  ["conservation", "Infos de conservation"],
  ["accord_mets_vin", "Accord mets et vin"],
  ["commentaire", "Commentaire"],
];

/** Champs réellement modifiables : on n'envoie que ceux-là à la base. */
const EDITABLE_FIELDS = [
  "nom",
  "annee",
  "type",
  "igp",
  "aop",
  "vignoble",
  "cepages",
  "gamme",
  "etagere",
  "conservation",
  "accord_mets_vin",
  "commentaire",
] as const satisfies readonly (keyof BottleFormFields)[];

function pickEditable(form: Partial<BottleFormFields>): Partial<BottleFormFields> {
  const out: Partial<BottleFormFields> = {};
  for (const k of EDITABLE_FIELDS) {
    if (k in form) (out as Record<string, unknown>)[k] = form[k];
  }
  return out;
}

function formatConsumedDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function DetailModal({
  lot,
  mode = "cave",
  onClose,
  onSave,
  onDeleteLot,
  onConsumeOne,
  onRestore,
  onPhotoChange,
}: {
  lot: BottleLot;
  /** "cave" (par défaut) : modifier/consommer/supprimer. "history" : remettre en cave ou supprimer définitivement. */
  mode?: "cave" | "history";
  onClose: () => void;
  onSave?: (lotId: string, fields: Partial<BottleFormFields>) => Promise<void>;
  onDeleteLot: (lot: BottleLot) => Promise<void>;
  onConsumeOne?: (lot: BottleLot) => Promise<void>;
  onRestore?: (lot: BottleLot) => Promise<void>;
  /** Enregistre la nouvelle photo (URL publique) pour tout le lot. */
  onPhotoChange?: (lot: BottleLot, photoUrl: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<BottleFormFields>>(lot);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const close = useCloseOnBack(onClose);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(lot.photo_url);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const handlePhoto = async (file: File | undefined) => {
    if (!file || !onPhotoChange) return;
    setUploadingPhoto(true);
    setPhotoError("");
    try {
      const dataUrl = await resizeImage(file, 1000, 0.8);
      const supabase = createClient();
      const path = `${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage
        .from("bottle-photos")
        .upload(path, dataUrlToBlob(dataUrl), { contentType: "image/jpeg" });
      if (error) throw error;
      const url = supabase.storage.from("bottle-photos").getPublicUrl(path).data.publicUrl;
      await onPhotoChange(lot, url);
      setPhotoUrl(url);
    } catch {
      setPhotoError("Impossible d'enregistrer la photo, réessaie.");
    }
    setUploadingPhoto(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const set = <K extends keyof BottleFormFields>(k: K, v: BottleFormFields[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!onSave) return;
    setSaving(true);
    await onSave(lot.lot_id, pickEditable(form));
    setSaving(false);
    setEditing(false);
  };

  const restore = async () => {
    if (!onRestore) return;
    setRestoring(true);
    await onRestore(lot);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,8,6,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 460,
          maxHeight: "90vh",
          overflowY: "auto",
          background: C.surface,
          border: `1px solid ${C.hairline}`,
          borderRadius: 14,
        }}
      >
        <div style={{ position: "relative" }}>
          <div style={{ width: "100%", aspectRatio: "4/3", background: C.bgAlt, overflow: "hidden" }}>
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={lot.nom ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wine size={40} color={C.parchmentFaint} strokeWidth={1.2} />
              </div>
            )}
          </div>
          <button
            onClick={close}
            aria-label="Fermer"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(21,17,13,0.75)",
              border: "none",
              borderRadius: "50%",
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} color={C.parchment} />
          </button>
          {onPhotoChange && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={(e) => handlePhoto(e.target.files?.[0])}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                style={{
                  position: "absolute",
                  left: 10,
                  bottom: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 11px",
                  background: "rgba(21,17,13,0.75)",
                  color: C.parchment,
                  border: "none",
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: uploadingPhoto ? "default" : "pointer",
                }}
              >
                {uploadingPhoto ? (
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Camera size={14} />
                )}
                {uploadingPhoto ? "Envoi…" : photoUrl ? "Changer la photo" : "Ajouter une photo"}
              </button>
            </>
          )}
          <div
            style={{
              position: "absolute",
              left: 3,
              right: 3,
              bottom: 0,
              height: 3,
              background: TYPE_COLOR[lot.type ?? ""] || C.hairline,
            }}
          />
        </div>

        <div style={{ padding: 20 }}>
          {photoError && <p style={{ color: C.danger, fontSize: 13, margin: "0 0 12px" }}>{photoError}</p>}
          {!editing ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <h2 style={{ fontFamily: FONTS.display, fontSize: 22, color: C.parchment, margin: 0 }}>
                  {lot.nom || "Vin sans nom"}
                </h2>
                <GammeBadge gamme={lot.gamme} />
              </div>
              <div style={{ fontFamily: FONTS.mono, color: C.parchmentMuted, fontSize: 13, marginTop: 4 }}>
                {lot.annee || "Année inconnue"} · {lot.type || "type inconnu"}{" "}
                {lot.quantite > 1 ? `· ${lot.quantite} bouteilles` : ""}
              </div>
              {mode === "history" && lot.consumed_at && (
                <div style={{ fontFamily: FONTS.mono, color: C.copper, fontSize: 13, marginTop: 4 }}>
                  Consommée le {formatConsumedDate(lot.consumed_at)}
                </div>
              )}

              <div style={{ marginTop: 16, borderTop: `1px solid ${C.hairline}` }}>
                {DETAIL_FIELDS.map(([k, label]) => (
                  <div key={k} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: `1px solid ${C.hairline}` }}>
                    <div
                      style={{
                        width: 130,
                        flexShrink: 0,
                        fontSize: 11,
                        color: C.parchmentFaint,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        paddingTop: 2,
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontSize: 14, color: C.parchment, fontFamily: k === "conservation" ? FONTS.mono : FONTS.body }}>
                      {form[k] || <span style={{ color: C.parchmentFaint }}>—</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
                {mode === "cave" ? (
                  <>
                    <ActionBtn onClick={() => setEditing(true)} icon={<Pencil size={14} />} label="Modifier" />
                    <ActionBtn
                      onClick={() => onConsumeOne?.(lot)}
                      icon={<Minus size={14} />}
                      label={lot.quantite > 1 ? "J'en ai bu une" : "Marquer comme bue"}
                    />
                    <ActionBtn
                      danger
                      onClick={() => onDeleteLot(lot)}
                      icon={<Trash2 size={14} />}
                      label={lot.quantite > 1 ? "Supprimer le lot" : "Supprimer"}
                    />
                  </>
                ) : (
                  <>
                    <ActionBtn
                      onClick={restore}
                      disabled={restoring}
                      icon={<RotateCcw size={14} />}
                      label={restoring ? "Remise en cave…" : "Remettre en cave"}
                    />
                    <ActionBtn
                      danger
                      onClick={() => onDeleteLot(lot)}
                      icon={<Trash2 size={14} />}
                      label="Supprimer définitivement"
                    />
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: FONTS.display, fontSize: 20, color: C.parchment, marginTop: 0 }}>
                Modifier la bouteille
              </h2>
              <Field label="Nom">
                <TextInput value={form.nom ?? ""} onChange={(e) => set("nom", e.target.value)} />
              </Field>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <Field label="Année">
                    <TextInput value={form.annee ?? ""} onChange={(e) => set("annee", e.target.value)} />
                  </Field>
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Type">
                    <Select value={form.type} onChange={(e) => set("type", e.target.value as BottleFormFields["type"])} options={WINE_TYPES} />
                  </Field>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <Field label="IGP">
                    <TextInput value={form.igp ?? ""} onChange={(e) => set("igp", e.target.value)} />
                  </Field>
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="AOP / AOC">
                    <TextInput value={form.aop ?? ""} onChange={(e) => set("aop", e.target.value)} />
                  </Field>
                </div>
              </div>
              <Field label="Vignoble">
                <TextInput value={form.vignoble ?? ""} onChange={(e) => set("vignoble", e.target.value)} />
              </Field>
              <Field label="Cépages">
                <TextInput value={form.cepages ?? ""} onChange={(e) => set("cepages", e.target.value)} />
              </Field>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <Field label="Gamme">
                    <Select value={form.gamme} onChange={(e) => set("gamme", e.target.value as BottleFormFields["gamme"])} options={GAMMES} />
                  </Field>
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Étagère">
                    <TextInput value={form.etagere ?? ""} onChange={(e) => set("etagere", e.target.value)} />
                  </Field>
                </div>
              </div>
              <Field label="Infos de conservation">
                <TextInput value={form.conservation ?? ""} onChange={(e) => set("conservation", e.target.value)} />
              </Field>
              <Field label="Accord mets et vin">
                <TextInput value={form.accord_mets_vin ?? ""} onChange={(e) => set("accord_mets_vin", e.target.value)} />
              </Field>
              <Field label="Commentaire">
                <TextArea value={form.commentaire ?? ""} onChange={(e) => set("commentaire", e.target.value)} />
              </Field>

              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <ActionBtn
                  primary
                  onClick={save}
                  disabled={saving}
                  icon={<Check size={14} />}
                  label={saving ? "Enregistrement…" : "Enregistrer"}
                />
                <ActionBtn onClick={() => { setForm(lot); setEditing(false); }} label="Annuler" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
