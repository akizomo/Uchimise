CREATE TYPE meal_slot AS ENUM ('breakfast', 'lunch', 'dinner');

CREATE TABLE meal_plans (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id     uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  planned_date  date NOT NULL,
  meal_slot     meal_slot NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, planned_date, meal_slot)
);

CREATE INDEX meal_plans_user_id_date_idx ON meal_plans(user_id, planned_date);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal_plans"
  ON meal_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal_plans"
  ON meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal_plans"
  ON meal_plans FOR DELETE
  USING (auth.uid() = user_id);
