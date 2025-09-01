-- Create a secure view for the leaderboard
CREATE OR REPLACE VIEW public.leaderboard_view
WITH (security_invoker = true) AS
WITH user_stats AS (
  SELECT 
    p.user_id,
    COUNT(CASE WHEN p.final_position = 1 THEN 1 END) as wins,
    COUNT(CASE WHEN p.final_position > 1 THEN 1 END) as losses,
    COALESCE(SUM(
      CASE 
        WHEN t.type IN ('internal_credit', 'game_win') THEN t.amount
        WHEN t.type = 'internal_debit' THEN -t.amount
        ELSE 0 
      END
    ), 0) / 100.0 as total_pnl
  FROM public.match_participants p
  JOIN public.matches m ON m.id = p.match_id AND m.status = 'finished'
  LEFT JOIN public.transactions t 
    ON t.match_id = m.id 
    AND t.user_id = p.user_id 
    AND t.status = 'complete'
  GROUP BY p.user_id
)
SELECT 
  u.username,
  s.total_pnl,
  s.wins,
  s.losses,
  CASE 
    WHEN (s.wins + s.losses) = 0 THEN 0
    ELSE ROUND((s.wins::numeric / NULLIF(s.wins + s.losses, 0)) * 100, 2)
  END as win_rate
FROM user_stats s
JOIN public.users u ON u.id = s.user_id
WHERE s.total_pnl != 0  -- Only show users who have played
ORDER BY s.total_pnl DESC
LIMIT 10;

-- Create a secure RPC to fetch leaderboard data
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS SETOF public.leaderboard_view
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT * FROM public.leaderboard_view;
$$;

-- Grant access to the RPC for all users
REVOKE ALL ON FUNCTION public.get_leaderboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO anon, authenticated;

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_match_participants_position 
ON public.match_participants (user_id, final_position);