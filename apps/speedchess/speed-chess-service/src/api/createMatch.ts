import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { validateRequiredFields, sendErrorResponse, sendSuccessResponse, handleSupabaseError } from '../utils';

export async function createMatch(req: Request, res: Response): Promise<void> {
  try {
    // Validate required fields
    const requiredFields = ['user_id', 'time_control', 'variant'];
    const missingFields = validateRequiredFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      sendErrorResponse(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    const { user_id, time_control, variant, is_public = true } = req.body;

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('speedchess-create-match', {
      body: {
        user_id,
        time_control,
        variant,
        is_public
      }
    });

    if (error) {
      const errorMessage = handleSupabaseError(error);
      sendErrorResponse(res, 400, errorMessage);
      return;
    }

    sendSuccessResponse(res, data, 'Match created successfully');
  } catch (error) {
    console.error('Error in createMatch:', error);
    sendErrorResponse(res, 500, 'Internal server error');
  }
} 