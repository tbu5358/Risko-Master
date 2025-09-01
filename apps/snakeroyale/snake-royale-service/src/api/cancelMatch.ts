import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { logger } from '../utils/logger';

export async function cancelMatch(req: Request, res: Response) {
    try {
        const { matchId, playerId } = req.body;

        if (!matchId || !playerId) {
            return res.status(400).json({ error: 'Match ID and player ID are required' });
        }

        // Get match details
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .single();

        if (matchError || !match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        // Check if player is the creator
        if (match.player1_id !== playerId) {
            return res.status(403).json({ error: 'Only match creator can cancel' });
        }

        if (match.status !== 'waiting') {
            return res.status(400).json({ error: 'Match cannot be cancelled' });
        }

        // Refund bet amount to player1
        const { data: player, error: playerError } = await supabase
            .from('players')
            .select('balance')
            .eq('id', playerId)
            .single();

        if (playerError || !player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        const { error: refundError } = await supabase
            .from('players')
            .update({ balance: player.balance + match.bet_amount })
            .eq('id', playerId);

        if (refundError) {
            throw refundError;
        }

        // Update match status
        const { error: updateError } = await supabase
            .from('matches')
            .update({ status: 'cancelled' })
            .eq('id', matchId);

        if (updateError) {
            throw updateError;
        }

        logger.info(`Match ${matchId} cancelled by player ${playerId}`);
        res.json({ matchId, status: 'cancelled' });

    } catch (error) {
        logger.error('Error cancelling match:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
