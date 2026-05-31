import { config } from "../config.js";
import { runMigrations } from "../db/migrations.js";
import { seedDatabase } from "../db/seed.js";
import { ensureUploadsDirectory } from "../services/media.js";
import { startTelegramBot } from "../services/telegram.js";

export const initializeBackend = async () => {
  if (!config.postgresPassword) {
    throw new Error("POSTGRES_PASSWORD is required.");
  }

  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be set to a strong random value.");
  }

  if (config.runMigrationsOnBoot) {
    await runMigrations();
  }

  await ensureUploadsDirectory();

  if (config.seedDatabaseOnBoot) {
    await seedDatabase();
  }

  // Start Telegram verification bot asynchronously in the background
  void startTelegramBot();
};
