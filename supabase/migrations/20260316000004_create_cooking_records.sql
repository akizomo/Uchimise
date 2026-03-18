CREATE TABLE cooking_records (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id   uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  cooked_at   timestamptz NOT NULL DEFAULT now(),
  note        text
);

CREATE INDEX cooking_records_user_id_idx ON cooking_records(user_id);
