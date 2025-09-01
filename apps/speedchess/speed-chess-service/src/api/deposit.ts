import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { validateRequiredFields, sendErrorResponse, sendSuccessResponse, handleSupabaseError } from '../utils';

export async function deposit(req: Request, res: Response): Promise<void> {
  try {
    // Validate required fields
    const requiredFields = ['user_id', 'amount', 'currency'];
    const missingFields = validateRequiredFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      sendErrorResponse(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    const { user_id, amount, currency, description } = req.body;

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      sendErrorResponse(res, 400, 'Amount must be a positive number');
      return;
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('transactions-deposit', {
      body: {
        user_id,
        amount,
        currency,
        description
      }
    });

    if (error) {
      const errorMessage = handleSupabaseError(error);
      sendErrorResponse(res, 400, errorMessage);
      return;
    }

    sendSuccessResponse(res, data, 'Deposit processed successfully');
  } catch (error) {
    console.error('Error in deposit:', error);
    sendErrorResponse(res, 500, 'Internal server error');
  }
} 