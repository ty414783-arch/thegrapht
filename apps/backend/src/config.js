import path from "node:path";

const parseOrigins = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const config = {
  host: process.env.HOST ?? "0.0.0.0",
  port: Number(process.env.PORT ?? 3000),
  postgresHost: process.env.POSTGRES_HOST ?? "127.0.0.1",
  postgresPort: Number(process.env.POSTGRES_PORT ?? 5432),
  postgresDatabase: process.env.POSTGRES_DB ?? "thegrapht",
  postgresUser: process.env.POSTGRES_USER ?? "thegrapht",
  postgresPassword: process.env.POSTGRES_PASSWORD ?? "",
  postgresSslMode: process.env.POSTGRES_SSLMODE ?? "disable",
  redisHost: process.env.REDIS_HOST ?? "redis",
  redisPort: Number(process.env.REDIS_PORT ?? 6379),
  enableInfraChecks: process.env.ENABLE_INFRA_CHECKS === "true",
  savedMessagesPublicId: "-1002003143",
  maxJsonBodyBytes: 1024 * 1024,
  jwtSecret: process.env.JWT_SECRET ?? "",
  passwordPepper: process.env.PASSWORD_PEPPER ?? "",
  jwtIssuer: "thegrapht",
  jwtAudience: "thegrapht-web",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "30d",
  runMigrationsOnBoot: process.env.RUN_MIGRATIONS_ON_BOOT === "true",
  seedDatabaseOnBoot: process.env.SEED_DATABASE_ON_BOOT === "true",
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "thegrapht_session",
  sessionCookieDomain: String(process.env.SESSION_COOKIE_DOMAIN ?? "").trim(),
  authWindowMs: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS ?? 15 * 60 * 1000),
  authMaxRequests: Number(process.env.RATE_LIMIT_AUTH_MAX ?? 5),
  messageWindowMs: Number(process.env.RATE_LIMIT_MESSAGE_WINDOW_MS ?? 60 * 1000),
  messageMaxRequests: Number(process.env.RATE_LIMIT_MESSAGE_MAX ?? 25),
  maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES ?? 10 * 1024 * 1024),
  searchWindowMs: Number(process.env.RATE_LIMIT_SEARCH_WINDOW_MS ?? 60 * 1000),
  searchMaxRequests: Number(process.env.RATE_LIMIT_SEARCH_MAX ?? 20),
  minUserSearchQueryLength: Number(process.env.MIN_USER_SEARCH_QUERY_LENGTH ?? 3),
  dialogListLimit: Number(process.env.DIALOG_LIST_LIMIT ?? 200),
  generalWindowMs: Number(process.env.RATE_LIMIT_GENERAL_WINDOW_MS ?? 60 * 1000),
  generalMaxRequests: Number(process.env.RATE_LIMIT_GENERAL_MAX ?? 180),
  secureDirectChatsEnabled: process.env.SECURE_DIRECT_CHATS_ENABLED === "true",
  logLevel: process.env.LOG_LEVEL ?? "info",
  logFile: process.env.LOG_FILE ?? "/app/logs/backend.log",
  uploadsDir: process.env.UPLOADS_DIR ?? path.resolve(process.cwd(), "uploads"),
  corsAllowedOrigins: [
    ...parseOrigins(process.env.CORS_ALLOWED_ORIGINS),
    "https://web.thegrapht.su",
    "https://thegrapht.su"
  ],
  systemUserId: "u_admin",
  smtpHost: process.env.SMTP_HOST ?? "localhost",
  smtpPort: Number(process.env.SMTP_PORT ?? 25),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  smtpFrom: process.env.SMTP_FROM ?? "noreply@thegrapht.su",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? ""
};
