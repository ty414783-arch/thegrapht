export {};

const getWin = () => window as any;

// Globals from bootstrap.js and other legacy scripts
declare const apiBase: string;
declare const fetchJson: (url: string, options?: any) => Promise<any>;
declare const animateModeChange: (nextMode: string) => void;
declare const handleUnauthorizedSession: (message: string, type: string) => void;
declare const showToast: (message: string, type: string) => void;
declare const persistLegacySessionToken: (token: string) => void;
declare let realtimeEnabled: boolean;
declare const loadWorkspace: () => Promise<void>;
declare const connectRealtime: () => void;
declare const disableRealtime: () => void;
declare const finishBoot: (showWorkspace: boolean) => void;
declare const setStatus: (message: string, type: string) => void;
declare const syncChatIslandActions: () => void;
declare const renderEmojiPicker: () => void;
declare let currentUserId: string;
declare let currentUserUsername: string;
declare let currentUserEmail: string;

// Module level state
let mode = "login";

const getElement = <T extends HTMLElement = HTMLElement>(id: string): T | null => {
  return document.getElementById(id) as T | null;
};

const getToggleButton = () => getElement<HTMLButtonElement>("toggle-mode");
const getStatusNode = () => getElement<HTMLElement>("status");
const getEmailInput = () => getElement<HTMLInputElement>("email");
const getPasswordInput = () => getElement<HTMLInputElement>("password");
const getNameInput = () => getElement<HTMLInputElement>("name");
const getBrandTitleDynamic = () => getElement<HTMLElement>("brand-title-dynamic");
const getBrandTitleCursor = () => getElement<HTMLElement>("brand-title-cursor");
const getLogoutButton = () => getElement<HTMLButtonElement>("logout-button");
const getVerificationInner = () => getElement<HTMLElement>("auth-verification-inner");
const getVerificationEmailTarget = () => getElement<HTMLElement>("verification-email-target");
const getVerificationForm = () => getElement<HTMLFormElement>("verification-form");
const getVerificationCodeInput = () => getElement<HTMLInputElement>("verification-code");
const getVerificationStatus = () => getElement<HTMLElement>("verification-status");
const getVerifyButton = () => getElement<HTMLButtonElement>("verify-button");
const getResendCodeButton = () => getElement<HTMLButtonElement>("resend-code-button");
const getResendTimerText = () => getElement<HTMLElement>("resend-timer-text");
const getResendCountdown = () => getElement<HTMLElement>("resend-countdown");
const getResendAttemptsText = () => getElement<HTMLElement>("resend-attempts-text");
const getResendAttempts = () => getElement<HTMLElement>("resend-attempts");
const getVerificationBackBtn = () => getElement<HTMLButtonElement>("verification-back-btn");
const getLoginInner = () => getElement<HTMLElement>("auth-login-inner");
const getMetaRow = () => document.querySelector(".meta-row") as HTMLElement | null;
const getForm = () => getElement<HTMLFormElement>("auth-form");
const getSubmitButton = () => getElement<HTMLButtonElement>("submit-button");

const setFieldErrorState = (input: HTMLInputElement | null, message = "") => {
  if (!input) {
    return;
  }

  const hasError = Boolean(message);
  input.classList.toggle("invalid", hasError);
  input.setAttribute("aria-invalid", hasError ? "true" : "false");
  if (hasError) {
    input.dataset.validationMessage = message;
  } else {
    delete input.dataset.validationMessage;
  }
};

const clearFieldErrorState = (input: HTMLInputElement | null) => {
  setFieldErrorState(input, "");
};

const validateAuthForm = () => {
  const emailInput = getEmailInput();
  const passwordInput = getPasswordInput();
  const nameInput = getNameInput();

  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";
  const name = nameInput ? nameInput.value.trim() : "";

  clearFieldErrorState(emailInput);
  clearFieldErrorState(passwordInput);
  clearFieldErrorState(nameInput);

  if (mode === "register" && !name) {
    setFieldErrorState(nameInput, "Enter your name.");
    nameInput?.focus();
    return "Enter your name.";
  }

  if (!email) {
    setFieldErrorState(emailInput, "Enter your email.");
    emailInput?.focus();
    return "Enter your email.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldErrorState(emailInput, "Enter a valid email.");
    emailInput?.focus();
    return "Enter a valid email.";
  }

  if (!password) {
    setFieldErrorState(passwordInput, "Enter your password.");
    passwordInput?.focus();
    return "Enter your password.";
  }

  if (password.length < 6) {
    setFieldErrorState(passwordInput, "Password is too short.");
    passwordInput?.focus();
    return "Password is too short.";
  }

  return "";
};

