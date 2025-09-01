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

type RequestBody = {
  username?: string;
};

export const userByUsernameGet = serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const body: RequestBody = await req.json().catch(() => ({}));
    const username = (body.username || "").trim();
    if (!username) {
      return new Response("Missing username", { status: 400 });
    }

    const { data, error } = await sb
      .from('users')
      .select('id, username, created_at')
      .ilike('username', username)
      .maybeSingle();

    if (error) throw error;
    if (!data) return new Response("Not found", { status: 404 });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('user-by-username-get error:', err);
    return new Response(String((err as Error)?.message ?? err), { status: 400, headers: corsHeaders });
  }
});

