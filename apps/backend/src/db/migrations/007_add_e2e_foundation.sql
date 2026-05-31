ALTER TABLE users
  ADD COLUMN IF NOT EXISTS e2e_public_key TEXT,
  ADD COLUMN IF NOT EXISTS e2e_key_algorithm TEXT,
  ADD COLUMN IF NOT EXISTS e2e_key_uploaded_at TIMESTAMPTZ;

ALTER TABLE dialogs
  ADD COLUMN IF NOT EXISTS encryption_mode TEXT NOT NULL DEFAULT 'plaintext',
  ADD COLUMN IF NOT EXISTS encryption_version INTEGER;

ALTER TABLE memberships
  ADD COLUMN IF NOT EXISTS secure_key_envelope TEXT,
  ADD COLUMN IF NOT EXISTS secure_key_algorithm TEXT;

ALTER TABLE messages
  ALTER COLUMN body DROP NOT NULL;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS ciphertext TEXT,
  ADD COLUMN IF NOT EXISTS nonce TEXT,
  ADD COLUMN IF NOT EXISTS envelope_version INTEGER,
  ADD COLUMN IF NOT EXISTS sender_key_id TEXT;

CREATE INDEX IF NOT EXISTS dialogs_encryption_mode_idx
  ON dialogs (encryption_mode, created_at DESC);

CREATE INDEX IF NOT EXISTS users_e2e_key_uploaded_at_idx
  ON users (e2e_key_uploaded_at DESC)
  WHERE e2e_public_key IS NOT NULL;
