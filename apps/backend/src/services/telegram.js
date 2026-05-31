import crypto from "node:crypto";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";
import { query, queryOne } from "../db/client.js";

const TELEGRAM_TOKEN = config.telegramBotToken;
const API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

async function sendTelegramMessage(chatId, text) {
  try {
    const response = await fetch(`${API_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });
    const result = await response.json();
    if (!result.ok) {
      logger.error({ result }, "Failed to send Telegram message");
    }
  } catch (error) {
    logger.error(error, "Error sending Telegram message");
  }
}

export async function handleUpdate(update) {
  if (!update.message || !update.message.text) {
    return;
  }

  const chatId = update.message.chat.id;
  const messageText = update.message.text.trim();
  const telegramId = String(update.message.from.id);
  const telegramUsername = update.message.from.username || "";

  // 1. Handle /unlink command
  if (messageText.startsWith("/unlink")) {
    try {
      const linkedUser = await queryOne(
        `
          SELECT id, email
          FROM users
          WHERE telegram_id = $1
        `,
        [telegramId]
      );

      if (linkedUser) {
        await query(
          `
            UPDATE users
            SET telegram_id = NULL,
                telegram_username = NULL
            WHERE id = $1
          `,
          [linkedUser.id]
        );
        await sendTelegramMessage(
          chatId,
          `✅ Your Telegram account has been successfully unlinked from <b>${linkedUser.email}</b>. You can now use it with a different email address!`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `ℹ️ Your Telegram account is not linked to any email address.`
        );
      }
    } catch (error) {
      logger.error(error, "Error executing /unlink command");
      await sendTelegramMessage(chatId, `❌ An error occurred while unlinking your account. Please try again later.`);
    }
    return;
  }

  // 2. Handle /start command
  if (messageText.startsWith("/start")) {
    const welcomeText =
      `Welcome to <b>TheGraphT Messenger Verification Bot</b>! 🔐\n\n` +
      `To link your Telegram account and receive a secure 6-digit login or registration verification code, please send your email address to this bot or use the command:\n` +
      `<code>/code yourname@example.com</code>\n\n` +
      `If you need to decouple your Telegram account from a previously registered email (e.g. to switch accounts or correct a typo), send:\n` +
      `/unlink`;
    await sendTelegramMessage(chatId, welcomeText);
    return;
  }

  // 2. Extract email address
  let email = null;
  if (messageText.startsWith("/code")) {
    const parts = messageText.split(/\s+/);
    if (parts.length > 1) {
      email = parts[1].trim().toLowerCase();
    }
  } else if (messageText.includes("@")) {
    // Simple email extraction
    const match = messageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (match) {
      email = match[0].trim().toLowerCase();
    }
  }

  if (!email) {
    const helpText =
      `Please send a valid email address (e.g. <code>yourname@example.com</code>) or use the command:\n` +
      `/code <code>yourname@example.com</code>`;
    await sendTelegramMessage(chatId, helpText);
    return;
  }

  try {
    // 3. Verify if there is an active/pending session in email_verifications
    const pendingVerification = await queryOne(
      `
        SELECT email, code, type, payload, expires_at
        FROM email_verifications
        WHERE email = $1
      `,
      [email]
    );

    if (!pendingVerification) {
      // No pending verification. Check if already registered.
      const existingUser = await queryOne(
        `
          SELECT id, telegram_id AS "telegramId"
          FROM users
          WHERE email = $1
        `,
        [email]
      );

      if (existingUser) {
        if (existingUser.telegramId) {
          if (existingUser.telegramId === telegramId) {
            await sendTelegramMessage(
              chatId,
              `This email is already linked to your Telegram account. Please initiate a login on the website first.`
            );
          } else {
            await sendTelegramMessage(
              chatId,
              `This email is already registered and linked to a different Telegram account. For security, you cannot use this Telegram account to verify this email.`
            );
          }
        } else {
          await sendTelegramMessage(
            chatId,
            `This email is registered but not linked to any Telegram account. Please initiate a login on the website first.`
          );
        }
      } else {
        await sendTelegramMessage(
          chatId,
          `No pending registration session found for this email. Please sign up on the website first.`
        );
      }
      return;
    }

    // Check if verification has expired
    if (new Date() > new Date(pendingVerification.expires_at)) {
      await sendTelegramMessage(
        chatId,
        `Your verification session on the website has expired. Please refresh the page or request a new code on the website.`
      );
      return;
    }

    // 4. Validate Telegram account mapping (Ensure unique 1-to-1 linking)

    // Rule A: Check if this email is already linked to another Telegram account in users table
    const emailLinkedToUser = await queryOne(
      `
        SELECT id, telegram_id AS "telegramId"
        FROM users
        WHERE email = $1 AND telegram_id IS NOT NULL AND telegram_id <> $2
      `,
      [email, telegramId]
    );
    if (emailLinkedToUser) {
      await sendTelegramMessage(
        chatId,
        `This email is already registered and linked to a different Telegram account. For security, you cannot verify it with this account.`
      );
      return;
    }

    // Rule B: Check if this Telegram ID is already linked to another email in users table
    const telegramLinkedToUser = await queryOne(
      `
        SELECT id, email
        FROM users
        WHERE telegram_id = $1 AND email <> $2
      `,
      [telegramId, email]
    );
    if (telegramLinkedToUser) {
      await sendTelegramMessage(
        chatId,
        `This Telegram account is already linked to a different email address (<b>${telegramLinkedToUser.email}</b>). For security, you can only link one email per Telegram account.`
      );
      return;
    }

    // 5. Everything is valid! Generate a fresh 6-digit code
    const freshCode = String(crypto.randomInt(100000, 999999));

    // Update database session record: merge telegram info to payload, reset attempts
    if (pendingVerification.type === "register") {
      const mergedPayload = {
        ...(pendingVerification.payload || {}),
        telegram_id: telegramId,
        telegram_username: telegramUsername
      };

      await query(
        `
          UPDATE email_verifications
          SET code = $1,
              attempts = 0,
              payload = $2::jsonb,
              expires_at = NOW() + INTERVAL '10 minutes'
          WHERE email = $3
        `,
        [freshCode, JSON.stringify(mergedPayload), email]
      );
    } else {
      // type === 'login'
      const mergedPayload = {
        telegram_id: telegramId,
        telegram_username: telegramUsername
      };

      await query(
        `
          UPDATE email_verifications
          SET code = $1,
              attempts = 0,
              payload = $2::jsonb,
              expires_at = NOW() + INTERVAL '10 minutes'
          WHERE email = $3
        `,
        [freshCode, JSON.stringify(mergedPayload), email]
      );
    }

    // 6. Send the code with spoiler!
    const responseText =
      `Here is your 6-digit verification code:\n\n` +
      `<code><span class="tg-spoiler">${freshCode}</span></code>\n\n` +
      `Tap or hover over the code to reveal it. Enter this code on the website to complete verification.`;

    await sendTelegramMessage(chatId, responseText);

  } catch (error) {
    logger.error(error, "Error processing Telegram bot request");
    await sendTelegramMessage(chatId, `An error occurred while processing your request. Please try again later.`);
  }
}

export async function startTelegramBot() {
  if (!TELEGRAM_TOKEN) {
    logger.warn("TELEGRAM_BOT_TOKEN is not configured. Telegram bot verification will not start.");
    return;
  }

  logger.info("Starting Telegram Bot long-polling loop...");
  let offset = 0;

  while (true) {
    try {
      const response = await fetch(`${API_URL}/getUpdates?offset=${offset}&timeout=30`);
      const data = await response.json();
      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          await handleUpdate(update);
        }
      }
    } catch (err) {
      logger.error(err, "Telegram bot polling error");
      // Wait before retrying to prevent rapid loops on connection failure
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
