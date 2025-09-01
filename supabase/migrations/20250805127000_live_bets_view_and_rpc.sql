-- Live bets feed view and RPC (definer) for safe anon access

-- View
CREATE OR REPLACE VIEW public.live_bets_feed
WITH (security_invoker = true) AS
WITH tx AS (
  SELECT
    t.match_id,
    t.user_id,
    SUM(CASE WHEN t.type = 'internal_debit' THEN t.amount ELSE 0 END) AS entry_fee_cents,
    SUM(CASE WHEN t.type IN ('internal_credit','game_win') THEN t.amount ELSE 0 END) AS payout_cents,
    MAX(t.created_at) AS last_tx_at
  FROM public.transactions t
  WHERE t.status = 'complete'
  GROUP BY t.match_id, t.user_id
)
SELECT
  m.game_type                            AS game,
  u.username                             AS username,
  COALESCE(m.ended_at, tx.last_tx_at)    AS time,
  (tx.entry_fee_cents / 100.0)           AS entry_fee,
  CASE WHEN tx.entry_fee_cents > 0
       THEN (tx.payout_cents::numeric / NULLIF(tx.entry_fee_cents,0))
       ELSE NULL END                      AS multiplier,
  (tx.payout_cents / 100.0)              AS payout,
  m.id                                    AS match_id,
  u.id                                    AS user_id
FROM tx
JOIN public.matches m ON m.id = tx.match_id AND m.status = 'finished'
JOIN public.users   u ON u.id = tx.user_id
JOIN public.match_participants p ON p.match_id = m.id AND p.user_id = u.id
WHERE (tx.entry_fee_cents > 0 OR tx.payout_cents > 0)
ORDER BY COALESCE(m.ended_at, tx.last_tx_at) DESC;

-- RPC wrapper
CREATE OR REPLACE FUNCTION public.get_live_bets_feed(p_limit int DEFAULT 30)
RETURNS SETOF public.live_bets_feed
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT * FROM public.live_bets_feed LIMIT COALESCE(p_limit,30);
$$;

-- Only allow reading the RPC, not the base tables
REVOKE ALL ON FUNCTION public.get_live_bets_feed(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_live_bets_feed(int) TO anon, authenticated;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_tx_status_created ON public.transactions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tx_match_user     ON public.transactions(match_id, user_id);

