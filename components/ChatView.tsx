"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { C, FONTS, inputStyle } from "@/lib/design-tokens";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatView() {
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
      const { answer } = (await res.json()) as { answer: string };
      setMessages((m) => [...m, { role: "assistant", content: answer || "Je n'ai pas pu formuler de réponse." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Désolé, une erreur est survenue en interrogeant la cave." }]);
    }
    setBusy(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "calc(100vh - 160px)" }}>
      <h1 style={{ fontFamily: FONTS.display, fontSize: 26, color: C.parchment, marginTop: 0, marginBottom: 14 }}>Le Sommelier</h1>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 4 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "82%",
              background: m.role === "user" ? `linear-gradient(160deg, ${C.bordeauxBright}, ${C.bordeaux})` : C.surface,
              border: m.role === "user" ? "none" : `1px solid ${C.hairline}`,
              color: C.parchment,
              padding: "9px 13px",
              borderRadius: 12,
              borderBottomRightRadius: m.role === "user" ? 3 : 12,
              borderBottomLeftRadius: m.role === "assistant" ? 3 : 12,
              fontSize: 14,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {m.content}
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
          style={{
            width: 42,
            borderRadius: 8,
            border: "none",
            background: `linear-gradient(160deg, ${C.bordeauxBright}, ${C.bordeaux})`,
            color: C.parchment,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
