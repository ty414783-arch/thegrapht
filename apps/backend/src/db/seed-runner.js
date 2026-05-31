import { seedDatabase } from "./seed.js";
import { logger } from "../utils/logger.js";

seedDatabase()
  .then(() => {
    logger.info("Database seed completed");
    process.exit(0);
  })
  .catch((error) => {
    logger.fatal({ error }, "Database seed failed");
    process.exit(1);
  });
