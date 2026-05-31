import { query, withTransaction } from "./client.js";
import { config } from "../config.js";
import { hashPassword } from "../services/auth.js";
import { ensurePublicIds, ensureSavedMessagesDialogForUser, seedUserWorkspace } from "../services/dialogs.js";
import { getAllUsers } from "../services/users.js";

const seedSystemUser = async () => {
  const passwordHash = hashPassword(`system-account-disabled:${config.systemUserId}`);

  await query(
    `
      INSERT INTO users (id, name, username, email, password_hash, is_system)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      ON CONFLICT (id) DO UPDATE
      SET
        name = EXCLUDED.name,
        username = EXCLUDED.username,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        is_system = TRUE
    `,
    [config.systemUserId, "TheGraphT", "thegrapht_system", "system@thegrapht.local", passwordHash]
  );

  await query(
    `
      DELETE FROM sessions
      WHERE user_id = $1
    `,
    [config.systemUserId]
  );
};

export const seedDatabase = async () => {
  await seedSystemUser();
  await ensurePublicIds();

  const users = await getAllUsers();

  for (const user of users) {
    await withTransaction(async (client) => {
      await seedUserWorkspace(user, client);
      await ensureSavedMessagesDialogForUser(user, client);
    });
  }
};
