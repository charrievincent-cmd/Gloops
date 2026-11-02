import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CLAUDE_MODEL, getAnthropicClient } from "@/lib/anthropic";

const SYSTEM_PROMPT =
  "Tu es un sommelier expert en identification de vins à partir de photos d'étiquettes. Tu réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte autour, sans balises markdown.";

const USER_PROMPT = `Analyse cette photo d'étiquette de bouteille de vin et renvoie un objet JSON avec exactement ces clés : nom, annee, type, igp, aop, vignoble, cepages, gamme, conservation, accord_mets_vin.
- "type" : exactement "rouge", "blanc", "rosé", ou null si indéterminable.
- "gamme" : exactement "basique", "bon" ou "excellent" (estimation selon le prestige de l'appellation et de l'étiquette), ou null.
- "annee" : chaîne de caractères (ex "2019") ou null si non visible.
- "cepages" : chaîne listant les cépages séparés par des virgules (déduits de l'appellation si besoin), ou null.
- "conservation" : courte recommandation de garde (ex "à boire avant 2027"), déduite du type et du millésime, ou null.
- "accord_mets_vin" : courte suggestion d'accords mets et vin (ex "viandes rouges grillées, fromages affinés"), déduite du type, des cépages et de l'appellation, ou null.
- "nom", "igp", "aop", "vignoble" : chaînes de caractères ou null si non déterminables.
Réponds uniquement avec l'objet JSON, rien d'autre.`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { imageBase64 } = (await request.json()) as { imageBase64?: string };
  if (!imageBase64) {
    return NextResponse.json({ error: "Image manquante" }, { status: 400 });
  }

  const base64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

  try {
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
            { type: "text", text: USER_PROMPT },
          ],
        },
      ],
    });

    const text = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    const result = JSON.parse(text);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("analyze-photo failed", err);
    return NextResponse.json({ error: "L'analyse de la photo a échoué" }, { status: 502 });
  }
}
