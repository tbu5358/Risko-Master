/**
 * Money Management - Internal Debit Function
 * 
 * This function handles debiting money from a user's wallet.
 * Used for game wagers, fees, and other deductions.
 * 
 * Flow:
 * 1. Handle CORS pre-flight requests
 * 2. Validate HTTP method
 * 3. Authenticate user
 * 4. Validate input parameters
 * 5. Perform atomic debit via stored procedure
 * 6. Return updated balance
 */

// @ts-ignore 
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore 
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore 
import { getUserFromRequest } from "../_shared/auth.ts";
// @ts-ignore
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Supabase client with service role for database operations
// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Step 1: Handle CORS pre-flight requests
  // This allows browsers to check if the request is allowed before making it
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Step 2: Validate HTTP method
  // Only POST requests are allowed for debiting wallets
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    // Step 3: Authenticate the user making the request
    // This ensures only logged-in users can debit their own wallets
    const user = await getUserFromRequest(req);

    // Step 4: Extract and validate input parameters
    // amount: amount to debit in cents (must be positive integer)
    // description: human-readable description of the debit
    // tx_ref: unique transaction reference for tracking
    const { amount, description, tx_ref } = await req.json();

    // Validate amount is a positive integer (in cents)
    // Using integer cents prevents floating-point precision issues
    if (typeof amount !== "number" || amount <= 0 || !Number.isInteger(amount)) {
      return new Response(
        JSON.stringify({ error: "Invalid amount (must be integer cents)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Step 5: Perform atomic debit via stored procedure
    // The debit_wallet RPC handles:
    // - Checking sufficient balance
    // - Updating wallet balance
    // - Recording transaction
    // - All in a single atomic operation
    const { data, error } = await supabase.rpc("debit_wallet", {
      user_id: user.id, // User whose wallet to debit
      debit_amount: amount, // Amount to debit in cents
      tx_desc: description ?? "Wallet debit", // Human-readable description
      tx_ref, // Unique transaction reference
    });

    // Step 6: Handle RPC errors
    // Different error codes indicate different types of failures
    if (error) {
      console.error("debit_wallet RPC error:", error);
      const status = error.code === "PGRST" ? 400 : 500; // Bad request vs server error
      return new Response(
        JSON.stringify({ error: "Failed to debit wallet" }),
        {
          status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Step 7: Return success response with updated balance
    // The debit_wallet RPC returns the new balance after the debit
    return new Response(
      JSON.stringify({
        success: true,
        new_balance: data?.new_balance, // New balance after debit
        amount_debited: amount, // Amount that was debited
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    // Step 8: Handle any unexpected errors
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}); 