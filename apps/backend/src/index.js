import http from "node:http";

import { getUserFromRequest } from "./services/auth.js";
import { getDialogByIdForUser, getRelatedUserIdsForUser, getUserIdsForDialog } from "./services/dialogs.js";
import { createMessageForDialog } from "./services/messages.js";
import { touchUserLastSeen } from "./services/users.js";
import { logger } from "./utils/logger.js";
import { sendJson } from "./utils/http.js";
import { createRealtimeHub } from "./realtime/index.js";
import {
  ensureRateLimit,
  markDirectDialogRead,
  parseWithSchema,
  rateLimiters,
  withAuthorizedUser
} from "./application/context.js";
import { createHttpRouter } from "./transport/http/router.js";
import { initializeBackend } from "./startup/bootstrap.js";
import { config } from "./config.js";

const realtimeHub = createRealtimeHub({
  createMessageForDialog,
  getDialogByIdForUser,
  getUserFromRequest,
  getUserIdsForDialog,
  getRelatedUserIdsForUser,
  touchUserLastSeen
});

const applicationContext = {
  ensureRateLimit,
  markDirectDialogRead,
  parseWithSchema,
  rateLimiters,
  realtimeHub,
  withAuthorizedUser
};

const requestHandler = createHttpRouter(applicationContext);

const server = http.createServer(async (request, response) => {
  try {
    await requestHandler(request, response);
  } catch (error) {
    logger.error({ error }, "Unexpected backend request error");
    sendJson(request, response, 500, { error: "Internal server error." });
  }
});

server.on("upgrade", (request, socket, head) => {
  void realtimeHub.handleUpgrade(request, socket, head);
});

initializeBackend()
  .then(() => {
    server.listen(config.port, config.host, () => {
      logger.info({ host: config.host, port: config.port }, "TheGraphT backend listening");
      
      // Async preload model on boot so the first user query has 0 cold-start latency!
      logger.info("Preloading Ollama Gemma2 2B model into memory...");
      fetch("http://ollama-dev:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemma2:2b",
          messages: [],
          keep_alive: -1
        })
      })
      .then((res) => {
        if (res.ok) {
          logger.info("Ollama model preloaded successfully and locked in memory!");
        } else {
          logger.warn("Ollama model preload returned status: " + res.status);
        }
      })
      .catch((err) => {
        logger.error({ err }, "Ollama model preload failed. Will load dynamically on first request.");
      });
    });
  })
  .catch((error) => {
    logger.fatal({ error }, "Failed to initialize TheGraphT backend");
    process.exit(1);
  });
