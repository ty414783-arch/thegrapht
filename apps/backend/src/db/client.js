import { Pool } from "pg";

import { config } from "../config.js";

const resolveSsl = (sslMode) => {
  if (!sslMode || sslMode === "disable") {
    return false;
  }

  return {
    rejectUnauthorized: false
  };
};

export const pool = new Pool({
  host: config.postgresHost,
  port: config.postgresPort,
  database: config.postgresDatabase,
  user: config.postgresUser,
  password: config.postgresPassword,
  ssl: resolveSsl(config.postgresSslMode)
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
});

const resolveExecutor = (executor) => executor ?? pool;

export const query = (text, params = [], executor) => resolveExecutor(executor).query(text, params);

export const queryMany = async (text, params = [], executor) => {
  const result = await query(text, params, executor);
  return result.rows;
};

export const queryOne = async (text, params = [], executor) => {
  const rows = await queryMany(text, params, executor);
  return rows[0] ?? null;
};

export const withTransaction = async (handler) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await handler(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
