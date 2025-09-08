import { query } from './client'

const ddl = `
CREATE TABLE IF NOT EXISTS configurator_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  thumbnail_data_url TEXT NULL,
  state JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_configurator_states_created_at ON configurator_states (created_at DESC);
` as const

export async function initDb() {
    // Postgres extension for gen_random_uuid may not be enabled by default on some images
    await query('CREATE EXTENSION IF NOT EXISTS pgcrypto;').catch(() => { /* ignore */ })
    await query(ddl)
}


