import { runMigrations } from "./migrations.js";
import { logger } from "../utils/logger.js";

runMigrations()
  .then(() => {
    logger.info("Database migrations completed");
    process.exit(0);
  })
  .catch((error) => {
    logger.fatal({ error }, "Database migrations failed");
    process.exit(1);
  });
