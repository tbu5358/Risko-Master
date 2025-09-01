import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { validateRequiredFields, sendErrorResponse, sendSuccessResponse, handleSupabaseError, validateUUID } from '../utils';

export async function joinMatch(req: Request, res: Response): Promise<void> {
  try {
    // Validate required fields
    const requiredFields = ['match_id', 'user_id'];
    const missingFields = validateRequiredFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      sendErrorResponse(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    const { match_id, user_id } = req.body;

    // Validate UUID format
    if (!validateUUID(match_id)) {
      sendErrorResponse(res, 400, 'Invalid match_id format');
      return;
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('speedchess-join-match', {
      body: { match_id, user_id }
    });

    if (error) {
      const errorMessage = handleSupabaseError(error);
      sendErrorResponse(res, 400, errorMessage);
      return;
    }

    sendSuccessResponse(res, data, 'Successfully joined match');
  } catch (error) {
    console.error('Error in joinMatch:', error);
    sendErrorResponse(res, 500, 'Internal server error');
  }
} 