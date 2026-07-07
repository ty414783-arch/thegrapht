import { withTransaction, query, queryOne } from "../../db/client.js";
import {
  buildUsernameCandidate,
  createSession,
  createSessionCookie,
  createUserId,
  deleteSessionFromToken,
  getTokenFromRequest,
  hashPassword,
  sanitizeUser,
  verifyPassword,
  createClearedSessionCookie
} from "../../services/auth.js";
import { ensureSavedMessagesDialogForUser, seedUserWorkspace } from "../../services/dialogs.js";
import { getUserByEmail, createUser, updateUserAvatar } from "../../services/users.js";
import { generateVerificationCode, sendVerificationEmail } from "../../services/mail.js";
import { readJsonBody, sendJson } from "../../utils/http.js";
import {
  loginSchema,
  registerSchema,
  verifySchema,
  resendSchema
} from "../../validation/schemas.js";

const isUniqueViolation = (error) => error && typeof error === "object" && error.code === "23505";
const MAX_USERNAME_GENERATION_ATTEMPTS = 6;
const isUsernameUniqueViolation = (error) => {
  if (!isUniqueViolation(error)) {
    return false;
  }

  const constraint = String(error?.constraint || "").toLowerCase();
  const detail = String(error?.detail || "").toLowerCase();
  return constraint.includes("username") || detail.includes("(username)=");
};

export const handleRegister = async (request, response, context) => {
  try {
    if (!context.ensureRateLimit(request, response, context.rateLimiters.auth, "register")) {
      return;
    }

    const body = context.parseWithSchema(registerSchema, await readJsonBody(request));
    const { name, email, password } = body;

    if (await getUserByEmail(email)) {
      sendJson(request, response, 409, { error: "An account with this email already exists." });
      return;
    }

    const passwordHash = hashPassword(password);
    const userId = createUserId();
    let token = null;
    let user = null;
    let lastRegisterError = null;

    for (let attempt = 0; attempt < MAX_USERNAME_GENERATION_ATTEMPTS; attempt += 1) {
      const userCandidate = {
        id: userId,
        name,
        username: buildUsernameCandidate(name),
        email,
        passwordHash,
        telegramId: null,
        telegramUsername: null
      };

      try {
        token = await withTransaction(async (client) => {
          await createUser(userCandidate, client);
          await seedUserWorkspace(userCandidate, client);
          await ensureSavedMessagesDialogForUser(userCandidate, client);
          return createSession(userCandidate.id, client);
        });
        user = userCandidate;
        lastRegisterError = null;
        break;
      } catch (error) {
        lastRegisterError = error;
        if (isUsernameUniqueViolation(error) && attempt < (MAX_USERNAME_GENERATION_ATTEMPTS - 1)) {
          continue;
        }
        throw error;
      }
    }

    if (!token || !user) {
      throw lastRegisterError || new Error("Registration failed.");
    }

    sendJson(request, response, 200, {
      user: sanitizeUser(user),
      token
    }, {
      "Set-Cookie": createSessionCookie(request, token)
    });
  } catch (error) {
    const statusCode = isUniqueViolation(error) ? 409 : 400;
    sendJson(request, response, statusCode, {
      error: statusCode === 409 ? "An account with these credentials already exists." : error instanceof Error ? error.message : "Registration failed."
    });
  }
};

export const handleLogin = async (request, response, context) => {
  try {
    if (!context.ensureRateLimit(request, response, context.rateLimiters.auth, "login")) {
      return;
    }

    const body = context.parseWithSchema(loginSchema, await readJsonBody(request));
    const { email, password } = body;
    const user = await getUserByEmail(email);

    if (!user || user.isSystem || !verifyPassword(password, user.passwordHash)) {
      sendJson(request, response, 401, { error: "Invalid email or password." });
      return;
    }

    const token = await withTransaction(async (client) => {
      await seedUserWorkspace(user, client);
      await ensureSavedMessagesDialogForUser(user, client);
      return createSession(user.id, client);
    });

    sendJson(request, response, 200, {
      user: sanitizeUser(user),
      token
    }, {
      "Set-Cookie": createSessionCookie(request, token)
    });
  } catch (error) {
    sendJson(request, response, 400, {
      error: error instanceof Error ? error.message : "Login failed."
    });
  }
};


