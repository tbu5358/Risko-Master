import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { validateRequiredFields, sendErrorResponse, sendSuccessResponse, handleSupabaseError } from '../utils';

export async function withdrawWebhook(req: Request, res: Response): Promise<void> {
  try {
    // Validate required fields
    const requiredFields = ['transaction_id', 'user_id', 'amount', 'currency'];
    const missingFields = validateRequiredFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      sendErrorResponse(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    const { transaction_id, user_id, amount, currency, status, metadata } = req.body;

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('transactions-withdraw-webhook', {
      body: {
        transaction_id,
        user_id,
        amount,
        currency,
        status,
        metadata
      }
    });

    if (error) {
      const errorMessage = handleSupabaseError(error);
      sendErrorResponse(res, 400, errorMessage);
      return;
    }

    sendSuccessResponse(res, data, 'Withdraw webhook processed successfully');
  } catch (error) {
    console.error('Error in withdrawWebhook:', error);
    sendErrorResponse(res, 500, 'Internal server error');
  }
} 