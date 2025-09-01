import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { validateRequiredFields, sendErrorResponse, sendSuccessResponse, handleSupabaseError } from '../utils';

export async function getBalance(req: Request, res: Response): Promise<void> {
  try {
    const { user_id } = req.body || {};
    // If user_id provided, call a user-specific balance fetch; otherwise rely on caller auth context
    const { data, error } = await supabase.functions.invoke('transactions-balance', user_id ? { body: { user_id } } : {});

    if (error) {
      const errorMessage = handleSupabaseError(error);
      sendErrorResponse(res, 400, errorMessage);
      return;
    }

    sendSuccessResponse(res, data, 'Balance retrieved successfully');
  } catch (error) {
    console.error('Error in getBalance:', error);
    sendErrorResponse(res, 500, 'Internal server error');
  }
} 