const brandHeroPhrases = [
  "messenger",
  "secure",
  "smooth",
  "private",
  "fast",
  "messenger"
];
let brandHeroTimer: number | null = null;
let brandHeroPhraseIndex = 0;
let brandHeroCharIndex = 0;
let brandHeroDeleting = false;
let brandHeroPaused = false;

const syncBrandHero = () => {
  const brandTitleDynamic = getBrandTitleDynamic();
  const brandTitleCursor = getBrandTitleCursor();

  if (!brandTitleDynamic) {
    return;
  }

  const phrase = brandHeroPhrases[brandHeroPhraseIndex] || "";
  brandTitleDynamic.textContent = phrase.slice(0, brandHeroCharIndex);
  if (brandTitleCursor) {
    brandTitleCursor.style.opacity = "1";
  }
};

const scheduleBrandHeroTick = (delay: number) => {
  if (brandHeroTimer) {
    window.clearTimeout(brandHeroTimer);
  }

  brandHeroTimer = window.setTimeout(runBrandHeroTick, delay);
};

const runBrandHeroTick = () => {
  const phrase = brandHeroPhrases[brandHeroPhraseIndex] || "";

  if (brandHeroPaused) {
    brandHeroPaused = false;
    brandHeroDeleting = true;
    scheduleBrandHeroTick(90);
    return;
  }

  if (!brandHeroDeleting) {
    brandHeroCharIndex = Math.min(phrase.length, brandHeroCharIndex + 1);
    syncBrandHero();

    if (brandHeroCharIndex >= phrase.length) {
      brandHeroPaused = true;
      scheduleBrandHeroTick(1500);
      return;
    }

    scheduleBrandHeroTick(68 + Math.random() * 42);
    return;
  }

  brandHeroCharIndex = Math.max(0, brandHeroCharIndex - 1);
  syncBrandHero();

  if (brandHeroCharIndex <= 0) {
    brandHeroDeleting = false;
    brandHeroPhraseIndex = (brandHeroPhraseIndex + 1) % brandHeroPhrases.length;
    scheduleBrandHeroTick(320);
    return;
  }

  scheduleBrandHeroTick(44 + Math.random() * 28);
};

let resendTimer: number | null = null;
let resendAttemptsLeft = 3;
let pendingAuthPayload: any = null;
let pendingAuthMode: string | null = null;
let pendingAuthEmail = "";

const startResendCooldown = () => {
  if (resendTimer) {
    window.clearInterval(resendTimer);
  }

  const resendCodeButton = getResendCodeButton();
  const resendTimerText = getResendTimerText();
  const resendCountdown = getResendCountdown();

  if (resendCodeButton) {
    resendCodeButton.disabled = true;
  }
  if (resendTimerText) {
    resendTimerText.classList.remove("hidden");
  }
  
  let secondsLeft = 60;
  if (resendCountdown) {
    resendCountdown.textContent = String(secondsLeft);
  }

  resendTimer = window.setInterval(() => {
    secondsLeft -= 1;
    if (resendCountdown) {
      resendCountdown.textContent = String(secondsLeft);
    }

    if (secondsLeft <= 0) {
      if (resendTimer) {
        window.clearInterval(resendTimer);
        resendTimer = null;
      }
      if (resendTimerText) {
        resendTimerText.classList.add("hidden");
      }
      
      if (resendAttemptsLeft > 0 && resendCodeButton) {
        resendCodeButton.disabled = false;
      }
    }
  }, 1000);
};

const updateAttemptsUI = () => {
  const resendAttempts = getResendAttempts();
  const resendAttemptsText = getResendAttemptsText();
  const resendCodeButton = getResendCodeButton();

  if (resendAttempts) {
    resendAttempts.textContent = String(resendAttemptsLeft);
  }
  if (resendAttemptsText) {
    if (resendAttemptsLeft <= 0) {
      resendAttemptsText.textContent = "No attempts remaining";
      if (resendCodeButton) {
        resendCodeButton.disabled = true;
      }
    } else {
      resendAttemptsText.textContent = "Attempts remaining: " + resendAttemptsLeft;
    }
  }
};

const showVerificationScreen = (email: string, authMode: string, payload: any) => {
  pendingAuthEmail = email;
  pendingAuthMode = authMode;
  pendingAuthPayload = payload;

  const loginInner = getLoginInner();
  const verificationInner = getVerificationInner();
  const verificationEmailTarget = getVerificationEmailTarget();
  const metaRow = getMetaRow();
  const verificationCodeInput = getVerificationCodeInput();
  const verificationStatus = getVerificationStatus();

  if (loginInner) {
    loginInner.classList.add("hidden");
  }
  if (metaRow) {
    metaRow.classList.add("hidden");
  }

  if (verificationInner) {
    verificationInner.classList.remove("hidden");
    verificationInner.classList.add("fade-in");
    void verificationInner.offsetWidth;
    verificationInner.classList.remove("fade-in");
  }

  if (verificationEmailTarget) {
    verificationEmailTarget.textContent = email;
  }

  if (verificationCodeInput) {
    verificationCodeInput.value = "";
    verificationCodeInput.focus();
  }

  if (verificationStatus) {
    verificationStatus.textContent = "";
    verificationStatus.className = "status";
  }

  resendAttemptsLeft = 3;
  updateAttemptsUI();
  startResendCooldown();
};

