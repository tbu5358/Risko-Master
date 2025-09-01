import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { validateRequiredFields, sendErrorResponse, sendSuccessResponse, handleSupabaseError, validateUUID } from '../utils';

export async function completeMatch(req: Request, res: Response): Promise<void> {
  try {
    // Validate required fields
    const requiredFields = ['match_id', 'winner_id', 'result'];
    const missingFields = validateRequiredFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      sendErrorResponse(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    const { match_id, winner_id, result, moves = [] } = req.body;

    // Validate UUID format
    if (!validateUUID(match_id)) {
      sendErrorResponse(res, 400, 'Invalid match_id format');
      return;
    }

    // Validate result
    const validResults = ['white_win', 'black_win', 'draw', 'abandoned'];
    if (!validResults.includes(result)) {
      sendErrorResponse(res, 400, 'Invalid result. Must be one of: white_win, black_win, draw, abandoned');
      return;
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('speedchess-complete-match', {
      body: {
        match_id,
        winner_id,
        result,
        moves
      }
    });

    if (error) {
      const errorMessage = handleSupabaseError(error);
      sendErrorResponse(res, 400, errorMessage);
      return;
    }

    sendSuccessResponse(res, data, 'Match completed successfully');
  } catch (error) {
    console.error('Error in completeMatch:', error);
    sendErrorResponse(res, 500, 'Internal server error');
  }
} 