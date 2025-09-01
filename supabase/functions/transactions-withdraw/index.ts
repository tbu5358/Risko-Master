// (POST)     – inserts pending tx, triggers payout

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
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// @ts-ignore
const JWT_SECRET = Deno.env.get("JWT_SECRET")!;
// @ts-ignore
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// 2) Withdraw Function
// ---------------------
export const withdraw = serve(async (req) => {
  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: user, error: userErr } = await sb.auth.getUser(token);
    if (userErr || !user) return new Response("Unauthorized", { status: 401 });
    const userId = user.id;

    // Parse & validate request
    const { amount, destination } = await req.json();
    if (!amount || amount <= 0) throw new Error("Invalid withdrawal amount");

    // Check and fetch current balance
    const { data: wallet, error: wErr } = await sb
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();
    if (wErr) throw wErr;
    if (wallet.balance < amount) throw new Error("Insufficient funds");

    // Insert pending withdrawal transaction
    const { error: txErr } = await sb
      .from('transactions')
      .insert([{ user_id: userId, amount: -amount, type: 'withdraw', status: 'pending', metadata: { destination } }]);
    if (txErr) throw txErr;

    // Trigger external payout (e.g., Stripe)
    // const payoutResult = await sendStripePayout(amount, destination);
    const payoutResult = { status: 'pending' };

    return new Response(JSON.stringify({ success: true, payoutResult }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(err.message, { status: 400 });
  }
}); 