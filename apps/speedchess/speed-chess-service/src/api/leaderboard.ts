import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { sendErrorResponse, sendSuccessResponse, handleSupabaseError } from '../utils';

export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const { limit = 50, offset = 0, time_control } = req.query;

    // Validate query parameters
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      sendErrorResponse(res, 400, 'Invalid limit parameter. Must be between 1 and 100');
      return;
    }

    if (isNaN(offsetNum) || offsetNum < 0) {
      sendErrorResponse(res, 400, 'Invalid offset parameter. Must be non-negative');
      return;
    }

    // Prepare request body
    const requestBody: any = {
      limit: limitNum,
      offset: offsetNum
    };

    if (time_control) {
      requestBody.time_control = time_control;
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('speedchess-leaderboard', {
      body: requestBody
    });

    if (error) {
      const errorMessage = handleSupabaseError(error);
      sendErrorResponse(res, 400, errorMessage);
      return;
    }

    sendSuccessResponse(res, data, 'Leaderboard retrieved successfully');
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    sendErrorResponse(res, 500, 'Internal server error');
  }
} 