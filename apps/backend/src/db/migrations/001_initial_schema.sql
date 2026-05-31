CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dialogs (
  id TEXT PRIMARY KEY,
  public_id TEXT UNIQUE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groups (
  dialog_id TEXT PRIMARY KEY REFERENCES dialogs(id) ON DELETE CASCADE,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS channels (
  dialog_id TEXT PRIMARY KEY REFERENCES dialogs(id) ON DELETE CASCADE,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  dialog_id TEXT NOT NULL REFERENCES dialogs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  UNIQUE (dialog_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  dialog_id TEXT NOT NULL REFERENCES dialogs(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  attachment_path TEXT,
  attachment_mime TEXT,
  attachment_name TEXT,
  attachment_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
ALTER TABLE dialogs ADD COLUMN IF NOT EXISTS public_id TEXT;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'text';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_path TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_mime TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_name TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_size INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS dialogs_public_id_unique_idx
  ON dialogs (public_id)
  WHERE public_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS memberships_user_dialog_idx
  ON memberships (user_id, dialog_id);

CREATE INDEX IF NOT EXISTS memberships_dialog_user_idx
  ON memberships (dialog_id, user_id);

CREATE INDEX IF NOT EXISTS messages_dialog_created_idx
  ON messages (dialog_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS sessions_user_idx
  ON sessions (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS sessions_token_idx
  ON sessions (token);
