ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS album_id TEXT;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS album_index INTEGER;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS album_size INTEGER;

CREATE INDEX IF NOT EXISTS messages_album_id_idx
  ON messages (album_id, created_at, id);
