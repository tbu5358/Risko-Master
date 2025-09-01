/**
 * SpeedChess - Complete Match Function
 * 
 * This function handles the completion of a SpeedChess match.
 * It pays out winnings to the winner and marks the match as completed.
 * 
 * Flow:
 * 1. Validate match exists and is active
 * 2. Pay out winnings to winner (both players' wagers)
 * 3. Mark match as completed with winner/loser
 * 4. Return success response
 */

// @ts-ignore
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase client with service role for database operations
// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

serve(async (req) => {
  // Step 1: Extract match completion data from request body
  // match_id: ID of the match being completed
  // winner_id: UUID of the winning player
  // loser_id: UUID of the losing player
  const { match_id, winner_id, loser_id } = await req.json()

  // Step 2: Fetch and validate the match exists and is in active status
  // We need to ensure the match is currently being played
  const { data: match, error } = await supabase
    .from('speedchess_matches')
    .select('*')
    .eq('id', match_id)
    .single()

  // Check if match exists and is currently active (being played)
  if (error || match.status !== 'active') {
    return new Response('Match not active or invalid', { status: 400 })
  }

  // Step 3: Pay out winnings to the winner using centralized money function
  // The winner receives both players' wagers (double the original wager)
  // Note: We use the RPC directly since we need to credit a specific user
  const { error: creditError } = await supabase.rpc('credit_wallet', {
    p_user_id: winner_id, // Credit the winner's wallet
    p_credit_amount: match.wager_cents * 2, // Double the wager (both players' money)
    p_tx_desc: 'SpeedChess Win', // Human-readable transaction description
    p_tx_ref: `speedchess_win_${match_id}` // Unique transaction reference for tracking
  })

  // Step 4: Handle wallet credit errors
  // If crediting fails, log error and return failure response
  if (creditError) {
    console.error('Failed to credit winner:', creditError)
    return new Response(JSON.stringify({ error: 'Failed to pay out winnings' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Step 5: Mark the match as completed and record winner/loser
  // This prevents further modifications to the match
  await supabase
    .from('speedchess_matches')
    .update({ 
      winner_id, // Record who won
      loser_id, // Record who lost
      status: 'completed' // Mark match as finished
    })
    .eq('id', match_id)

  // Step 6: Return success response to the client
  return new Response('Match complete', { status: 200 })
}) 