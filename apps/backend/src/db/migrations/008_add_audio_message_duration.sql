ALTER TABLE messages
ADD COLUMN IF NOT EXISTS attachment_duration_seconds INTEGER;
