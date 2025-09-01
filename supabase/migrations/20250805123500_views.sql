CREATE OR REPLACE VIEW game_mode_totals AS
SELECT
  m.game_type,
  SUM(CASE WHEN t.type IN ('internal_credit','game_win') THEN t.amount ELSE 0 END)::bigint AS total_won_cents,
  SUM(CASE WHEN t.type = 'house_fee' THEN t.amount ELSE 0 END)::bigint AS total_fee_cents,
  COUNT(DISTINCT m.id) AS total_matches
FROM matches m
JOIN transactions t ON t.match_id = m.id AND t.status = 'complete'
GROUP BY m.game_type;