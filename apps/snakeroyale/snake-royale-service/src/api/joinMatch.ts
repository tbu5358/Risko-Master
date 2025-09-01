import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { logger } from '../utils/logger';

export async function joinMatch(req: Request, res: Response) {
    try {
        const { playerId, matchId } = req.body;

        if (!playerId || !matchId) {
            return res.status(400).json({ error: 'Player ID and match ID are required' });
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

        if (match.status !== 'waiting') {
            return res.status(400).json({ error: 'Match is not available to join' });
        }

        // Check player balance
        const { data: player, error: playerError } = await supabase
            .from('players')
            .select('balance')
            .eq('id', playerId)
            .single();

        if (playerError || !player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        if (player.balance < match.bet_amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Update match with player2
        const { error: updateError } = await supabase
            .from('matches')
            .update({
                player2_id: playerId,
                status: 'active',
                started_at: new Date().toISOString()
            })
            .eq('id', matchId);

        if (updateError) {
            throw updateError;
        }

        // Deduct bet amount from player2
        const { error: balanceError } = await supabase
            .from('players')
            .update({ balance: player.balance - match.bet_amount })
            .eq('id', playerId);

        if (balanceError) {
            throw balanceError;
        }

        logger.info(`Player ${playerId} joined match ${matchId}`);
        res.json({ matchId, status: 'active' });

    } catch (error) {
        logger.error('Error joining match:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
