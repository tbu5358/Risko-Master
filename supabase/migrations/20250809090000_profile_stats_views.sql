-- Views powering profile stats & history. Use security_invoker so caller RLS applies.
CREATE OR REPLACE VIEW public.user_game_history
WITH (security_invoker = true) AS
SELECT
  m.id            AS match_id,
  p.user_id,
  m.game_type,
  m.ended_at      AS ended_at,
  p.final_position,
  COALESCE(SUM(CASE WHEN t.type = 'internal_debit' THEN t.amount END), 0)   / 100.0 AS entry,
  COALESCE(SUM(CASE WHEN t.type IN ('internal_credit','game_win') THEN t.amount END), 0) / 100.0 AS payout
FROM public.match_participants p
JOIN public.matches m
  ON m.id = p.match_id AND m.status = 'finished'
LEFT JOIN public.transactions t
  ON t.match_id = m.id AND t.user_id = p.user_id AND t.status = 'complete'
GROUP BY m.id, p.user_id, m.game_type, m.ended_at, p.final_position
ORDER BY m.ended_at DESC;

CREATE OR REPLACE VIEW public.user_game_stats
WITH (security_invoker = true) AS
WITH base AS (
  SELECT
    p.user_id,
    m.game_type,
    p.final_position,
    COALESCE(SUM(CASE WHEN t.type = 'internal_debit' THEN t.amount END), 0)   AS entry_cents,
    COALESCE(SUM(CASE WHEN t.type IN ('internal_credit','game_win') THEN t.amount END), 0) AS payout_cents
  FROM public.match_participants p
  JOIN public.matches m
    ON m.id = p.match_id AND m.status = 'finished'
  LEFT JOIN public.transactions t
    ON t.match_id = m.id AND t.user_id = p.user_id AND t.status = 'complete'
  GROUP BY p.user_id, m.game_type, p.final_position
),
agg AS (
  SELECT
    user_id,
    game_type,
    COUNT(*)                                             AS games_played,
    SUM((final_position = 1)::int)                       AS wins,
    SUM((final_position <> 1)::int)                      AS losses,
    SUM(payout_cents - entry_cents)                      AS pnl_cents
  FROM base
  GROUP BY user_id, game_type
)
SELECT
  user_id,
  game_type,
  games_played,
  wins,
  losses,
  CASE WHEN games_played > 0
       THEN ROUND((wins::numeric / games_played) * 100, 2)
       ELSE 0 END                                        AS winrate_pct,
  pnl_cents / 100.0                                      AS pnl
FROM agg
ORDER BY user_id, game_type;

CREATE OR REPLACE VIEW public.user_royale_placements
WITH (security_invoker = true) AS
SELECT
  p.user_id,
  m.game_type,
  p.final_position,
  COUNT(*) AS times
FROM public.match_participants p
JOIN public.matches m
  ON m.id = p.match_id AND m.status = 'finished'
WHERE m.game_type IN ('lastman', 'snakeroyale')
GROUP BY p.user_id, m.game_type, p.final_position
ORDER BY p.user_id, m.game_type, p.final_position;

-- Helpful indexes for the views’ underlying queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_tx_status_user_match ON public.transactions (status, user_id, match_id);
CREATE INDEX IF NOT EXISTS idx_mp_user_match        ON public.match_participants (user_id, match_id);
CREATE INDEX IF NOT EXISTS idx_matches_status_end   ON public.matches (status, ended_at DESC);

