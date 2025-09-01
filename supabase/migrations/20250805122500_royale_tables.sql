CREATE TABLE royale_state (
  match_id       uuid PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
  map_seed       text,
  active_players integer,
  top_scores     jsonb,
  raw_state      jsonb
);