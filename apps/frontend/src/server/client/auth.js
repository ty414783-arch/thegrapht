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
              if (typeof handleUnauthorizedSession === "function") {
                handleUnauthorizedSession("You are logged out.", "success");
              } else {
                window.location.replace("/");
                return;
              }
            } catch {
              window.location.replace("/");
              return;
            }
            try {
              await fetchJson(apiBase + "/v1/auth/logout", {
                method: "POST"
              });
            } catch {}
            logoutButton.disabled = false;
          })();
        });
      }

      const verificationInner = document.getElementById("auth-verification-inner");
      const verificationEmailTarget = document.getElementById("verification-email-target");
      const verificationForm = document.getElementById("verification-form");
      const verificationCodeInput = document.getElementById("verification-code");
      const verificationStatus = document.getElementById("verification-status");
      const verifyButton = document.getElementById("verify-button");
      const resendCodeButton = document.getElementById("resend-code-button");
      const resendTimerText = document.getElementById("resend-timer-text");
      const resendCountdown = document.getElementById("resend-countdown");
      const resendAttemptsText = document.getElementById("resend-attempts-text");
      const resendAttempts = document.getElementById("resend-attempts");
      const verificationBackBtn = document.getElementById("verification-back-btn");
      const loginInner = document.getElementById("auth-login-inner");
      const metaRow = document.querySelector(".meta-row");

      let resendTimer = null;
      let resendAttemptsLeft = 3;
      let pendingAuthPayload = null;
      let pendingAuthMode = null;
      let pendingAuthEmail = null;

      const startResendCooldown = () => {
        if (resendTimer) {
          window.clearInterval(resendTimer);
        }

        if (resendCodeButton) {
          resendCodeButton.disabled = true;
        }
        if (resendTimerText) {
          resendTimerText.classList.remove("hidden");
        }
        
        let secondsLeft = 60;
        if (resendCountdown) {
          resendCountdown.textContent = secondsLeft;
        }

        resendTimer = window.setInterval(() => {
          secondsLeft -= 1;
          if (resendCountdown) {
            resendCountdown.textContent = secondsLeft;
          }

          if (secondsLeft <= 0) {
            window.clearInterval(resendTimer);
            resendTimer = null;
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
        if (resendAttempts) {
          resendAttempts.textContent = resendAttemptsLeft;
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

      if (resendCodeButton) {
        resendCodeButton.addEventListener("click", () => {
          if (resendAttemptsLeft <= 0) {
            return;
          }

          void (async () => {
            if (resendCodeButton) {
              resendCodeButton.disabled = true;
            }
            try {
              await fetchJson(apiBase + "/v1/auth/resend", {
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
              
              showToast("A new verification code has been requested.", "success");
            } catch (error) {
              showToast(error instanceof Error ? error.message : "Failed to request code.", "error");
              if (resendCodeButton && resendAttemptsLeft > 0 && !resendTimer) {
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
        verificationForm.addEventListener("submit", async (event) => {
          event.preventDefault();
          
          const enteredCode = verificationCodeInput ? verificationCodeInput.value.trim() : "";
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

          try {
            const payload = await fetchJson(apiBase + "/v1/auth/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                email: pendingAuthEmail,
                code: enteredCode
              })
            });

            if (payload?.token && typeof payload.token === "string") {
              persistLegacySessionToken(payload.token);
            } else {
              persistLegacySessionToken("");
            }

            realtimeEnabled = true;
            await loadWorkspace();
            connectRealtime();

            if (pendingAuthMode === "register") {
              setStatus("Account created. Opening workspace.", "success");
              showToast("Account created.", "success");
            } else {
              setStatus("Signed in. Loading chats.", "success");
              showToast("Welcome back.", "success");
            }
          } catch (error) {
            if (verificationStatus) {
              verificationStatus.textContent = error instanceof Error ? error.message : "Verification failed.";
              verificationStatus.className = "status error";
            }
            if (verifyButton) {
              verifyButton.disabled = false;
            }
          }
        });

        if (verificationCodeInput) {
          verificationCodeInput.addEventListener("input", () => {
            verificationCodeInput.classList.remove("invalid");
            if (verificationStatus && verificationStatus.classList.contains("error")) {
              verificationStatus.textContent = "";
              verificationStatus.className = "status";
            }
          });
        }
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

      const startWorkspaceBootstrap = async () => {
        let lastError = null;
        for (let attempt = 0; attempt < 8; attempt += 1) {
          try {
            await loadWorkspace();
            return true;
          } catch (error) {
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

      void startWorkspaceBootstrap()
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
