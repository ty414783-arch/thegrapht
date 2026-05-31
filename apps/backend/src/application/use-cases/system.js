import { config } from "../../config.js";
import { checkTcp } from "../../utils/network.js";
import { sendJson } from "../../utils/http.js";

export const handleHealth = async (request, response) => {
  const postgresOk = await checkTcp(config.postgresHost, config.postgresPort);
  const redisOk = config.enableInfraChecks ? await checkTcp(config.redisHost, config.redisPort) : null;

  sendJson(request, response, 200, {
    service: "backend",
    status: postgresOk && (config.enableInfraChecks ? redisOk : true) ? "ok" : "degraded",
    checks: {
      postgres: postgresOk,
      redis: redisOk,
      infraChecksEnabled: config.enableInfraChecks
    }
  });
};

export const handleBootstrap = async (request, response) => {
  sendJson(request, response, 200, {
    app: "TheGraphT",
    capabilities: {
      auth: true,
      sessions: true,
      dialogs: true,
      publicDialogLinks: true,
      savedMessages: true,
      groups: true,
      channels: true,
      privateChats: true,
      secretChats: true,
      secureDirectChats: config.secureDirectChatsEnabled,
      messages: true,
      mtproto: "session-frame-v1",
      mtprotoProductionReady: false
    }
  });
};
