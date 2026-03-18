CREATE TABLE collection_recipes (
  collection_id   uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  recipe_id       uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  position        int NOT NULL DEFAULT 0,
  added_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, recipe_id)
);

CREATE INDEX collection_recipes_collection_id_idx ON collection_recipes(collection_id);
