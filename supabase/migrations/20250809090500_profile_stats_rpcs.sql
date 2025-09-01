-- RPCs expose the views with fixed shapes; search_path locked for safety.

CREATE OR REPLACE FUNCTION public.get_user_game_stats(uid uuid)
RETURNS SETOF public.user_game_stats
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT * FROM public.user_game_stats WHERE user_id = uid;
$$;

CREATE OR REPLACE FUNCTION public.get_user_game_history(uid uuid, p_limit int DEFAULT 50)
RETURNS SETOF public.user_game_history
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT * FROM public.user_game_history
  WHERE user_id = uid
  ORDER BY ended_at DESC
  LIMIT COALESCE(p_limit, 50);
$$;

CREATE OR REPLACE FUNCTION public.get_user_royale_placements(uid uuid)
RETURNS SETOF public.user_royale_placements
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT * FROM public.user_royale_placements WHERE user_id = uid;
$$;

-- lock down and grant
REVOKE ALL ON FUNCTION public.get_user_game_stats(uuid)          FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_game_history(uuid,int)     FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_royale_placements(uuid)    FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_user_game_stats(uuid)        TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_game_history(uuid,int)  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_royale_placements(uuid) TO anon, authenticated;

