import { hasTrustedBrowserOrigin, sendJson, sendOptions } from "../../utils/http.js";
import { logger } from "../../utils/logger.js";
import { config } from "../../config.js";
import { handleLogin, handleLogout, handleRegister, handleVerify, handleResend, handleUpdateUserAvatar, handleCheckSession } from "../../application/use-cases/auth.js";
import {
  handleClientState,
  handleCreateGroupDialog,
  handleCreateDirectDialog,
  handleGetDialogMessages,
  handleMarkDialogRead,
  handleUserSearch
} from "../../application/use-cases/dialogs.js";
import {
  handleCreateSecureDirectDialog,
  handleGetSecureDialogBootstrap,
  handleGetUserKeyBundle,
  handlePublishOwnKeyBundle
} from "../../application/use-cases/e2e.js";
import {
  handleCreateMessage,
  handleDeleteMessage,
  handleGetMessageMedia
} from "../../application/use-cases/messages.js";
import { handleBootstrap, handleHealth } from "../../application/use-cases/system.js";

const dialogMessagesPattern = /^\/api\/v1\/dialogs\/by-public-id\/([^/]+)\/messages$/;
const dialogReadPattern = /^\/api\/v1\/dialogs\/by-public-id\/([^/]+)\/read$/;
const dialogSecureBootstrapPattern = /^\/api\/v1\/dialogs\/by-public-id\/([^/]+)\/secure-bootstrap$/;
const messageMediaPattern = /^\/api\/v1\/messages\/([^/]+)\/media$/;
const messageDeletePattern = /^\/api\/v1\/messages\/([^/]+)$/;
const userKeyBundlePattern = /^\/api\/v1\/e2e\/users\/([^/]+)\/key-bundle$/;
const publicMediaPattern = /^\/v\/([^/]+)$/;

const decodePublicMediaToken = (token) => {
  const normalized = String(token || "").trim().replace(/-/g, "+").replace(/_/g, "/");
  if (!normalized) {
    return "";
  }

  const remainder = normalized.length % 4;
  const padded = remainder ? normalized + "=".repeat(4 - remainder) : normalized;

  try {
    return Buffer.from(padded, "base64").toString("utf8");
  } catch {
    return "";
  }
};

