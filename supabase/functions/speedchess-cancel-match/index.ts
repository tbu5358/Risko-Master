/**
 * SpeedChess - Cancel Match Function
 * 
 * This function allows match creators to cancel their matches.
 * It refunds the wager and deletes the match record.
 * 
 * Flow:
 * 1. Authenticate user
 * 2. Validate user owns the match and it's cancellable
 * 3. Refund wager to creator
 * 4. Delete match record
 * 5. Return success response
 */

// @ts-ignore
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import { getUserFromRequest } from "../_shared/auth.ts";

// Initialize Supabase client with service role for database operations
// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

serve(async (req) => {
  // Step 1: Authenticate the user making the request
  // This ensures only logged-in users can cancel matches
  const user = await getUserFromRequest(req)
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Step 2: Extract match ID from request body
  const { match_id } = await req.json()
  
  // Step 3: Fetch and validate the match exists and belongs to the user
  // We need to ensure the user owns the match and it's in a cancellable state
  const { data: match, error } = await supabase
    .from('speedchess_matches')
    .select('*')
    .eq('id', match_id)
    .single()

  // Check if match exists, belongs to the user, and is waiting for players
  // Only matches in 'waiting' status can be cancelled (not active matches)
  if (error || match.creator_id !== user.id || match.status !== 'waiting') {
    return new Response('Cannot cancel', { status: 403 })
  }

  // Step 4: Refund the wager to the creator using centralized money function
  // This returns the creator's money since the match was cancelled
  // Note: We use the RPC directly since we need to credit a specific user
  const { error: creditError } = await supabase.rpc('credit_wallet', {
    p_user_id: user.id, // Credit the creator's wallet
    p_credit_amount: match.wager_cents, // Refund the original wager amount
    p_tx_desc: 'SpeedChess Match Cancellation Refund', // Human-readable transaction description
    p_tx_ref: `speedchess_cancel_${match_id}` // Unique transaction reference for tracking
  })

  // Step 5: Handle wallet credit errors
  // If crediting fails, log error and return failure response
  if (creditError) {
    console.error('Failed to refund wager:', creditError)
    return new Response(JSON.stringify({ error: 'Failed to refund wager' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Step 6: Delete the match record from the database
  // This removes the cancelled match completely
  const { error: delErr } = await supabase
    .from('speedchess_matches')
    .delete()
    .eq('id', match_id)

  // Step 7: Handle database deletion errors
  if (delErr) return new Response(delErr.message, { status: 500 })
  
  // Step 8: Return success response to the client
  return new Response('Match cancelled', { status: 200 })
}) 