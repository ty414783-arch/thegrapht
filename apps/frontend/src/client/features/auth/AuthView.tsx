import { useState } from "preact/hooks";
import styles from "./AuthView.module.css";
import { authActions, uiActions } from "../../store/index.ts";
import { thgApi } from "../../api/thg-client.ts";
import { markBootComplete } from "./BootSplash.tsx";
import { syncStoreFromLegacy, syncUserFromLegacy } from "../../store/sync-legacy.ts";
import { useAppStore } from "../../shared/hooks/useStore.ts";

type AuthMode = "login" | "register" | "verify";

export function AuthView() {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const bootComplete = useAppStore((state) => state.ui.bootComplete);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"error" | "success" | "">("");
  const [busy, setBusy] = useState(false);
  const [pendingMode, setPendingMode] = useState<"login" | "register">("login");

  const setError = (message: string) => {
    setStatus(message);
    setStatusType("error");
  };

  const validate = () => {
    if (mode === "register" && !name.trim()) return setError("Enter your name.");
    if (!email.trim()) return setError("Enter your email.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email.");
    if (!password) return setError("Enter your password.");
    if (password.length < 6) return setError("Password is too short.");
    return "";
  };

  const finishAuth = async (payload: Record<string, unknown>, authMode: string) => {
    const win = window as any;
    if (payload?.token && typeof payload.token === "string") {
      win.persistLegacySessionToken?.(payload.token);
      authActions.setToken(payload.token);
    } else {
      win.persistLegacySessionToken?.("");
    }

    syncUserFromLegacy(payload?.user as any);
    win.realtimeEnabled = true;
    await win.loadWorkspace?.();
    win.connectRealtime?.();
    markBootComplete(true);
    uiActions.showToast(authMode === "register" ? "Account created." : "Welcome back.", "success");
  };

  const submitAuth = async (event: Event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) return;

    setBusy(true);
    setStatus("");
    setStatusType("");

    try {
      const body: Record<string, string> = { email: email.trim(), password };
      if (mode === "register") body.name = name.trim();

      const endpoint = mode === "register" ? "/v1/auth/register" : "/v1/auth/login";
      const payload = await thgApi.fetchJson<Record<string, unknown>>(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (payload?.requiresVerification) {
        setPendingMode(mode === "register" ? "register" : "login");
        setMode("verify");
        setStatus("Enter the verification code sent to your email.");
        setStatusType("success");
      } else {
        await finishAuth(payload, mode);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  };

  const submitVerify = async (event: Event) => {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return setError("Please enter the code.");
    if (trimmed.length !== 6) return setError("The code must be exactly 6 digits.");

    setBusy(true);
    try {
      const payload = await thgApi.fetchJson<Record<string, unknown>>("/v1/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: trimmed })
      });
      await finishAuth(payload, pendingMode);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  };

  const resendCode = async () => {
    setBusy(true);
    try {
      await thgApi.fetchJson("/v1/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      uiActions.showToast("A new verification code has been requested.", "success");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to request code.");
    } finally {
      setBusy(false);
    }
  };

  if (isAuthenticated || bootComplete) {
    return null;
  }

  if (mode === "verify") {
    return (
      <section class={styles.overlay} aria-label="Verify email">
        <form class={styles.card} onSubmit={(event) => void submitVerify(event)}>
          <h1 class={styles.title}>Verify email</h1>
          <p class={styles.copy}>Code sent to {email}</p>
          <input
            class={styles.input}
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onInput={(event) => setCode((event.currentTarget as HTMLInputElement).value)}
          />
          {status ? <p class={`${styles.status} ${statusType ? styles[statusType] : ""}`}>{status}</p> : null}
          <button type="submit" class={styles.primary} disabled={busy}>Verify</button>
          <button type="button" class={styles.link} disabled={busy} onClick={() => void resendCode()}>Resend code</button>
          <button type="button" class={styles.link} onClick={() => setMode(pendingMode)}>Back</button>
        </form>
      </section>
    );
  }

  return (
    <section class={styles.overlay} aria-label="Authentication">
      <form class={styles.card} onSubmit={(event) => void submitAuth(event)}>
        <h1 class={styles.title}>{mode === "register" ? "Create account" : "Log in"}</h1>
        <p class={styles.copy}>Enter your credentials to continue to TheGraphT.</p>
        {mode === "register" ? (
          <input
            class={styles.input}
            placeholder="Name"
            value={name}
            onInput={(event) => setName((event.currentTarget as HTMLInputElement).value)}
          />
        ) : null}
        <input
          class={styles.input}
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onInput={(event) => setEmail((event.currentTarget as HTMLInputElement).value)}
        />
        <input
          class={styles.input}
          type="password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          placeholder="Password"
          value={password}
          onInput={(event) => setPassword((event.currentTarget as HTMLInputElement).value)}
        />
        {status ? <p class={`${styles.status} ${statusType ? styles[statusType] : ""}`}>{status}</p> : null}
        <button type="submit" class={styles.primary} disabled={busy}>
          {mode === "register" ? "Register" : "Sign in"}
        </button>
        <button
          type="button"
          class={styles.link}
          onClick={() => {
            setMode(mode === "register" ? "login" : "register");
            setStatus("");
            setStatusType("");
          }}
        >
          {mode === "register" ? "Already have an account?" : "Create an account"}
        </button>
      </form>
    </section>
  );
}
