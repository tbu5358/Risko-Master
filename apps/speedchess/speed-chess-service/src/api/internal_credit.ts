import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { validateRequiredFields, sendErrorResponse, sendSuccessResponse, handleSupabaseError } from '../utils';

export async function internalCredit(req: Request, res: Response): Promise<void> {
  try {
    // Validate required fields
    const requiredFields = ['user_id', 'amount', 'currency', 'reason'];
    const missingFields = validateRequiredFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      sendErrorResponse(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    const { user_id, amount, currency, reason, description } = req.body;

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      sendErrorResponse(res, 400, 'Amount must be a positive number');
      return;
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('transactions-internal-credit', {
      body: {
        user_id,
        amount,
        currency,
        reason,
        description
      }
    });

    if (error) {
      const errorMessage = handleSupabaseError(error);
      sendErrorResponse(res, 400, errorMessage);
      return;
    }

    sendSuccessResponse(res, data, 'Internal credit processed successfully');
  } catch (error) {
    console.error('Error in internalCredit:', error);
    sendErrorResponse(res, 500, 'Internal server error');
  }
} 