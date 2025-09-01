import { Request, Response } from 'express';

export async function deposit(req: Request, res: Response): Promise<void> {
  try {
    res.status(501).json({ error: 'Not implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