export const createHttpRouter = (context) => async (request, response) => {
  if (!request.url) {
    sendJson(request, response, 400, { error: "Missing URL" });
    return;
  }

  if (request.method === "OPTIONS") {
    sendOptions(request, response);
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

  if (!["GET", "HEAD", "OPTIONS"].includes(request.method ?? "") && !hasTrustedBrowserOrigin(request)) {
    logger.warn({ origin: request.headers.origin, path: url.pathname }, "Rejected request from untrusted origin");
    sendJson(request, response, 403, { error: "Origin is not allowed." });
    return;
  }

  if (url.pathname.startsWith("/api/") && !context.ensureRateLimit(request, response, context.rateLimiters.general, "api")) {
    return;
  }

  if (url.pathname === "/health" && request.method === "GET") {
    await handleHealth(request, response);
    return;
  }

  if (url.pathname === "/api/v1/auth/register" && request.method === "POST") {
    await handleRegister(request, response, context);
    return;
  }

  if (url.pathname === "/api/v1/auth/login" && request.method === "POST") {
    await handleLogin(request, response, context);
    return;
  }

  if (url.pathname === "/api/v1/auth/logout" && request.method === "POST") {
    await handleLogout(request, response);
    return;
  }

  if (url.pathname === "/api/v1/auth/verify" && request.method === "POST") {
    await handleVerify(request, response, context);
    return;
  }

  if (url.pathname === "/api/v1/auth/resend" && request.method === "POST") {
    await handleResend(request, response, context);
    return;
  }

  if (url.pathname === "/api/v1/auth/check-session" && request.method === "GET") {
    await handleCheckSession(request, response, context);
    return;
  }

  if (url.pathname === "/api/v1/client-state" && request.method === "GET") {
    await handleClientState(request, response, context);
    return;
  }

  if (url.pathname === "/api/v1/users/search" && request.method === "GET") {
    await handleUserSearch(request, response, context);
    return;
  }

  if (url.pathname === "/api/v1/users/avatar" && request.method === "PUT") {
    await handleUpdateUserAvatar(request, response, context);
    return;
  }

  if (url.pathname === "/api/v1/dialogs/direct" && request.method === "POST") {
    await handleCreateDirectDialog(request, response, context);
    return;
  }

  if (url.pathname === "/api/v1/dialogs/group" && request.method === "POST") {
    await handleCreateGroupDialog(request, response, context);
    return;
  }

  if (url.pathname === "/api/v1/dialogs/direct/secure" && request.method === "POST") {
    await handleCreateSecureDirectDialog(request, response, context);
    return;
  }

  if (url.pathname === "/api/v1/e2e/key-bundle" && request.method === "POST") {
    await handlePublishOwnKeyBundle(request, response, context);
    return;
  }

  const dialogMessagesMatch = url.pathname.match(dialogMessagesPattern);
  const dialogReadMatch = url.pathname.match(dialogReadPattern);
  const dialogSecureBootstrapMatch = url.pathname.match(dialogSecureBootstrapPattern);
  const messageMediaMatch = url.pathname.match(messageMediaPattern);
  const messageDeleteMatch = url.pathname.match(messageDeletePattern);
  const userKeyBundleMatch = url.pathname.match(userKeyBundlePattern);
  const publicMediaMatch = url.pathname.match(publicMediaPattern);

  if (dialogReadMatch && request.method === "POST") {
    await handleMarkDialogRead(request, response, decodeURIComponent(dialogReadMatch[1]), context);
    return;
  }

  if (dialogMessagesMatch && request.method === "POST") {
    await handleCreateMessage(request, response, decodeURIComponent(dialogMessagesMatch[1]), context);
    return;
  }

  if (dialogMessagesMatch && request.method === "GET") {
    await handleGetDialogMessages(request, response, decodeURIComponent(dialogMessagesMatch[1]), context);
    return;
  }

  if (dialogSecureBootstrapMatch && request.method === "GET") {
    await handleGetSecureDialogBootstrap(request, response, decodeURIComponent(dialogSecureBootstrapMatch[1]), context);
    return;
  }

  if (messageMediaMatch && request.method === "GET") {
    await handleGetMessageMedia(request, response, decodeURIComponent(messageMediaMatch[1]), context);
    return;
  }

  if (publicMediaMatch && request.method === "GET") {
    const messageId = decodePublicMediaToken(decodeURIComponent(publicMediaMatch[1]));
    if (!messageId.startsWith("msg_")) {
      sendJson(request, response, 404, { error: "Not found" });
      return;
    }
    await handleGetMessageMedia(request, response, messageId, context);
    return;
  }

  if (userKeyBundleMatch && request.method === "GET") {
    await handleGetUserKeyBundle(request, response, decodeURIComponent(userKeyBundleMatch[1]), context);
    return;
  }

  if (messageDeleteMatch && request.method === "DELETE") {
    await handleDeleteMessage(request, response, decodeURIComponent(messageDeleteMatch[1]), context);
    return;
  }

  if (url.pathname === "/api/v1/gifs/search" && request.method === "GET") {
    const query = (url.searchParams.get("q") || "").trim();
    
    // Curated high-quality, fast-loading reaction GIFs as a robust fallback system.
    const CURATED_GIFS = [
      {
        id: "Ju7l5y9osyymQ",
        title: "Rick Astley Dance",
        tags: ["rick astley", "dance", "music", "rickroll", "troll", "funny"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/Ju7l5y9osyymQ/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/Ju7l5y9osyymQ/giphy.gif" },
          original: { url: "https://i.giphy.com/media/Ju7l5y9osyymQ/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/Ju7l5y9osyymQ/giphy.gif" }
        }
      },
      {
        id: "l3q2zVr6cu95AHIQ0",
        title: "Leonardo DiCaprio Gatsby Toast",
        tags: ["dicaprio", "gatsby", "toast", "champagne", "cheers", "success", "happy"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/l3q2zVr6cu95AHIQ0/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/l3q2zVr6cu95AHIQ0/giphy.gif" },
          original: { url: "https://i.giphy.com/media/l3q2zVr6cu95AHIQ0/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/l3q2zVr6cu95AHIQ0/giphy.gif" }
        }
      },
      {
        id: "l0MxekfMc1N2pUq3u",
        title: "Mind Blown Space",
        tags: ["mind blown", "shock", "wow", "science", "space", "amazed"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/l0MxekfMc1N2pUq3u/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/l0MxekfMc1N2pUq3u/giphy.gif" },
          original: { url: "https://i.giphy.com/media/l0MxekfMc1N2pUq3u/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/l0MxekfMc1N2pUq3u/giphy.gif" }
        }
      },
      {
        id: "JIX9t2j0ZTN9S",
        title: "Sleeping Cat",
        tags: ["cat", "sleep", "cute", "tired", "lazy"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" },
          original: { url: "https://i.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" }
        }
      },
      {
        id: "1108D2tVaUN3eo",
        title: "Cat Typing Keyboard",
        tags: ["cat", "keyboard", "work", "typing", "busy", "computer"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/1108D2tVaUN3eo/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/1108D2tVaUN3eo/giphy.gif" },
          original: { url: "https://i.giphy.com/media/1108D2tVaUN3eo/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/1108D2tVaUN3eo/giphy.gif" }
        }
      },
      {
        id: "XreQmk7ETC2TC",
        title: "Thumbs Up Cool",
        tags: ["thumbs up", "ok", "cool", "yes", "nice", "agree"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/XreQmk7ETC2TC/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/XreQmk7ETC2TC/giphy.gif" },
          original: { url: "https://i.giphy.com/media/XreQmk7ETC2TC/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/XreQmk7ETC2TC/giphy.gif" }
        }
      },
      {
        id: "3o72F8t9TjOWIKGMCY",
        title: "This Is Fine Dog",
        tags: ["this is fine", "dog", "fire", "house", "calm", "burning", "ok"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/3o72F8t9TjOWIKGMCY/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/3o72F8t9TjOWIKGMCY/giphy.gif" },
          original: { url: "https://i.giphy.com/media/3o72F8t9TjOWIKGMCY/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/3o72F8t9TjOWIKGMCY/giphy.gif" }
        }
      },
      {
        id: "HYT1M1YGPAmqQ",
        title: "Success Kid Baby",
        tags: ["baby", "success", "yes", "win", "fist", "celebration"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/HYT1M1YGPAmqQ/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/HYT1M1YGPAmqQ/giphy.gif" },
          original: { url: "https://i.giphy.com/media/HYT1M1YGPAmqQ/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/HYT1M1YGPAmqQ/giphy.gif" }
        }
      },
      {
        id: "14udF3WUj6HOUM",
        title: "Carlton Dance Fresh Prince",
        tags: ["carlton", "dance", "fresh prince", "happy", "celebration"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/14udF3WUj6HOUM/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/14udF3WUj6HOUM/giphy.gif" },
          original: { url: "https://i.giphy.com/media/14udF3WUj6HOUM/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/14udF3WUj6HOUM/giphy.gif" }
        }
      },
      {
        id: "hEc55r2KW8Bhu",
        title: "Confused Travolta Lost",
        tags: ["travolta", "confused", "pulp fiction", "where", "lost", "what"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/hEc55r2KW8Bhu/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/hEc55r2KW8Bhu/giphy.gif" },
          original: { url: "https://i.giphy.com/media/hEc55r2KW8Bhu/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/hEc55r2KW8Bhu/giphy.gif" }
        }
      },
      {
        id: "13cptIwW9C2362",
        title: "Eating Popcorn Drama",
        tags: ["popcorn", "eat", "watching", "drama", "movie", "excited"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/13cptIwW9C2362/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/13cptIwW9C2362/giphy.gif" },
          original: { url: "https://i.giphy.com/media/13cptIwW9C2362/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/13cptIwW9C2362/giphy.gif" }
        }
      },
      {
        id: "wMvESGxqy0rDi",
        title: "Facepalm Picard Star Trek",
        tags: ["facepalm", "star trek", "picard", "fail", "stupid", "upset"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/wMvESGxqy0rDi/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/wMvESGxqy0rDi/giphy.gif" },
          original: { url: "https://i.giphy.com/media/wMvESGxqy0rDi/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/wMvESGxqy0rDi/giphy.gif" }
        }
      },
      {
        id: "9Y5BbDSkSTiY8",
        title: "Crying Sad Tear",
        tags: ["crying", "sad", "tear", "weeping", "unhappy"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/9Y5BbDSkSTiY8/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/9Y5BbDSkSTiY8/giphy.gif" },
          original: { url: "https://i.giphy.com/media/9Y5BbDSkSTiY8/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/9Y5BbDSkSTiY8/giphy.gif" }
        }
      },
      {
        id: "p73emCHbw5Su4",
        title: "Shrug Whatever",
        tags: ["shrug", "whatever", "i don't know", "idk", "meh"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/p73emCHbw5Su4/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/p73emCHbw5Su4/giphy.gif" },
          original: { url: "https://i.giphy.com/media/p73emCHbw5Su4/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/p73emCHbw5Su4/giphy.gif" }
        }
      },
      {
        id: "3WCNY2RhcmnwZVKjND",
        title: "Yes Nod Agree",
        tags: ["yes", "agree", "nod", "correct", "absolutely"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/3WCNY2RhcmnwZVKjND/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/3WCNY2RhcmnwZVKjND/giphy.gif" },
          original: { url: "https://i.giphy.com/media/3WCNY2RhcmnwZVKjND/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/3WCNY2RhcmnwZVKjND/giphy.gif" }
        }
      },
      {
        id: "8PE8o01J18c6V6o151",
        title: "No Head Shake Disagree",
        tags: ["no", "disagree", "head shake", "refuse", "never"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/8PE8o01J18c6V6o151/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/8PE8o01J18c6V6o151/giphy.gif" },
          original: { url: "https://i.giphy.com/media/8PE8o01J18c6V6o151/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/8PE8o01J18c6V6o151/giphy.gif" }
        }
      },
      {
        id: "osjgQPWRx3cac",
        title: "Thank You Thanks Grateful",
        tags: ["thank you", "thanks", "grateful", "appreciate", "minion"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/osjgQPWRx3cac/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/osjgQPWRx3cac/giphy.gif" },
          original: { url: "https://i.giphy.com/media/osjgQPWRx3cac/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/osjgQPWRx3cac/giphy.gif" }
        }
      },
      {
        id: "10dU7AN7xsiSoM",
        title: "Cute Puppy Sleeping",
        tags: ["puppy", "cute", "dog", "sleepy", "eyes"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/10dU7AN7xsiSoM/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/10dU7AN7xsiSoM/giphy.gif" },
          original: { url: "https://i.giphy.com/media/10dU7AN7xsiSoM/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/10dU7AN7xsiSoM/giphy.gif" }
        }
      },
      {
        id: "12q4fIEE0Uf0EC",
        title: "Delicious Homer Simpson Food",
        tags: ["delicious", "drool", "tasty", "homer", "simpson", "food"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/12q4fIEE0Uf0EC/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/12q4fIEE0Uf0EC/giphy.gif" },
          original: { url: "https://i.giphy.com/media/12q4fIEE0Uf0EC/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/12q4fIEE0Uf0EC/giphy.gif" }
        }
      },
      {
        id: "t3sG5bW2rSkY8",
        title: "Laughing Lol Minion",
        tags: ["laugh", "laughing", "lol", "haha", "hilarious", "minion"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/t3sG5bW2rSkY8/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/t3sG5bW2rSkY8/giphy.gif" },
          original: { url: "https://i.giphy.com/media/t3sG5bW2rSkY8/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/t3sG5bW2rSkY8/giphy.gif" }
        }
      },
      {
        id: "5nZaUeDM21UeA",
        title: "Wink Sly Flirt",
        tags: ["wink", "flirt", "sly", "secret", "understood"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/5nZaUeDM21UeA/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/5nZaUeDM21UeA/giphy.gif" },
          original: { url: "https://i.giphy.com/media/5nZaUeDM21UeA/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/5nZaUeDM21UeA/giphy.gif" }
        }
      },
      {
        id: "3o7527pa7qs9kCG78A",
        title: "Shock Surprised Gasp",
        tags: ["shock", "gasp", "omg", "surprised", "jaw drop"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/3o7527pa7qs9kCG78A/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/3o7527pa7qs9kCG78A/giphy.gif" },
          original: { url: "https://i.giphy.com/media/3o7527pa7qs9kCG78A/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/3o7527pa7qs9kCG78A/giphy.gif" }
        }
      },
      {
        id: "4pt54A8mY9T5u",
        title: "Excited Jump Screaming",
        tags: ["excited", "jump", "scream", "happy", "yes", "win"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/4pt54A8mY9T5u/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/4pt54A8mY9T5u/giphy.gif" },
          original: { url: "https://i.giphy.com/media/4pt54A8mY9T5u/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/4pt54A8mY9T5u/giphy.gif" }
        }
      },
      {
        id: "l41YkxqW6a82gtI9q",
        title: "Love Hug Friend",
        tags: ["hug", "love", "friend", "support", "warm"],
        images: {
          fixed_height_downsampled: { url: "https://i.giphy.com/media/l41YkxqW6a82gtI9q/giphy.gif" },
          fixed_height: { url: "https://i.giphy.com/media/l41YkxqW6a82gtI9q/giphy.gif" },
          original: { url: "https://i.giphy.com/media/l41YkxqW6a82gtI9q/giphy.gif" },
          downsized: { url: "https://i.giphy.com/media/l41YkxqW6a82gtI9q/giphy.gif" }
        }
      }
    ];

    try {
      const gUrl = query
        ? "https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=" + encodeURIComponent(query) + "&limit=18"
        : "https://api.giphy.com/v1/gifs/trending?api_key=dc6zaTOxFJmzC&limit=18";
      const gRes = await fetch(gUrl);
      if (!gRes.ok) {
        throw new Error("Giphy API returned status: " + gRes.status);
      }
      const data = await gRes.json();
      
      // If Giphy returns blocked/banned/empty status
      if (data && data.meta && (data.meta.status >= 400 || data.meta.msg === "BANNED")) {
        throw new Error("Giphy API meta indicated banned status");
      }
      
      sendJson(request, response, 200, data);
    } catch (err) {
      logger.warn({ err, query }, "Giphy API failed or is banned. Using curated fallback collection.");
      
      let results = [];
      if (query) {
        const queryLower = query.toLowerCase();
        results = CURATED_GIFS.filter(gif => 
          gif.tags.some(tag => tag.includes(queryLower)) ||
          gif.title.toLowerCase().includes(queryLower)
        );
        // If query returned absolutely no matches, fallback to top 12 curated gifs
        if (results.length === 0) {
          results = CURATED_GIFS.slice(0, 12);
        }
      } else {
        // Empty query (trending) - return all 24 curated gifs
        results = CURATED_GIFS;
      }
      
      const payload = {
        data: results.map(gif => ({
          id: gif.id,
          title: gif.title,
          images: gif.images
        })),
        meta: {
          status: 200,
          msg: "OK"
        }
      };
      
      sendJson(request, response, 200, payload);
    }
    return;
  }

  if (url.pathname === "/api/v1/ai/chat" && request.method === "POST") {
    // Read the POST request body stream
    let body = "";
    try {
      body = await new Promise((resolve, reject) => {
        let chunkStr = "";
        request.on("data", (chunk) => {
          chunkStr += chunk;
        });
        request.on("end", () => {
          resolve(chunkStr);
        });
        request.on("error", (err) => {
          reject(err);
        });
      });
      
      const payload = JSON.parse(body || "{}");
      const model = typeof payload.model === "string" ? payload.model : "base";
      const userMessage = (payload.message || "").trim();
      const history = Array.isArray(payload.history) ? payload.history : [];
      const chatContext = typeof payload.chatContext === "string" ? payload.chatContext.trim() : "";
      const clientTime = typeof payload.clientTime === "string" ? payload.clientTime.trim() : "";
      const clientTimeZone = typeof payload.clientTimeZone === "string" ? payload.clientTimeZone.trim() : "";
      
      if (!userMessage) {
        sendJson(request, response, 400, { error: "Message is required" });
        return;
      }
      
      logger.info({ model, messageLength: userMessage.length }, "AI Chat request received");
      
      const serverUtcDate = new Date();
      const serverUtcStr = serverUtcDate.toUTCString();

      let systemPrompt = `You are TheGraphT Chat — the official advanced AI assistant of TheGraphT messenger. Respond helpfully, concisely and professionally.

CRITICAL LANGUAGE RULES:
1. Detect the language of the user's message. Respond in the EXACT SAME language.
2. If the user writes in Russian (e.g. "выжимку из чата", "привет", etc.), you MUST respond in Russian (на русском языке). NEVER respond in English to Russian prompts.
3. NEVER respond in Chinese (中文).

FORMATTING RULE FOR SUGGESTIONS / REPLY OPTIONS:
Whenever the user asks you to write options, variants, drafts, list of suggestions, or plans on how to reply to someone, or what to say next, ALWAYS append a dedicated block at the very end of your response formatted exactly like this:
[SUGGESTIONS]
- Option A text
- Option B text
- Option C text
[/SUGGESTIONS]
Make each option a complete, ready-to-send reply (no quotes around it, no bullet point labels, just the text itself). Do not repeat these options as a list in the main text bubble (briefly explain them in the main text bubble if needed, but keep the actual options inside the [SUGGESTIONS] block).`;
      
      if (clientTime) {
        systemPrompt += `\n\n[USER CURRENT TIME & TIMEZONE INFO]\n` +
                       `- User's Local Time: ${clientTime}\n` +
                       `- User's Time Zone: ${clientTimeZone}\n` +
                       `- Server UTC Time: ${serverUtcStr}\n` +
                       `Use this exact local time reference to answer date, year, time, or day of the week questions. If the user asks about the current time or day in their city (like Novosibirsk/НСК or anywhere else), rely directly on this reference. If they ask about other cities, calculate the offset from this reference or UTC time (e.g., Moscow is UTC+3, Novosibirsk is UTC+7).`;
      } else {
        const currentDateStr = serverUtcDate.toLocaleDateString("ru-RU", { 
          weekday: "long", 
          year: "numeric", 
          month: "long", 
          day: "numeric" 
        });
        systemPrompt += `\n\nToday's date: ${currentDateStr}. Current UTC Time: ${serverUtcStr}.`;
      }

      // If the client sent chat context, append it so the AI can analyze the conversation
      if (chatContext) {
        systemPrompt += `\n\n[CONTEXT: CURRENTLY OPEN CHAT WINDOW]\n` +
                       `Below is the text of the currently open chat window/dialog you are analyzing. The user expects you to read this, analyze it, summarize it, or draft reply suggestions based on it:\n` +
                       `---\n${chatContext}\n---\n` +
                       `Always use this context to answer questions about the active chat, who is speaking, what they discussed, or how to reply. NEVER ask the user to copy-paste or provide the chat text, because the chat text is ALREADY provided to you in the block above! Just analyze it and answer directly.
Note: Outgoing messages from the current user are labeled with "(Вы)", while incoming messages from other participants have their usernames or peer name.
REMINDER: Answer in the same language as the user's prompt (e.g. if the user asks in Russian, your entire reply must be in Russian!).`;
      }
      
      // --- GOOGLE GEMINI PRO SECURE BACKEND PROXY STREAMING ---
      if (model === "pro") {
        logger.info("Routing request to Google Gemini Pro model");
        const apiKey = config.geminiApiKey;
        if (!apiKey) {
          sendJson(request, response, 400, { error: "Gemini API Key is not configured on the server." });
          return;
        }

        try {
          const contents = [];
          
          let finalSystemText = systemPrompt;
          if (chatContext) {
            finalSystemText += "\n\n[CONTEXT: CURRENTLY OPEN CHAT WINDOW]\n" + chatContext;
          }
          
          // Add history
          history.forEach((h) => {
            contents.push({
              role: h.role === "assistant" ? "model" : "user",
              parts: [{ text: h.content }]
            });
          });

          // Add user message
          contents.push({
            role: "user",
            parts: [{ text: finalSystemText + "\n\nUser Prompt: " + userMessage }]
          });

          const geminiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=" + apiKey, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: contents,
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 384
              }
            })
          });

          if (!geminiRes.ok) {
            const errData = await geminiRes.json().catch(() => ({}));
            throw new Error(errData.error?.message || "Gemini API returned status: " + geminiRes.status);
          }

          response.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no"
          });

          const decoder = new TextDecoder("utf-8");
          let buffer = "";

          for await (const chunk of geminiRes.body) {
            buffer += decoder.decode(chunk, { stream: true });
            
            let startIdx = 0;
            while (true) {
              const openBrace = buffer.indexOf("{", startIdx);
              if (openBrace === -1) break;
              
              let braceCount = 0;
              let closeBrace = -1;
              for (let i = openBrace; i < buffer.length; i++) {
                if (buffer[i] === "{") braceCount++;
                else if (buffer[i] === "}") {
                  braceCount--;
                  if (braceCount === 0) {
                    closeBrace = i;
                    break;
                  }
                }
              }
              
              if (closeBrace === -1) break;
              
              const jsonStr = buffer.slice(openBrace, closeBrace + 1);
              startIdx = closeBrace + 1;
              
              try {
                const parsed = JSON.parse(jsonStr);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (text) {
                  response.write("data: " + JSON.stringify({ token: text }) + "\n\n");
                }
              } catch (_) {}
            }
            
            if (startIdx > 0) {
              buffer = buffer.slice(startIdx);
            }
          }

          response.write("data: [DONE]\n\n");
          response.end();
        } catch (geminiErr) {
          logger.error({ err: geminiErr }, "Gemini streaming error");
          response.write("data: " + JSON.stringify({ error: geminiErr.message }) + "\n\n");
          response.end();
        }
        return;
      }
      
      // Construct the messages payload for Ollama
      const ollamaMessages = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userMessage }
      ];
      
      // Call local Ollama container with STREAMING enabled and memory-locked speed optimizations
      const ollamaRes = await fetch("http://ollama-dev:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemma2:2b",
          messages: ollamaMessages,
          stream: true,
          keep_alive: -1, // Keep model loaded in memory indefinitely
          options: {
            temperature: 0.6,
            top_p: 0.9,
            num_predict: 384 // Ultra-fast response limit
          }
        })
      });
      
      if (!ollamaRes.ok) {
        throw new Error("Ollama returned status: " + ollamaRes.status);
      }

      // Stream SSE to the client
      response.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no"
      });

      // Read Ollama's NDJSON stream and forward each token as an SSE event
      const decoder = new TextDecoder("utf-8");
      let leftover = "";
      try {
        for await (const chunk of ollamaRes.body) {
          leftover += decoder.decode(chunk, { stream: true });
          const lines = leftover.split("\n");
          leftover = lines.pop(); // keep incomplete line for next chunk
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              const token = parsed.message?.content || "";
              if (token) {
                response.write("data: " + JSON.stringify({ token }) + "\n\n");
              }
              if (parsed.done) {
                response.write("data: [DONE]\n\n");
              }
            } catch (_e) {
              // skip malformed JSON lines
            }
          }
        }

        // Process any leftover data
        leftover += decoder.decode();
        if (leftover.trim()) {
          try {
            const parsed = JSON.parse(leftover);
            const token = parsed.message?.content || "";
            if (token) {
              response.write("data: " + JSON.stringify({ token }) + "\n\n");
            }
          } catch (_e) { /* skip */ }
        }
        response.write("data: [DONE]\n\n");
        response.end();
      } catch (streamErr) {
        logger.error({ err: streamErr }, "Ollama stream error");
        response.write("data: " + JSON.stringify({ error: "Stream interrupted" }) + "\n\n");
        response.end();
      }

    } catch (err) {
      logger.error({ err }, "Failed to communicate with TheGraphT Chat AI via Ollama");
      if (!response.headersSent) {
        sendJson(request, response, 500, { error: "AI is temporarily unavailable. Please try again later." });
      } else {
        response.write("data: " + JSON.stringify({ error: err.message }) + "\n\n");
        response.end();
      }
    }
    return;
  }

  if (url.pathname === "/api/v1/bootstrap" && request.method === "GET") {
    await handleBootstrap(request, response);
    return;
  }

  if (url.pathname === "/ws") {
    sendJson(request, response, 426, {
      error: "WebSocket upgrade endpoint is reserved for realtime delivery."
    });
    return;
  }

  sendJson(request, response, 404, { error: "Not found" });
};
