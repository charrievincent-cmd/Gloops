"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const [googleBusy, setGoogleBusy] = useState(false);
  const searchParams = useSearchParams();
  const googleError = searchParams.get("erreur") === "google";

  const signInWithGoogle = async () => {
    setError("");
    setGoogleBusy(true);
    const { error: oauthError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setError(oauthError.message);
      setGoogleBusy(false);
    }
  };

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

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={googleBusy}
          className="gloops-btn"
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 10,
            border: `1px solid ${C.hairline}`,
            background: C.surfaceRaised,
            color: C.parchment,
            fontWeight: 600,
            fontSize: 15,
            cursor: googleBusy ? "default" : "pointer",
            opacity: googleBusy ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: `0 4px 14px ${C.shadow}`,
          }}
        >
          {googleBusy ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <GoogleLogo />}
          Continuer avec Google
        </button>
        {googleError && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", color: C.danger, fontSize: 13, marginTop: 10 }}>
            <AlertCircle size={14} /> La connexion avec Google a échoué, réessaie.
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 16px", color: C.parchmentFaint, fontSize: 12 }}>
          <div style={{ flex: 1, height: 1, background: C.hairline }} />
          ou avec un email et un mot de passe
          <div style={{ flex: 1, height: 1, background: C.hairline }} />
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
          Seules les personnes autorisées par la personne qui gère la cave peuvent y accéder.
        </p>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
