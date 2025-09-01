import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { logger } from '../utils/logger';

export async function completeMatch(req: Request, res: Response) {
    try {
        const { matchId, winnerId, scores } = req.body;

        if (!matchId || !winnerId) {
            return res.status(400).json({ error: 'Match ID and winner ID are required' });
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

        if (match.status !== 'active') {
            return res.status(400).json({ error: 'Match is not active' });
        }

        // Calculate prize pool
        const prizePool = match.bet_amount * 2;
        const winnerPrize = Math.floor(prizePool * 0.95); // 5% house edge

        // Update match status
        const { error: updateError } = await supabase
            .from('matches')
            .update({
                status: 'completed',
                winner_id: winnerId,
                completed_at: new Date().toISOString(),
                scores: scores
            })
            .eq('id', matchId);

        if (updateError) {
            throw updateError;
        }

        // Award prize to winner
        const { data: winner, error: winnerError } = await supabase
            .from('players')
            .select('balance, xp, wins')
            .eq('id', winnerId)
            .single();

        if (winnerError || !winner) {
            return res.status(404).json({ error: 'Winner not found' });
        }

        const { error: prizeError } = await supabase
            .from('players')
            .update({
                balance: winner.balance + winnerPrize,
                xp: winner.xp + 100,
                wins: (winner.wins || 0) + 1
            })
            .eq('id', winnerId);

        if (prizeError) {
            throw prizeError;
        }

        // Update loser stats
        const loserId = match.player1_id === winnerId ? match.player2_id : match.player1_id;
        const { data: loser, error: loserError } = await supabase
            .from('players')
            .select('losses')
            .eq('id', loserId)
            .single();

        if (loser && !loserError) {
            await supabase
                .from('players')
                .update({ losses: (loser.losses || 0) + 1 })
                .eq('id', loserId);
        }

        logger.info(`Match ${matchId} completed. Winner: ${winnerId}, Prize: ${winnerPrize}`);
        res.json({
            matchId,
            winnerId,
            prize: winnerPrize,
            status: 'completed'
        });

    } catch (error) {
        logger.error('Error completing match:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
