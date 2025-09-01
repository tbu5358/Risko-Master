import { Request, Response } from 'express';

export async function getActiveMatches(req: Request, res: Response): Promise<void> {
  try {
    res.status(200).json({ matches: [] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

