-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE recipe_phase AS ENUM ('phase1', 'phase2', 'manual');
CREATE TYPE extraction_status AS ENUM ('pending', 'done', 'failed');
CREATE TYPE source_type AS ENUM ('youtube', 'instagram');

CREATE TABLE recipes (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title               text NOT NULL,
  source_url          text NOT NULL,
  source_type         source_type NOT NULL,
  creator_name        text,
  thumbnail_url       text,
  cook_time_minutes   int,
  phase               recipe_phase NOT NULL DEFAULT 'phase1',
  extraction_status   extraction_status NOT NULL DEFAULT 'pending',
  ingredients         jsonb NOT NULL DEFAULT '[]',
  steps               jsonb NOT NULL DEFAULT '[]',
  tags                text[] NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX recipes_user_id_idx ON recipes(user_id);
CREATE INDEX recipes_source_url_idx ON recipes(source_url);
