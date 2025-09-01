/* ----------------------------------------------------------
   1. Re-create game_mode_totals as SECURITY INVOKER
   ---------------------------------------------------------- */
DROP VIEW IF EXISTS public.game_mode_totals;

CREATE VIEW public.game_mode_totals
WITH (security_invoker = true)          -- <- the magic flag
AS
SELECT
  m.game_type,
  SUM(
    CASE WHEN t.type IN ('internal_credit','game_win')
         THEN t.amount ELSE 0 END
  )::bigint AS total_won_cents,
  SUM(
    CASE WHEN t.type = 'house_fee'
         THEN t.amount ELSE 0 END
  )::bigint AS total_fee_cents,
  COUNT(DISTINCT m.id)                  AS total_matches
FROM public.matches        m
JOIN public.transactions   t
  ON t.match_id = m.id
WHERE t.status = 'complete'
GROUP BY m.game_type;


/* ----------------------------------------------------------
   2. Enable RLS on the remaining tables
   ---------------------------------------------------------- */
ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speedchess_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royale_state     ENABLE ROW LEVEL SECURITY;

/* ----------------------------------------------------------
   3. Basic SELECT policies
      - owners can read their own rows
      - admins (roles[] contains 'admin') can read everything
   ---------------------------------------------------------- */

/* users table — return only the caller’s row unless admin */
CREATE POLICY sel_user_self_or_admin
ON public.users FOR SELECT
USING (
  id = auth.uid()
  OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND 'admin' = ANY (u.roles)
  )
);

/* speedchess_games — visible to participants or admin */
CREATE POLICY sel_speedchess_participant_or_admin
ON public.speedchess_games FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.match_participants p
    WHERE p.match_id = speedchess_games.match_id
      AND p.user_id  = auth.uid()
  )
  OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND 'admin' = ANY (u.roles)
  )
);

/* royale_state — same rule */
CREATE POLICY sel_royale_participant_or_admin
ON public.royale_state FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.match_participants p
    WHERE p.match_id = royale_state.match_id
      AND p.user_id  = auth.uid()
  )
  OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND 'admin' = ANY (u.roles)
  )
);