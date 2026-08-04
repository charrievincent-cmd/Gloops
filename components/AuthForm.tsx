"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Lock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BRAND_GRADIENT, C, FONTS } from "@/lib/design-tokens";
import { Field, TextInput } from "@/components/ui";

export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Renseigne ton email et ton mot de passe.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push("/cave");
    router.refresh();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: C.bgAlt,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              overflow: "hidden",
              boxShadow: `0 0 0 1px ${C.hairline}, 0 8px 24px ${C.shadow}`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-mark.png" alt="" style={{ width: "78%", height: "78%", objectFit: "contain" }} />
          </div>
          <h1 style={{ fontFamily: FONTS.display, fontSize: 30, color: C.parchment, margin: 0, letterSpacing: 0.3 }}>
            Gloops <span style={{ color: C.copper }}>2.0</span>
          </h1>
          <p
            style={{
              color: C.parchmentMuted,
              fontSize: 13,
              marginTop: 6,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Bon retour parmi vos bouteilles
          </p>
        </div>

        <form
          onSubmit={submit}
          style={{ background: C.surface, border: `1px solid ${C.hairline}`, borderRadius: 12, padding: 24 }}
        >
          <Field label="Email">
            <div style={{ position: "relative" }}>
              <User size={15} color={C.parchmentFaint} style={{ position: "absolute", left: 12, top: 12 }} />
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="toi@exemple.com"
                style={{ paddingLeft: 34 }}
                autoComplete="username"
              />
            </div>
          </Field>
          <Field label="Mot de passe">
            <div style={{ position: "relative" }}>
              <Lock size={15} color={C.parchmentFaint} style={{ position: "absolute", left: 12, top: 12 }} />
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingLeft: 34 }}
                autoComplete="current-password"
              />
            </div>
          </Field>

          {error && (
            <div style={{ display: "flex", gap: 6, alignItems: "center", color: C.danger, fontSize: 13, marginTop: 8 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="gloops-btn"
            style={{
              width: "100%",
              marginTop: 18,
              padding: "11px 0",
              borderRadius: 9,
              border: "none",
              background: BRAND_GRADIENT,
              color: "#FFF6EA",
              fontWeight: 600,
              fontSize: 14,
              cursor: busy ? "default" : "pointer",
              opacity: busy ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: `0 6px 18px ${C.shadow}`,
            }}
          >
            {busy && <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />}
            Se connecter
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: C.parchmentFaint }}>
          Pas encore de compte ? Demande à la personne qui gère la cave de t&apos;en créer un.
        </p>
      </div>
    </div>
  );
}
