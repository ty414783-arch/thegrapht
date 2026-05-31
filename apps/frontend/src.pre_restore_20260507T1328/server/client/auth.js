export const buildAuthClientChunk = ({
  serviceWorkerUrl
}) => `      toggleButton.addEventListener("click", () => {
        mode = mode === "login" ? "register" : "login";
        statusNode.textContent = "";
        statusNode.className = "status";
        animateModeChange(mode);
      });

      const setFieldErrorState = (input, message = "") => {
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

      const clearFieldErrorState = (input) => {
        setFieldErrorState(input, "");
      };

      const validateAuthForm = () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const name = nameInput.value.trim();

        clearFieldErrorState(emailInput);
        clearFieldErrorState(passwordInput);
        clearFieldErrorState(nameInput);

        if (mode === "register" && !name) {
          setFieldErrorState(nameInput, "Enter your name.");
          nameInput.focus();
          return "Enter your name.";
        }

        if (!email) {
          setFieldErrorState(emailInput, "Enter your email.");
          emailInput.focus();
          return "Enter your email.";
        }

        if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
          setFieldErrorState(emailInput, "Enter a valid email.");
          emailInput.focus();
          return "Enter a valid email.";
        }

        if (!password) {
          setFieldErrorState(passwordInput, "Enter your password.");
          passwordInput.focus();
          return "Enter your password.";
        }

        if (password.length < 6) {
          setFieldErrorState(passwordInput, "Password is too short.");
          passwordInput.focus();
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
      let brandHeroTimer = null;
      let brandHeroPhraseIndex = 0;
      let brandHeroCharIndex = 0;
      let brandHeroDeleting = false;
      let brandHeroPaused = false;

      const syncBrandHero = () => {
        if (!brandTitleDynamic) {
          return;
        }

        const phrase = brandHeroPhrases[brandHeroPhraseIndex] || "";
        brandTitleDynamic.textContent = phrase.slice(0, brandHeroCharIndex);
        if (brandTitleCursor) {
          brandTitleCursor.style.opacity = "1";
        }
      };

      const scheduleBrandHeroTick = (delay) => {
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

      if (logoutButton) {
        logoutButton.addEventListener("click", () => {
          void (async () => {
            logoutButton.disabled = true;

            try {
              await fetchJson(apiBase + "/v1/auth/logout", {
                method: "POST"
              });
            } catch {}
            finally {
              logoutButton.disabled = false;
            }

            handleUnauthorizedSession("You are logged out.", "success");
          })();
        });
      }

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const validationError = validateAuthForm();

        if (validationError) {
          setStatus(validationError, "error");
          return;
        }

        submitButton.disabled = true;

        const body = {
          email: emailInput.value.trim(),
          password: passwordInput.value
        };

        if (mode === "register") {
          body.name = nameInput.value.trim();
        }

        try {
          const payload = await fetchJson(apiBase + "/v1/auth/" + (mode === "register" ? "register" : "login"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
          });

          if (payload?.token && typeof payload.token === "string") {
            persistLegacySessionToken(payload.token);
          } else {
            persistLegacySessionToken("");
          }

          realtimeEnabled = true;
          await loadWorkspace();
          connectRealtime();

          if (mode === "register") {
            setStatus("Account created. Opening workspace.", "success");
            showToast("Account created.", "success");
          } else {
            setStatus("Signed in. Loading chats.", "success");
            showToast("Welcome back.", "success");
          }
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Request failed.", "error");
        } finally {
          submitButton.disabled = false;
        }
      });

      [nameInput, emailInput, passwordInput].forEach((input) => {
        if (!input) {
          return;
        }

        input.addEventListener("input", () => {
          clearFieldErrorState(input);
          if (statusNode.classList.contains("error")) {
            statusNode.textContent = "";
            statusNode.className = "status";
          }
        });
      });

      animateModeChange(mode);
      syncChatIslandActions();
      renderEmojiPicker();
      syncBrandHero();
      scheduleBrandHeroTick(900);

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

      void loadWorkspace()
        .then(() => {
          realtimeEnabled = true;
          connectRealtime();
        })
        .catch(() => {
          disableRealtime();
          finishBoot(false);
        });

      window.addEventListener("offline", () => {
        showToast("Connection lost. Messages may fail to send.", "error");
      });

      window.addEventListener("online", () => {
        showToast("Connection restored.", "success");
        if (currentUserId) {
          realtimeEnabled = true;
          connectRealtime();
        }
      });
`;
