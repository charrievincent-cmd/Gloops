"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Wine } from "lucide-react";
import { BRAND_GRADIENT, C, FONTS, inputStyle } from "@/lib/design-tokens";

interface ReferencedBottle {
  lot_id: string;
  nom: string | null;
  annee: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  referencedBottles?: ReferencedBottle[];
}

export function ChatView() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour ! Je suis ton sommelier. Demande-moi par exemple un vin à boire bientôt, ou un accord avec un plat.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    const newMsgs = [...messages, { role: "user" as const, content: q }];
    setMessages(newMsgs);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, history: newMsgs.slice(-8) }),
      });
      if (!res.ok) throw new Error("chat failed");
      const { answer, referencedBottles } = (await res.json()) as {
        answer: string;
        referencedBottles?: ReferencedBottle[];
      };
      setMessages((m) => [
        ...m,
        { role: "assistant", content: answer || "Je n'ai pas pu formuler de réponse.", referencedBottles },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Désolé, une erreur est survenue en interrogeant la cave." }]);
    }
    setBusy(false);
  };

  return (
    <div className="gloops-chat-shell" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <h1 style={{ fontFamily: FONTS.display, fontSize: 26, color: C.parchment, marginTop: 0, marginBottom: 14 }}>Le Sommelier</h1>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 4 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", gap: 6 }}>
            <div
              style={{
                maxWidth: "82%",
                background: m.role === "user" ? BRAND_GRADIENT : C.surface,
                border: m.role === "user" ? "none" : `1px solid ${C.hairline}`,
                color: m.role === "user" ? "#FFF6EA" : C.parchment,
                padding: "9px 13px",
                borderRadius: 12,
                borderBottomRightRadius: m.role === "user" ? 3 : 12,
                borderBottomLeftRadius: m.role === "assistant" ? 3 : 12,
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                boxShadow: m.role === "user" ? `0 4px 14px ${C.shadow}` : "none",
              }}
            >
              {m.content}
            </div>
            {!!m.referencedBottles?.length && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: "82%" }}>
                {m.referencedBottles.map((b) => (
                  <button
                    key={b.lot_id}
                    onClick={() => router.push(`/cave?open=${b.lot_id}`)}
                    className="gloops-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "5px 10px",
                      borderRadius: 20,
                      border: `1px solid ${C.gold}`,
                      background: "transparent",
                      color: C.gold,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <Wine size={11} />
                    {b.nom || "Voir la bouteille"}
                    {b.annee ? ` · ${b.annee}` : ""}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div style={{ alignSelf: "flex-start", display: "flex", gap: 8, alignItems: "center", color: C.parchmentMuted, fontSize: 13, padding: "6px 4px" }}>
            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Le sommelier réfléchit…
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14, paddingBottom: 4 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="ex. un vin à boire bientôt, qui va avec une raclette ?"
          style={{ ...inputStyle(false), flex: 1 }}
        />
        <button
          onClick={send}
          disabled={busy}
          className="gloops-btn"
          style={{
            width: 42,
            borderRadius: 9,
            border: "none",
            background: BRAND_GRADIENT,
            color: "#FFF6EA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            opacity: busy ? 0.6 : 1,
            boxShadow: `0 4px 14px ${C.shadow}`,
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
