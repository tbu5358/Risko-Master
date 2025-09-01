/**
 * SpeedChess - Join Match Function
 * 
 * This function allows authenticated users to join an existing SpeedChess match.
 * It handles wager deduction, match validation, and status updates.
 * 
 * Flow:
 * 1. Authenticate user
 * 2. Validate match exists and is available
 * 3. Deduct wager from joiner's wallet
 * 4. Update match status to active
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
  // This ensures only logged-in users can join matches
  const user = await getUserFromRequest(req)
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Step 2: Extract match ID from request body
  const { match_id } = await req.json()
  
  // Step 3: Fetch and validate the match exists and is available
  // We need to ensure the match is in 'waiting' status and hasn't been joined
  const { data: match, error } = await supabase
    .from('speedchess_matches')
    .select('*')
    .eq('id', match_id)
    .single()

  // Check if match exists, is waiting for players, and hasn't been joined yet
  if (error || !match || match.status !== 'waiting') {
    return new Response('Invalid match', { status: 400 })
  }

  // Step 4: Deduct wager from joiner's wallet using centralized money function
  // This ensures the joiner pays the same amount as the creator
  const debitResponse = await fetch(`${SUPABASE_URL}/functions/v1/internal-debit`, {
    method: 'POST',
    headers: {
      'Authorization': req.headers.get('Authorization') || '', // Pass user's auth token
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: match.wager_cents, // Use the same wager amount as the creator (already in cents)
      description: 'SpeedChess Match Wager', // Human-readable transaction description
      tx_ref: `speedchess_join_${match_id}_${Date.now()}` // Unique transaction reference for tracking
    })
  })

  // Step 5: Handle wallet deduction errors
  // If deduction fails, return error without updating match
  if (!debitResponse.ok) {
    const errorData = await debitResponse.json()
    return new Response(JSON.stringify({ error: errorData.error || 'Failed to deduct wager' }), { 
      status: debitResponse.status,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Step 6: Update match status to 'active' and record the joiner
  // This marks the match as ready to play and prevents others from joining
  const { error: updateError } = await supabase
    .from('speedchess_matches')
    .update({ 
      joiner_id: user.id, // Record who joined the match
      status: 'active' // Change status to indicate match is ready
    })
    .eq('id', match_id)

  // Step 7: Handle database update errors
  if (updateError) return new Response(updateError.message, { status: 500 })
  
  // Step 8: Return success response to the client
  return new Response('Joined match', { status: 200 })
}) 