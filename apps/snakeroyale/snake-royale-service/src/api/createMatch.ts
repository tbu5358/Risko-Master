import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { logger } from '../utils/logger';

export async function createMatch(req: Request, res: Response) {
    try {
        const { playerId, betAmount } = req.body;

        if (!playerId || !betAmount || betAmount <= 0) {
            return res.status(400).json({ error: 'Invalid player ID or bet amount' });
        }

        // Check player balance
        const { data: player, error: balanceError } = await supabase
            .from('players')
            .select('balance')
            .eq('id', playerId)
            .single();

        if (balanceError || !player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        if (player.balance < betAmount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Create match
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .insert({
                player1_id: playerId,
                bet_amount: betAmount,
                status: 'waiting',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (matchError) {
            throw matchError;
        }

        // Deduct bet amount from player balance
        const { error: updateError } = await supabase
            .from('players')
            .update({ balance: player.balance - betAmount })
            .eq('id', playerId);

        if (updateError) {
            throw updateError;
        }

        logger.info(`Match created: ${match.id} by player ${playerId} with bet ${betAmount}`);
        res.json({ matchId: match.id, status: 'waiting' });

    } catch (error) {
        logger.error('Error creating match:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
