CREATE TABLE IF NOT EXISTS email_verifications (
  email TEXT PRIMARY KEY,
  code VARCHAR(6) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'login' or 'register'
  payload JSONB,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS email_verifications_expires_idx ON email_verifications (expires_at);
