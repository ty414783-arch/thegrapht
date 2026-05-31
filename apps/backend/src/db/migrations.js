import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { query, queryMany, withTransaction } from "./client.js";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDirectory = path.join(__dirname, "migrations");

const ensureMigrationsTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

export const runMigrations = async () => {
  await ensureMigrationsTable();

  const entries = fs.existsSync(migrationsDirectory)
    ? fs.readdirSync(migrationsDirectory, { withFileTypes: true })
    : [];
  const migrationFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  const appliedRows = await queryMany(`
    SELECT id
    FROM schema_migrations
    ORDER BY id ASC
  `);
  const appliedIds = new Set(appliedRows.map((row) => row.id));

  for (const migrationId of migrationFiles) {
    if (appliedIds.has(migrationId)) {
      continue;
    }

    const migrationSql = fs.readFileSync(path.join(migrationsDirectory, migrationId), "utf8");

    await withTransaction(async (client) => {
      await client.query(migrationSql);
      await client.query(
        `
          INSERT INTO schema_migrations (id)
          VALUES ($1)
        `,
        [migrationId]
      );
    });

    logger.info({ migrationId }, "Applied database migration");
  }
};