export const handleVerify = async (request, response, context) => {
  try {
    if (!context.ensureRateLimit(request, response, context.rateLimiters.auth, "verify")) {
      return;
    }

    const body = context.parseWithSchema(verifySchema, await readJsonBody(request));
    const { email, code } = body;

    const record = await queryOne(
      `
        SELECT email, code, type, payload, attempts, expires_at
        FROM email_verifications
        WHERE email = $1
      `,
      [email]
    );

    if (!record) {
      sendJson(request, response, 400, { error: "No pending verification session found." });
      return;
    }

    if (new Date() > new Date(record.expires_at)) {
      sendJson(request, response, 400, { error: "Verification code has expired. Please request a new one." });
      return;
    }

    if (record.attempts >= 3) {
      sendJson(request, response, 400, { error: "Too many failed attempts. Please request a new code." });
      return;
    }

    if (record.code !== code) {
      await query(
        `
          UPDATE email_verifications
          SET attempts = attempts + 1
          WHERE email = $1
        `,
        [email]
      );

      const remaining = 3 - (record.attempts + 1);
      const errorMsg = remaining > 0
        ? `Invalid verification code. ${remaining} attempts remaining.`
        : "Invalid verification code. No attempts remaining. Please request a new code.";

      sendJson(request, response, 400, { error: errorMsg });
      return;
    }

    let token = null;
    let user = null;

    if (record.type === "register") {
      const { name, passwordHash, telegram_id, telegram_username } = record.payload || {};
      const userId = createUserId();
      let lastRegisterError = null;

      for (let attempt = 0; attempt < MAX_USERNAME_GENERATION_ATTEMPTS; attempt += 1) {
        const userCandidate = {
          id: userId,
          name,
          username: buildUsernameCandidate(name),
          email,
          passwordHash,
          telegramId: telegram_id,
          telegramUsername: telegram_username
        };

        try {
          token = await withTransaction(async (client) => {
            await createUser(userCandidate, client);
            await seedUserWorkspace(userCandidate, client);
            await ensureSavedMessagesDialogForUser(userCandidate, client);
            return createSession(userCandidate.id, client);
          });
          user = userCandidate;
          lastRegisterError = null;
          break;
        } catch (error) {
          lastRegisterError = error;
          if (isUsernameUniqueViolation(error) && attempt < (MAX_USERNAME_GENERATION_ATTEMPTS - 1)) {
            continue;
          }
          throw error;
        }
      }

      if (!token || !user) {
        throw lastRegisterError || new Error("Registration failed.");
      }
    } else {
      const existingUser = await getUserByEmail(email);
      if (!existingUser) {
        sendJson(request, response, 400, { error: "User account not found." });
        return;
      }

      const { telegram_id, telegram_username } = record.payload || {};

      token = await withTransaction(async (client) => {
        if (telegram_id && !existingUser.telegramId) {
          await query(
            `
              UPDATE users
              SET telegram_id = $1,
                  telegram_username = $2
              WHERE id = $3
            `,
            [telegram_id, telegram_username, existingUser.id],
            client
          );
          existingUser.telegramId = telegram_id;
          existingUser.telegramUsername = telegram_username;
        }
        await seedUserWorkspace(existingUser, client);
        await ensureSavedMessagesDialogForUser(existingUser, client);
        return createSession(existingUser.id, client);
      });
      user = existingUser;
    }

    // Clear verification session upon success
    await query(
      `
        DELETE FROM email_verifications
        WHERE email = $1
      `,
      [email]
    );

    sendJson(request, response, 200, {
      user: sanitizeUser(user),
      token
    }, {
      "Set-Cookie": createSessionCookie(request, token)
    });
  } catch (error) {
    sendJson(request, response, 400, {
      error: error instanceof Error ? error.message : "Verification failed."
    });
  }
};

export const handleResend = async (request, response, context) => {
  try {
    if (!context.ensureRateLimit(request, response, context.rateLimiters.auth, "resend")) {
      return;
    }

    const body = context.parseWithSchema(resendSchema, await readJsonBody(request));
    const { email } = body;

    const record = await queryOne(
      `
        SELECT email, type, payload
        FROM email_verifications
        WHERE email = $1
      `,
      [email]
    );

    if (!record) {
      sendJson(request, response, 400, { error: "No pending verification session found." });
      return;
    }

    const code = generateVerificationCode();

    await query(
      `
        UPDATE email_verifications
        SET code = $1,
            attempts = 0,
            created_at = NOW(),
            expires_at = NOW() + INTERVAL '10 minutes'
        WHERE email = $2
      `,
      [code, email]
    );

    // Dispatch verification SMTP email asynchronously
    void sendVerificationEmail(email, code);

    sendJson(request, response, 200, {
      success: true
    });
  } catch (error) {
    sendJson(request, response, 400, {
      error: error instanceof Error ? error.message : "Resending verification code failed."
    });
  }
};

export const handleLogout = async (request, response) => {
  const token = getTokenFromRequest(request);

  if (token) {
    await deleteSessionFromToken(token);
  }

  sendJson(request, response, 200, {
    ok: true
  }, {
    "Set-Cookie": createClearedSessionCookie(request)
  });
};

export const handleUpdateUserAvatar = async (request, response, context) => {
  await context.withAuthorizedUser(request, response, async (user) => {
    try {
      const body = await readJsonBody(request);
      const avatarDataUrl = typeof body?.avatarDataUrl === "string" ? body.avatarDataUrl.trim() : "";
      if (!avatarDataUrl) {
        sendJson(request, response, 400, { error: "avatarDataUrl is required" });
        return;
      }

      if (avatarDataUrl.length > 3_000_000) {
        sendJson(request, response, 400, { error: "Uploaded photo is too large" });
        return;
      }

      let updatedUser = null;
      await withTransaction(async (client) => {
        updatedUser = await updateUserAvatar(user.id, avatarDataUrl, client);
      });

      if (!updatedUser) {
        sendJson(request, response, 500, { error: "Failed to update profile photo" });
        return;
      }

      await context.realtimeHub.broadcastProfileUpdated({
        userId: user.id,
        avatarUrl: updatedUser.avatarUrl,
        displayName: updatedUser.name,
        username: updatedUser.username
      });

      sendJson(request, response, 200, { user: sanitizeUser(updatedUser) });
    } catch (error) {
      console.error("Failed to update user avatar:", error);
      sendJson(request, response, 500, { error: "Internal server error" });
    }
  });
};

export const handleCheckSession = async (request, response, context) => {
  await context.withAuthorizedUser(request, response, async (user) => {
    sendJson(request, response, 200, { ok: true }, {
      "X-User-Email": user.email,
      "X-User-Name": user.name || user.username || ""
    });
  });
};

