CREATE TABLE speedchess_games (
  match_id       uuid PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
  time_control   integer NOT NULL,
  increment      integer NOT NULL,
  winner_user_id uuid,
  result         text,
  moves_log      text
);