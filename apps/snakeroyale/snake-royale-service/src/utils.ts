import { Request, Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function validateRequiredFields(body: any, requiredFields: string[]): string[] {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!body[field] && body[field] !== 0) {
      missingFields.push(field);
    }
  }
  
  return missingFields;
}

export function sendErrorResponse(res: Response, statusCode: number, message: string): void {
  const response: ApiResponse = {
    success: false,
    error: message
  };
  res.status(statusCode).json(response);
}

export function sendSuccessResponse<T>(res: Response, data: T, message?: string): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  res.status(200).json(response);
}

export function handleSupabaseError(error: any): string {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
} 