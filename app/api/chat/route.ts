import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CLAUDE_MODEL, getAnthropicClient } from "@/lib/anthropic";
import { groupIntoLots, type Bottle } from "@/lib/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { message, history } = (await request.json()) as { message?: string; history?: ChatMessage[] };
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message manquant" }, { status: 400 });
  }

  const { data: bottles } = await supabase.from("bottles").select("*").is("consumed_at", null);
  const lots = groupIntoLots((bottles as Bottle[]) ?? []);
  const lotsById = new Map(lots.map((l) => [l.lot_id, l]));
  const inventory = lots.map((l) => ({
    lot_id: l.lot_id,
    nom: l.nom,
    annee: l.annee,
    type: l.type,
    gamme: l.gamme,
    etagere: l.etagere,
    conservation: l.conservation,
    accord_mets_vin: l.accord_mets_vin,
    cepages: l.cepages,
    vignoble: l.vignoble,
    aop: l.aop,
    igp: l.igp,
    quantite: l.quantite,
    commentaire: l.commentaire,
  }));

  const system = `Tu es le sommelier assistant intégré à une application de gestion de cave à vin personnelle. Tu réponds en français, de façon chaleureuse, concise et directe (quelques phrases). Base-toi UNIQUEMENT sur l'inventaire JSON ci-dessous, qui reflète le contenu réel de la cave de l'utilisateur. Si rien ne correspond à la demande, dis-le et propose l'option la plus proche dans l'inventaire. Ne cite jamais de vin qui n'est pas dans la liste.

Chaque vin de l'inventaire a un "lot_id". Quand ta réponse recommande ou mentionne explicitement un ou plusieurs vins précis de l'inventaire, appelle l'outil cite_wines avec leurs lot_id, en plus de ta réponse en texte.

Inventaire actuel :
${JSON.stringify(inventory)}`;

  try {
    const anthropic = getAnthropicClient();
    const result = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system,
      tools: [
        {
          name: "cite_wines",
          description:
            "Indique les lot_id des vins de l'inventaire explicitement recommandés ou mentionnés dans la réponse en cours, pour que l'utilisateur puisse ouvrir leur fiche.",
          input_schema: {
            type: "object",
            properties: {
              lot_ids: { type: "array", items: { type: "string" } },
            },
            required: ["lot_ids"],
          },
        },
      ],
      messages: [
        ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: message },
      ],
    });

    const text = result.content.map((block) => (block.type === "text" ? block.text : "")).join("");

    const citedIds = new Set<string>();
    for (const block of result.content) {
      if (block.type === "tool_use" && block.name === "cite_wines") {
        const input = block.input as { lot_ids?: unknown };
        if (Array.isArray(input.lot_ids)) {
          input.lot_ids.forEach((id) => typeof id === "string" && citedIds.add(id));
        }
      }
    }
    const referencedBottles = [...citedIds]
      .map((id) => lotsById.get(id))
      .filter((l): l is NonNullable<typeof l> => Boolean(l))
      .map((l) => ({ lot_id: l.lot_id, nom: l.nom, annee: l.annee }));

    return NextResponse.json({ answer: text, referencedBottles });
  } catch (err) {
    console.error("chat failed", err);
    return NextResponse.json({ error: "Le sommelier n'a pas pu répondre" }, { status: 502 });
  }
}
