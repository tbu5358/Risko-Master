/**
 * Money Management - Balance Check Function
 * 
 * This function allows users to check their current wallet balance.
 * It's a simple read operation that returns the user's current balance.
 * 
 * Flow:
 * 1. Authenticate user
 * 2. Fetch wallet balance from database
 * 3. Return balance to user
 */

// Shared imports & setup for all functions
// -----------------------------------------
// Setup type definitions for built-in Supabase Runtime APIs
// @ts-ignore
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.152.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import { getUserFromRequest } from "../_shared/auth.ts";

// Initialize Supabase client with service role for database operations
// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Balance Function
// --------------------
export const balance = serve(async (req) => {
  try {
    // Step 1: Authenticate the user making the request
    // This ensures only logged-in users can check their own balance
    const user = await getUserFromRequest(req);
    const userId = user.id;

    // Step 2: Fetch wallet balance from database
    // We only need the balance field from the wallets table
    const { data, error: wErr } = await sb
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    // Step 3: Handle database query errors
    if (wErr) throw wErr;

    // Step 4: Return the user's current balance
    // The balance is stored as a string in the database
    return new Response(JSON.stringify({ balance: data.balance }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    // Step 5: Handle any unexpected errors
    console.error('Balance check error:', err);
    return new Response(err.message, { status: 400 });
  }
}); 