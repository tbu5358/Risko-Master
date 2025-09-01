// (POST)     – returns Stripe link, inserts pending tx

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

// 1) Deposit Function
// -------------------
export const deposit = serve(async (req) => {
  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: user, error: userErr } = await sb.auth.getUser(token);
    if (userErr || !user) return new Response("Unauthorized", { status: 401 });
    const userId = user.id;

    // Parse & validate request
    const { amount, metadata } = await req.json();
    if (!amount || amount <= 0) throw new Error("Invalid deposit amount");

    // Insert pending deposit transaction
    const { error: txErr } = await sb
      .from('transactions')
      .insert([{ user_id: userId, amount, type: 'deposit', status: 'pending', metadata }]);
    if (txErr) throw txErr;

    // Generate payment link (e.g., via Stripe)
    // const paymentLink = await createStripeLink(amount, userId);
    const paymentLink = "<PAYMENT_LINK_PLACEHOLDER>";

    return new Response(JSON.stringify({ paymentLink }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(err.message, { status: 400 });
  }
}); 