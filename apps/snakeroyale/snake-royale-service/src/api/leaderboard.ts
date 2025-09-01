import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { logger } from '../utils/logger';

export async function getLeaderboard(req: Request, res: Response) {
    try {
        const { timeframe = 'all', limit = 100 } = req.query;

        let query = supabase
            .from('players')
            .select('id, username, wins, losses, xp, balance, created_at')
            .order('xp', { ascending: false })
            .limit(Number(limit));

        // Filter by timeframe
        if (timeframe === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            query = query.gte('created_at', today.toISOString());
        } else if (timeframe === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            query = query.gte('created_at', weekAgo.toISOString());
        }

        const { data: players, error } = await query;

        if (error) {
            throw error;
        }

        // Calculate win rates and format response
        const leaderboard = players.map((player, index) => ({
            rank: index + 1,
            id: player.id,
            username: player.username,
            wins: player.wins || 0,
            losses: player.losses || 0,
            winRate: ((player.wins || 0) / Math.max((player.wins || 0) + (player.losses || 0), 1) * 100).toFixed(1),
            xp: player.xp || 0,
            balance: player.balance || 0
        }));

        logger.info(`Leaderboard fetched: ${timeframe} timeframe, ${leaderboard.length} players`);
        res.json({ leaderboard, timeframe });

    } catch (error) {
        logger.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
