"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, Loader2, Sparkles } from "lucide-react";
import { C, FONTS, GAMMES, WINE_TYPES } from "@/lib/design-tokens";
import { dataUrlToBlob, resizeImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import type { BottleFormFields, Gamme, WineType } from "@/lib/types";
import { ActionBtn, Field, Select, TextArea, TextInput } from "@/components/ui";

const EMPTY_FORM: BottleFormFields & { quantite: number } = {
  nom: "",
  annee: "",
  type: null,
  igp: "",
  aop: "",
  vignoble: "",
  cepages: "",
  gamme: null,
  etagere: "",
  conservation: "",
  accord_mets_vin: "",
  commentaire: "",
  photo_url: null,
  quantite: 1,
};

interface AnalyzeResult {
  nom?: string | null;
  annee?: string | null;
  type?: string | null;
  igp?: string | null;
  aop?: string | null;
  vignoble?: string | null;
  cepages?: string | null;
  gamme?: string | null;
  conservation?: string | null;
  accord_mets_vin?: string | null;
}

export function AddView() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    try {
      const dataUrl = await resizeImage(file, 1000, 0.8);
      setPhotoDataUrl(dataUrl);
      setShowForm(true);
    } catch {
      setError("Impossible de lire cette photo.");
    }
  };

  const runAnalysis = async () => {
    if (!photoDataUrl) return;
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch("/api/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: photoDataUrl }),
      });
      if (!res.ok) throw new Error("analyze failed");
      const { result } = (await res.json()) as { result: AnalyzeResult };
      setForm((f) => ({
        ...f,
        nom: result.nom || f.nom,
        annee: result.annee || f.annee,
        type: (WINE_TYPES as readonly string[]).includes(result.type ?? "") ? (result.type as WineType) : f.type,
        igp: result.igp || f.igp,
        aop: result.aop || f.aop,
        vignoble: result.vignoble || f.vignoble,
        cepages: result.cepages || f.cepages,
        gamme: (GAMMES as readonly string[]).includes(result.gamme ?? "") ? (result.gamme as Gamme) : f.gamme,
        conservation: result.conservation || f.conservation,
        accord_mets_vin: result.accord_mets_vin || f.accord_mets_vin,
      }));
    } catch {
      setError("La reconnaissance automatique a échoué. Complète les champs manuellement.");
    }
    setAnalyzing(false);
  };

  const reset = () => {
    setPhotoDataUrl(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setError("");
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let photoUrl: string | null = null;
      if (photoDataUrl) {
        const blob = dataUrlToBlob(photoDataUrl);
        const path = `${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage.from("bottle-photos").upload(path, blob, {
          contentType: "image/jpeg",
        });
        if (uploadError) throw uploadError;
        photoUrl = supabase.storage.from("bottle-photos").getPublicUrl(path).data.publicUrl;
      }

      const lotId = crypto.randomUUID();
      const quantite = Math.max(1, Number(form.quantite) || 1);
      const { quantite: _quantite, ...fields } = form;
      void _quantite;
      const rows = Array.from({ length: quantite }, () => ({
        ...fields,
        lot_id: lotId,
        photo_url: photoUrl,
        created_by: user?.id ?? null,
      }));

      const { error: insertError } = await supabase.from("bottles").insert(rows);
      if (insertError) throw insertError;

      router.push("/cave");
      router.refresh();
    } catch {
      setError("Échec de l'enregistrement, réessaie.");
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontFamily: FONTS.display, fontSize: 26, color: C.parchment, marginTop: 0 }}>Ajouter une bouteille</h1>

      {!showForm ? (
        <div style={{ border: `1.5px dashed ${C.hairline}`, borderRadius: 12, padding: "48px 20px", textAlign: "center" }}>
          <Camera size={30} color={C.goldSoft} strokeWidth={1.3} style={{ marginBottom: 10 }} />
          <p style={{ color: C.parchmentMuted, fontSize: 14, marginBottom: 18 }}>
            Photographie l&apos;étiquette pour l&apos;ajouter à la cave et laisser l&apos;IA pré-remplir les informations.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <ActionBtn primary onClick={() => fileRef.current?.click()} icon={<Camera size={14} />} label="Prendre / choisir une photo" />
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setShowForm(true)} style={{ background: "none", border: "none", color: C.goldSoft, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
              Saisir sans photo
            </button>
          </div>
          {error && <p style={{ color: C.danger, fontSize: 13, marginTop: 12 }}>{error}</p>}
        </div>
      ) : (
        <div>
          {photoDataUrl && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, background: C.surface, border: `1px solid ${C.hairline}`, borderRadius: 10, padding: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoDataUrl} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />
              <div style={{ flex: 1 }}>
                {!analyzing ? (
                  <ActionBtn primary onClick={runAnalysis} icon={<Sparkles size={14} />} label="Analyser avec l'IA" />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.goldSoft, fontSize: 13 }}>
                    <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Analyse de l&apos;étiquette…
                  </div>
                )}
              </div>
              <button onClick={() => fileRef.current?.click()} style={{ background: "none", border: "none", color: C.goldSoft, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
                Changer
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          )}
          {error && <p style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <Field label="Nom">
            <TextInput value={form.nom ?? ""} onChange={(e) => set("nom", e.target.value)} placeholder="ex. Château Lafite" />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Field label="Année">
                <TextInput value={form.annee ?? ""} onChange={(e) => set("annee", e.target.value)} placeholder="2019" />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Type">
                <Select value={form.type} onChange={(e) => set("type", e.target.value as WineType)} options={WINE_TYPES} />
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
            <TextInput value={form.cepages ?? ""} onChange={(e) => set("cepages", e.target.value)} placeholder="Merlot, Cabernet Sauvignon…" />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Field label="Gamme">
                <Select value={form.gamme} onChange={(e) => set("gamme", e.target.value as Gamme)} options={GAMMES} />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Étagère">
                <TextInput value={form.etagere ?? ""} onChange={(e) => set("etagere", e.target.value)} placeholder="ex. 3" />
              </Field>
            </div>
          </div>
          <Field label="Infos de conservation">
            <TextInput value={form.conservation ?? ""} onChange={(e) => set("conservation", e.target.value)} placeholder="à boire avant 2028" />
          </Field>
          <Field label="Accord mets et vin">
            <TextInput value={form.accord_mets_vin ?? ""} onChange={(e) => set("accord_mets_vin", e.target.value)} placeholder="ex. raclette, viandes grillées" />
          </Field>
          <Field label="Commentaire">
            <TextArea value={form.commentaire ?? ""} onChange={(e) => set("commentaire", e.target.value)} placeholder="Tes notes personnelles…" />
          </Field>
          <Field label="Quantité (lot identique)">
            <TextInput
              type="number"
              min={1}
              value={form.quantite}
              onChange={(e) => set("quantite", Math.max(1, parseInt(e.target.value, 10) || 1))}
            />
          </Field>

          <div style={{ display: "flex", gap: 8, marginTop: 6, marginBottom: 40 }}>
            <ActionBtn
              primary
              onClick={save}
              disabled={saving}
              icon={saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={14} />}
              label={saving ? "Enregistrement…" : "Enregistrer"}
            />
            <ActionBtn onClick={reset} label="Annuler" />
          </div>
        </div>
      )}
    </div>
  );
}
