/**
 * SpeedChess - Create Match Function
 * 
 * This function allows authenticated users to create a new SpeedChess match.
 * It handles wager deduction, match creation, and proper error handling.
 * 
 * Flow:
 * 1. Authenticate user
 * 2. Validate input parameters
 * 3. Deduct wager from user's wallet
 * 4. Create match record in database
 * 5. Return match details
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
  // This ensures only logged-in users can create matches
  const user = await getUserFromRequest(req)
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Step 2: Extract and validate input parameters
  // wager: amount in dollars (will be converted to cents)
  // time_control: game duration in seconds (60, 180, or 300)
  const { wager, time_control } = await req.json()
  
  // Validate time control options and ensure wager is a number
  if (![60, 180, 300].includes(time_control) || typeof wager !== 'number') {
    return new Response('Invalid params', { status: 400 })
  }

  // Step 3: Deduct wager from user's wallet using centralized money function
  // This ensures consistent wallet management across all games
  const debitResponse = await fetch(`${SUPABASE_URL}/functions/v1/internal-debit`, {
    method: 'POST',
    headers: {
      'Authorization': req.headers.get('Authorization') || '', // Pass user's auth token
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: wager * 100, // Convert dollars to cents for database storage
      description: 'SpeedChess Match Wager', // Human-readable transaction description
      tx_ref: `speedchess_wager_${Date.now()}` // Unique transaction reference for tracking
    })
  })

  // Step 4: Handle wallet deduction errors
  // If deduction fails, return error without creating match
  if (!debitResponse.ok) {
    const errorData = await debitResponse.json()
    return new Response(JSON.stringify({ error: errorData.error || 'Failed to deduct wager' }), { 
      status: debitResponse.status,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Step 5: Create the match record in the database
  // This stores match details and sets status to 'waiting' for another player
  const { data, error } = await supabase
    .from('speedchess_matches')
    .insert({
      creator_id: user.id, // User who created the match
      wager_cents: wager * 100, // Store wager in cents for precision
      time_control, // Game duration in seconds
      status: 'waiting' // Match is waiting for another player to join
    })
    .select()
    .single()

  // Step 6: Handle database creation errors
  if (error) return new Response(error.message, { status: 500 })
  
  // Step 7: Return the created match details to the client
  return new Response(JSON.stringify(data), { status: 200 })
}) 