const handleLoginSuccess = async (payload: any, authMode: string) => {
  if (payload?.token && typeof payload.token === "string") {
    getWin().persistLegacySessionToken(payload.token);
  } else {
    getWin().persistLegacySessionToken("");
  }

  getWin().realtimeEnabled = true;
  await getWin().loadWorkspace();
  getWin().connectRealtime();

  if (authMode === "register") {
    getWin().setStatus("Account created. Opening workspace.", "success");
    getWin().showToast("Account created.", "success");
  } else {
    getWin().setStatus("Signed in. Loading chats.", "success");
    getWin().showToast("Welcome back.", "success");
  }
};

const initAuthEvents = () => {
  const toggleButton = getToggleButton();
  const statusNode = getStatusNode();
  const logoutButton = getLogoutButton();
  const resendCodeButton = getResendCodeButton();
  const verificationBackBtn = getVerificationBackBtn();
  const verificationForm = getVerificationForm();
  const verificationCodeInput = getVerificationCodeInput();
  const form = getForm();
  const submitButton = getSubmitButton();

  const nameInput = getNameInput();
  const emailInput = getEmailInput();
  const passwordInput = getPasswordInput();

  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      mode = mode === "login" ? "register" : "login";
      if (statusNode) {
        statusNode.textContent = "";
        statusNode.className = "status";
      }
      if (typeof getWin().animateModeChange === "function") {
        getWin().animateModeChange(mode);
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      void (async () => {
        logoutButton.disabled = true;
        try {
          if (typeof getWin().handleUnauthorizedSession === "function") {
            getWin().handleUnauthorizedSession("You are logged out.", "success");
          } else {
            window.location.replace("/");
            return;
          }
        } catch {
          window.location.replace("/");
          return;
        }
        try {
          await getWin().fetchJson(getWin().apiBase + "/v1/auth/logout", {
            method: "POST"
          });
        } catch {}
        logoutButton.disabled = false;
      })();
    });
  }

  if (resendCodeButton) {
    resendCodeButton.addEventListener("click", () => {
      if (resendAttemptsLeft <= 0) {
        return;
      }

      void (async () => {
        resendCodeButton.disabled = true;
        try {
          await getWin().fetchJson(getWin().apiBase + "/v1/auth/resend", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: pendingAuthEmail
            })
          });

          resendAttemptsLeft -= 1;
          updateAttemptsUI();
          startResendCooldown();
          
          getWin().showToast("A new verification code has been requested.", "success");
        } catch (error) {
          getWin().showToast(error instanceof Error ? error.message : "Failed to request code.", "error");
          if (resendAttemptsLeft > 0 && !resendTimer) {
            resendCodeButton.disabled = false;
          }
        }
      })();
    });
  }

  if (verificationBackBtn) {
    verificationBackBtn.addEventListener("click", () => {
      if (resendTimer) {
        window.clearInterval(resendTimer);
        resendTimer = null;
      }

      const verificationInner = getVerificationInner();
      const loginInner = getLoginInner();
      const metaRow = getMetaRow();

      if (verificationInner) {
        verificationInner.classList.add("fade-out");
      }

      window.setTimeout(() => {
        if (verificationInner) {
          verificationInner.classList.add("hidden");
          verificationInner.classList.remove("fade-out");
        }

        if (loginInner) {
          loginInner.classList.remove("hidden");
          loginInner.classList.add("fade-in");
          void loginInner.offsetWidth;
          loginInner.classList.remove("fade-in");
        }

        if (metaRow) {
          metaRow.classList.remove("hidden");
          metaRow.style.opacity = "1";
        }
      }, 300);
    });
  }

  if (verificationForm) {
    verificationForm.addEventListener("submit", (event) => {
      event.preventDefault();
      
      const enteredCode = verificationCodeInput ? verificationCodeInput.value.trim() : "";
      const verificationStatus = getVerificationStatus();
      const verifyButton = getVerifyButton();

      if (verificationStatus) {
        verificationStatus.textContent = "";
        verificationStatus.className = "status";
      }

      if (!enteredCode) {
        if (verificationCodeInput) {
          verificationCodeInput.classList.add("invalid");
          verificationCodeInput.focus();
        }
        if (verificationStatus) {
          verificationStatus.textContent = "Please enter the code.";
          verificationStatus.className = "status error";
        }
        return;
      }

      if (enteredCode.length !== 6) {
        if (verificationCodeInput) {
          verificationCodeInput.classList.add("invalid");
          verificationCodeInput.focus();
        }
        if (verificationStatus) {
          verificationStatus.textContent = "The code must be exactly 6 digits.";
          verificationStatus.className = "status error";
        }
        return;
      }

      if (verifyButton) {
        verifyButton.disabled = true;
      }
      if (verificationStatus) {
        verificationStatus.textContent = "Verifying code...";
        verificationStatus.className = "status success";
      }

      void (async () => {
        try {
          const payload = await getWin().fetchJson(getWin().apiBase + "/v1/auth/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: pendingAuthEmail,
              code: enteredCode
            })
          });

          await handleLoginSuccess(payload, pendingAuthMode || "login");
        } catch (error) {
          if (verificationStatus) {
            verificationStatus.textContent = error instanceof Error ? error.message : "Verification failed.";
            verificationStatus.className = "status error";
          }
          if (verifyButton) {
            verifyButton.disabled = false;
          }
        }
      })();
    });

    if (verificationCodeInput) {
      verificationCodeInput.addEventListener("input", () => {
        verificationCodeInput.classList.remove("invalid");
        const verificationStatus = getVerificationStatus();
        if (verificationStatus && verificationStatus.classList.contains("error")) {
          verificationStatus.textContent = "";
          verificationStatus.className = "status";
        }
      });
    }
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const validationError = validateAuthForm();

      if (validationError) {
        if (statusNode) {
          statusNode.textContent = validationError;
          statusNode.className = "status error";
        }
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
      }

      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";
      const body: any = { email, password };

      if (mode === "register" && nameInput) {
        body.name = nameInput.value.trim();
      }

      void (async () => {
        try {
          const payload = await getWin().fetchJson(getWin().apiBase + "/v1/auth/" + (mode === "register" ? "register" : "login"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
          });

          if (payload?.requiresVerification) {
            showVerificationScreen(email, mode, payload);
          } else {
            await handleLoginSuccess(payload, mode);
          }
        } catch (error) {
          if (statusNode) {
            statusNode.textContent = error instanceof Error ? error.message : "Request failed.";
            statusNode.className = "status error";
          }
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
          }
        }
      })();
    });
  }

  [nameInput, emailInput, passwordInput].forEach((input) => {
    if (!input) {
      return;
    }

    input.addEventListener("input", () => {
      clearFieldErrorState(input);
      if (statusNode && statusNode.classList.contains("error")) {
        statusNode.textContent = "";
        statusNode.className = "status";
      }
    });
  });

  if (typeof getWin().animateModeChange === "function") {
    getWin().animateModeChange(mode);
  }
  if (typeof getWin().syncChatIslandActions === "function") {
    getWin().syncChatIslandActions();
  }
  if (typeof getWin().renderEmojiPicker === "function") {
    getWin().renderEmojiPicker();
  }
  syncBrandHero();
  scheduleBrandHeroTick(900);
};

