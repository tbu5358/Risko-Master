// @ts-ignore
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.152.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

type Row = {
  id: string;
  type: string;
  amount: number;
  created_at: string;
  matches: { game_type: string } | null;
  users: { username: string } | null;
};

export const recentGameResults = serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const { data, error } = await sb
      .from('transactions')
      .select('id, type, amount, created_at, users:users(username), matches:matches(game_type)')
      .in('type', ['game_win', 'game_loss'])
      .eq('status', 'complete')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;

    return new Response(JSON.stringify({ rows: data as Row[] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('recent-game-results error:', err);
    return new Response(String((err as Error)?.message ?? err), { status: 400, headers: corsHeaders });
  }
});

