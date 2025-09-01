import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { GameLoop } from './gameLoop';
import { MatchManager } from './matchManager';
import { Messages } from './messages';
import { supabase } from '../supabaseClient';

const app = express();
// Helmet configured for embedding (no frameguard/CSP)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  frameguard: false,
  xssFilter: false,
  noSniff: false
}));
// Wide-open CORS for dev/embedding
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(cors({ origin: '*', credentials: true }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const server = createServer(app);
const wss = new WebSocketServer({ server });
const matchManager = new MatchManager();
const gameLoop = new GameLoop(matchManager);

type Client = WebSocket & { id?: string; username?: string; walletBalance?: number; authed?: boolean };

function broadcast(message: any) {
  const payload = JSON.stringify(message);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  });
}

wss.on('connection', (ws: Client) => {
  ws.authed = false;

  ws.on('message', async (raw: Buffer) => {
    let msg: any;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    switch (msg.type) {
      // Auth and connection bootstrap
      case Messages.CONNECT: {
        const token: string | undefined = msg.token;
        try {
          let userId: string | null = null;
          let username = '';
          let walletBalance = 0;

          if (token) {
            const { data, error } = await supabase.auth.getUser(token);
            if (error) throw error;
            userId = data?.user?.id ?? null;
          }

          if (userId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username, walletBalance')
              .eq('id', userId)
              .single();
            username = profile?.username ?? `Player_${userId.slice(0, 4)}`;
            walletBalance = profile?.walletBalance ?? 0;
            ws.id = userId;
          } else {
            // Fallback guest user
            ws.id = Math.random().toString(36).slice(2);
            username = `Guest_${ws.id.slice(0, 4)}`;
            walletBalance = 0;
          }

          ws.username = username;
          ws.walletBalance = walletBalance;
          ws.authed = true;

          matchManager.playerManager.createPlayer(ws.id!, ws.username!);

          ws.send(JSON.stringify({
            type: Messages.CONNECT_SUCCESS,
            userId: ws.id,
            username,
            walletBalance
          }));

          // Send initial game state (for minimap/zone rendering if active)
          ws.send(JSON.stringify({ type: Messages.GAME_STATE, state: 'active', players: matchManager.playerManager.getAllPlayers(), foods: [], zone: matchManager.zoneManager.getZone() }));
        } catch (e: any) {
          ws.send(JSON.stringify({ type: Messages.CONNECT_ERROR, error: 'Authentication failed' }));
        }
        break;
      }

      // Matchmaking
      case Messages.JOIN_MATCH: {
        if (!ws.authed || !ws.id || !ws.username) return;
        const entryFee = Number(msg.entryFee);
        if (![1, 5, 20].includes(entryFee)) return;
        matchManager.joinQueue(ws.id, entryFee as 1 | 5 | 20, ws.username);
        break;
      }
      case Messages.MATCH_CANCEL: {
        if (!ws.authed || !ws.id) return;
        matchManager.leaveQueue(ws.id);
        ws.send(JSON.stringify({ type: Messages.MATCH_CANCELLED }));
        break;
      }

      // Gameplay relays (optional)
      case Messages.PLAYER_MOVE:
        if (!ws.authed || !ws.id) return;
        matchManager.playerManager.handleMove(ws.id, msg.x, msg.y);
        break;
      case Messages.PLAYER_BOOST:
        if (!ws.authed || !ws.id) return;
        matchManager.playerManager.setBoost(ws.id, msg.boosting);
        break;
      case Messages.PLAYER_EMOJI:
        if (!ws.authed || !ws.id) return;
        matchManager.playerManager.setEmoji(ws.id, msg.emoji);
        break;

      // Data APIs
      case Messages.LEADERBOARD_REQUEST: {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username, wins:wins, earnings:earnings')
            .order('wins', { ascending: false })
            .limit(100);
          if (error) throw error;
          const players = (data ?? []).map((p: any, idx: number) => ({
            rank: idx + 1,
            username: p.username,
            wins: p.wins ?? 0,
            earnings: p.earnings ?? 0
          }));
          ws.send(JSON.stringify({ type: Messages.LEADERBOARD_DATA, players }));
        } catch {
          ws.send(JSON.stringify({ type: Messages.LEADERBOARD_DATA, players: [] }));
        }
        break;
      }
      case Messages.PROFILE_REQUEST: {
        const userId: string = msg.userId;
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('gamesPlayed, wins, losses, earnings')
            .eq('id', userId)
            .single();
          if (error) throw error;
          ws.send(JSON.stringify({ type: Messages.PROFILE_DATA, stats: {
            gamesPlayed: data?.gamesPlayed ?? 0,
            wins: data?.wins ?? 0,
            losses: data?.losses ?? 0,
            earnings: data?.earnings ?? 0
          }}));
        } catch {
          ws.send(JSON.stringify({ type: Messages.PROFILE_DATA, stats: { gamesPlayed: 0, wins: 0, losses: 0, earnings: 0 } }));
        }
        break;
      }
    }
  });

  ws.on('close', () => {
    if (ws.id) matchManager.playerManager.removePlayer(ws.id);
    if (ws.id) matchManager.leaveQueue(ws.id);
  });
});

gameLoop.start(broadcast);

const PORT = process.env.RT_PORT ? Number(process.env.RT_PORT) : 8083;
server.listen(PORT, () => {
  console.log(`SnakeRoyale realtime server listening on ${PORT}`);
});