const clearLegacyPwaState = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    } catch {}
  }

  if ("caches" in window) {
    try {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    } catch {}
  }
};

void clearLegacyPwaState();

const startWorkspaceBootstrap = async () => {
  let lastError: any = null;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await getWin().loadWorkspace();
      return true;
    } catch (error: any) {
      lastError = error;
      const message = String(error?.message || "");
      if (/unauthorized/i.test(message)) {
        throw error;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 600));
    }
  }
  if (lastError) {
    throw lastError;
  }
  throw new Error("Workspace bootstrap failed.");
};

const startApp = () => {
  initAuthEvents();
  void startWorkspaceBootstrap()
    .then(() => {
      getWin().realtimeEnabled = true;
      getWin().connectRealtime();
    })
    .catch((e) => {
      const isUnauthorized = String(e?.message || "").toLowerCase().includes("unauthorized");
      if (!isUnauthorized) {
        console.warn("Bootstrap failed:", e);
      }
      if (typeof getWin().disableRealtime === "function") {
        getWin().disableRealtime();
      }
      if (typeof getWin().finishBoot === "function") {
        getWin().finishBoot(false);
      }
    });
};

if (document.readyState === "complete") {
  window.setTimeout(startApp, 0);
} else {
  window.addEventListener("load", startApp);
}

window.addEventListener("offline", () => {
  getWin().showToast("Connection lost. Messages may fail to send.", "error");
});

window.addEventListener("online", () => {
  getWin().showToast("Connection restored.", "success");
  if (getWin().currentUserId) {
    getWin().realtimeEnabled = true;
    getWin().connectRealtime();
  }
});
