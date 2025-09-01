CREATE TABLE matches (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type   game_type NOT NULL,
  status      match_status NOT NULL DEFAULT 'pending',
  fee_percent numeric(5,4) NOT NULL DEFAULT 0.10,
  metadata    jsonb,
  created_at  timestamptz DEFAULT now(),
  started_at  timestamptz,
  ended_at    timestamptz
);
CREATE INDEX idx_matches_type ON matches (game_type);

CREATE TABLE match_participants (
  match_id       uuid REFERENCES matches(id) ON DELETE CASCADE,
  user_id        uuid REFERENCES users(id)   ON DELETE CASCADE,
  role           text,
  final_position integer,
  eliminated_at  timestamptz,
  PRIMARY KEY (match_id, user_id)
);
CREATE INDEX idx_part_user ON match_participants (user_id);