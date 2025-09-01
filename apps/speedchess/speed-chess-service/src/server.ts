import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

// Import API routes
import { createMatch } from './api/createMatch';
import { joinMatch } from './api/joinMatch';
import { cancelMatch } from './api/cancelMatch';
import { completeMatch } from './api/completeMatch';
import { getLeaderboard } from './api/leaderboard';
import type { Request, Response } from 'express';
import { getActiveMatches } from './api/getActiveMatches';
import { deposit } from './api/deposit';
import { withdraw } from './api/withdraw';
import { getBalance } from './api/balance';
import { internalCredit } from './api/internal_credit';
import { internalDebit } from './api/internal_debit';
import { depositWebhook } from './api/deposit_webhook';
import { withdrawWebhook } from './api/withdraw_webhook';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 8081;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.com']
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'speedchess-backend'
  });
});

// API Routes
app.post('/api/create-match', createMatch);
app.post('/api/join-match', joinMatch);
app.post('/api/cancel-match', cancelMatch);
app.post('/api/complete-match', completeMatch);
app.get('/api/leaderboard', getLeaderboard);
// Simple user profile stats (wins, losses, win_rate, total_pnl) by username
app.get('/api/profile', async (req: Request, res: Response) => {
  try {
    const { username } = req.query as { username?: string };
    if (!username) {
      res.status(400).json({ success: false, error: 'Missing username' });
      return;
    }
    // Resolve username -> user id
    const { data: userRow, error: uErr } = await supabase.functions.invoke('user-by-username-get', {
      body: { username }
    });
    if (uErr) {
      res.status(400).json({ success: false, error: (uErr as any)?.message || 'User lookup failed' });
      return;
    }
    const userId = (userRow as any)?.id;
    if (!userId) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    // Aggregate player stats from matches
    const { data: matches, error: mErr } = await supabase
      .from('speedchess_matches')
      .select('winner_id, loser_id, wager_cents')
      .eq('status', 'completed')
      .or(`winner_id.eq.${userId},loser_id.eq.${userId}`);
    if (mErr) {
      res.status(400).json({ success: false, error: (mErr as any)?.message || 'Failed loading matches' });
      return;
    }
    let wins = 0, losses = 0, pnlCents = 0;
    for (const row of (matches || [])) {
      const wager = Number((row as any)?.wager_cents || 0);
      if ((row as any)?.winner_id === userId) { wins += 1; pnlCents += wager; }
      if ((row as any)?.loser_id === userId) { losses += 1; pnlCents -= wager; }
    }
    const games = wins + losses;
    const win_rate = games > 0 ? Math.round((wins / games) * 100) : 0;
    res.json({ success: true, data: { username, wins, losses, win_rate, total_pnl: Number(pnlCents / 100) } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Internal server error' });
  }
});
app.get('/api/get-active-matches', getActiveMatches);

// Transaction Routes
app.post('/api/deposit', deposit);
app.post('/api/withdraw', withdraw);
app.post('/api/balance', getBalance);
app.post('/api/internal-credit', internalCredit);
app.post('/api/internal-debit', internalDebit);
app.post('/api/deposit-webhook', depositWebhook);
app.post('/api/withdraw-webhook', withdrawWebhook);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Create HTTP server
const server = createServer(app);

// Extend WebSocket interface to include custom properties
interface GameWebSocket extends WebSocket {
  matchId?: string;
  username?: string;
}

// WebSocket server setup
const wss = new WebSocketServer({ 
  server,
  clientTracking: false
});

const matches = new Map<string, Set<GameWebSocket>>(); // matchId -> Set of ws

wss.on('connection', function connection(ws) {
  const gameWs = ws as GameWebSocket;
  
  gameWs.on('message', function incoming(message) {
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch (error) {
      // Silently ignore invalid JSON
      return;
    }
    
    // Handle join
    if (data.type === 'join') {
      console.log('[Server] Player joining:', { matchId: data.matchId, username: data.username });
      gameWs.matchId = data.matchId;
      gameWs.username = data.username;
      
      if (gameWs.matchId && !matches.has(gameWs.matchId)) {
        matches.set(gameWs.matchId, new Set());
      }
      if (gameWs.matchId) {
        matches.get(gameWs.matchId)!.add(gameWs);
      }
      
      console.log('[Server] Match clients:', { 
        matchId: gameWs.matchId, 
        clientCount: gameWs.matchId ? matches.get(gameWs.matchId)!.size : 0
      });
      
      // Notify others (but not the joining user)
      if (gameWs.matchId) {
        broadcastToOthers(gameWs.matchId, gameWs, { 
          type: 'user-joined', 
          username: data.username 
        });
        console.log('[Server] Sent user-joined to other clients');
      }
    }
    // Broadcast all other events to the match
    else if (gameWs.matchId && matches.has(gameWs.matchId)) {
      broadcast(gameWs.matchId, data);
    }
  });

  gameWs.on('close', function () {
    if (gameWs.matchId && matches.has(gameWs.matchId)) {
      const matchSet = matches.get(gameWs.matchId);
      if (matchSet) {
        matchSet.delete(gameWs);
        if (matchSet.size === 0) {
          matches.delete(gameWs.matchId);
        }
      }
    }
  });

  // Handle errors silently to prevent logging
  gameWs.on('error', function (error) {
    // Silently handle WebSocket errors
  });
});

function broadcast(matchId: string, data: any) {
  if (!matches.has(matchId)) return;
  
  const message = JSON.stringify(data);
  const clients = matches.get(matchId)!;
  
  // Use for...of for better performance
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (error) {
        // Silently handle send errors
      }
    }
  }
}

function broadcastToOthers(matchId: string, excludeWs: GameWebSocket, data: any) {
  if (!matches.has(matchId)) return;
  
  const message = JSON.stringify(data);
  const clients = matches.get(matchId)!;
  let sentCount = 0;
  
  // Use for...of for better performance
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN && client !== excludeWs) {
      try {
        client.send(message);
        sentCount++;
      } catch (error) {
        // Silently handle send errors
      }
    }
  }
  console.log('[Server] broadcastToOthers sent to', sentCount, 'clients (excluded joining user)');
}

// Start server
server.listen(port, () => {
  console.log(`SpeedChess backend server running on port ${port}`);
  console.log(`WebSocket server available on ws://localhost:${port}`);
  console.log(`API endpoints available on http://localhost:${port}/api/*`);
}); 