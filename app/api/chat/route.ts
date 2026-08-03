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

  const { data: bottles } = await supabase.from("bottles").select("*");
  const lots = groupIntoLots((bottles as Bottle[]) ?? []);
  const inventory = lots.map((l) => ({
    nom: l.nom,
    annee: l.annee,
    type: l.type,
    gamme: l.gamme,
    etagere: l.etagere,
    conservation: l.conservation,
    cepages: l.cepages,
    vignoble: l.vignoble,
    aop: l.aop,
    igp: l.igp,
    quantite: l.quantite,
    commentaire: l.commentaire,
  }));

  const system = `Tu es le sommelier assistant intégré à une application de gestion de cave à vin personnelle. Tu réponds en français, de façon chaleureuse, concise et directe (quelques phrases). Base-toi UNIQUEMENT sur l'inventaire JSON ci-dessous, qui reflète le contenu réel de la cave de l'utilisateur. Si rien ne correspond à la demande, dis-le et propose l'option la plus proche dans l'inventaire. Ne cite jamais de vin qui n'est pas dans la liste.

Inventaire actuel :
${JSON.stringify(inventory)}`;

  try {
    const anthropic = getAnthropicClient();
    const result = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system,
      messages: [
        ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: message },
      ],
    });

    const text = result.content.map((block) => (block.type === "text" ? block.text : "")).join("");
    return NextResponse.json({ answer: text });
  } catch (err) {
    console.error("chat failed", err);
    return NextResponse.json({ error: "Le sommelier n'a pas pu répondre" }, { status: 502 });
  }
}
