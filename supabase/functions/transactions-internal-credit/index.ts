/**
 * Money Management - Internal Credit Function
 * 
 * This function handles crediting money to a user's wallet.
 * Used for admin credits, promotional bonuses, and game winnings.
 * 
 * Flow:
 * 1. Handle CORS pre-flight requests
 * 2. Authenticate user
 * 3. Validate input parameters
 * 4. Fetch current wallet balance
 * 5. Update wallet with new balance
 * 6. Record transaction in ledger
 * 7. Return updated balance
 */

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-ignore
import { corsHeaders } from "../_shared/cors.ts";
// @ts-ignore
import { getUserFromRequest } from "../_shared/auth.ts";

serve(async (req) => {
  // Step 1: Handle CORS pre-flight requests
  // This allows browsers to check if the request is allowed before making it
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 2: Initialize Supabase client with service role
    // Service role allows us to perform operations on behalf of any user
    // @ts-ignore
    const supabase = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Step 3: Authenticate the user making the request
    // This ensures only logged-in users can credit their own wallets
    const user = await getUserFromRequest(req);

    // Step 4: Validate HTTP method
    // Only POST requests are allowed for crediting wallets
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Step 5: Extract and validate input parameters
    // amount: amount to credit (must be positive number)
    // description: human-readable description of the credit
    // tx_ref: unique transaction reference for tracking
    const { amount, description, tx_ref } = await req.json()

    // Validate that amount is provided and is a positive number
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Step 6: Fetch current wallet balance
    // We need the current balance to calculate the new balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    // Handle case where user doesn't have a wallet yet
    if (walletError) {
      console.error('Wallet fetch error:', walletError)
      return new Response(
        JSON.stringify({ error: 'Wallet not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Step 7: Calculate new balance
    // Add the credit amount to the current balance
    const newBalance = parseFloat(wallet.balance) + parseFloat(amount)

    // Step 8: Update wallet balance in database
    // This atomically updates the user's wallet balance
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', user.id)

    // Handle database update errors
    if (updateError) {
      console.error('Wallet update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update wallet' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Step 9: Record transaction in transaction ledger
    // This creates an audit trail of all wallet operations
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'deposit', // Transaction type for credits
        amount: parseFloat(amount), // Amount credited
        tx_ref, // Unique transaction reference
        description: description || 'Wallet credit' // Human-readable description
      })

    // Log transaction recording errors (non-critical)
    if (txError) {
      console.error('Transaction record error:', txError)
      // Note: In production, you'd want to rollback the wallet update here
    }

    // Step 10: Log successful credit operation
    console.log(`Credited $${amount} to user ${user.id}, new balance: $${newBalance}`)

    // Step 11: Return success response with updated balance
    return new Response(
      JSON.stringify({ 
        success: true, 
        new_balance: newBalance,
        amount_credited: parseFloat(amount)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    // Step 12: Handle any unexpected errors
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 