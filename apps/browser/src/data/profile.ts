import { supabase } from '@/integrations/supabase/client';

export type GameStat = {
  user_id: string;
  game_type: 'speedchess' | 'lastman' | 'snakeroyale';
  games_played: number;
  wins: number;
  losses: number;
  winrate_pct: number;
  pnl: number; // dollars
};

export type GameHistory = {
  match_id: string;
  user_id: string;
  game_type: 'speedchess' | 'lastman' | 'snakeroyale';
  ended_at: string | null;
  final_position: number | null;
  entry: number;   // dollars
  payout: number;  // dollars
};

export type RoyalePlacement = {
  user_id: string;
  game_type: 'lastman' | 'snakeroyale';
  final_position: number;
  times: number;
};

export async function fetchUserGameStats(userId: string) {
  const { data, error } = await supabase.rpc('get_user_game_stats', { uid: userId });
  if (error) {
    const msg = String(error.message || '').toLowerCase();
    if (msg.includes('not found') || msg.includes('does not exist') || msg.includes('rpc')) return [] as GameStat[];
    return [] as GameStat[];
  }
  return (data ?? []) as GameStat[];
}

export async function fetchUserGameHistory(userId: string, limit = 50) {
  const { data, error } = await supabase.rpc('get_user_game_history', { uid: userId, p_limit: limit });
  if (error) {
    const msg = String(error.message || '').toLowerCase();
    if (msg.includes('not found') || msg.includes('does not exist') || msg.includes('rpc')) return [] as GameHistory[];
    return [] as GameHistory[];
  }
  return (data ?? []) as GameHistory[];
}

export async function fetchUserRoyalePlacements(userId: string) {
  const { data, error } = await supabase.rpc('get_user_royale_placements', { uid: userId });
  if (error) {
    const msg = String(error.message || '').toLowerCase();
    if (msg.includes('not found') || msg.includes('does not exist') || msg.includes('rpc')) return [] as RoyalePlacement[];
    return [] as RoyalePlacement[];
  }
  return (data ?? []) as RoyalePlacement[];
}

