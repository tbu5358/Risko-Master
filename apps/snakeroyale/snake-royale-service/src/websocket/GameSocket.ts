import { WebSocket, WebSocketServer } from 'ws';
import { logger } from '../utils/logger';

export interface GameMessage {
  type: string;
  data?: any;
  userId?: string;
  gameId?: string;
}

export class GameSocket {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();
  private gameRooms: Map<string, Set<string>> = new Map(); // gameId -> Set of userIds

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket, req: any) => {
      logger.info('New WebSocket connection established');

      ws.on('message', (data: Buffer) => {
        try {
          const message: GameMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          logger.error('Failed to parse WebSocket message', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error', error);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: GameMessage): void {
    logger.debug('Received WebSocket message', { type: message.type, data: message.data });

    switch (message.type) {
      case 'join_game':
        this.handleJoinGame(ws, message);
        break;
      case 'leave_game':
        this.handleLeaveGame(ws, message);
        break;
      case 'game_action':
        this.handleGameAction(ws, message);
        break;
      case 'chat_message':
        this.handleChatMessage(ws, message);
        break;
      default:
        this.sendError(ws, `Unknown message type: ${message.type}`);
    }
  }

  private handleJoinGame(ws: WebSocket, message: GameMessage): void {
    const { gameId, userId } = message;
    
    if (!gameId || !userId) {
      this.sendError(ws, 'Missing gameId or userId');
      return;
    }

    // Store client connection
    this.clients.set(userId, ws);
    
    // Add to game room
    if (!this.gameRooms.has(gameId)) {
      this.gameRooms.set(gameId, new Set());
    }
    this.gameRooms.get(gameId)!.add(userId);

    // Notify other players in the game
    this.broadcastToGame(gameId, {
      type: 'player_joined',
      data: { userId, gameId }
    }, userId);

    logger.info(`User ${userId} joined game ${gameId}`);
  }

  private handleLeaveGame(ws: WebSocket, message: GameMessage): void {
    const { gameId, userId } = message;
    
    if (!gameId || !userId) {
      this.sendError(ws, 'Missing gameId or userId');
      return;
    }

    // Remove from game room
    const room = this.gameRooms.get(gameId);
    if (room) {
      room.delete(userId);
      if (room.size === 0) {
        this.gameRooms.delete(gameId);
      }
    }

    // Remove client connection
    this.clients.delete(userId);

    // Notify other players
    this.broadcastToGame(gameId, {
      type: 'player_left',
      data: { userId, gameId }
    }, userId);

    logger.info(`User ${userId} left game ${gameId}`);
  }

  private handleGameAction(ws: WebSocket, message: GameMessage): void {
    const { gameId, userId, data } = message;
    
    if (!gameId || !userId) {
      this.sendError(ws, 'Missing gameId or userId');
      return;
    }

    // Broadcast game action to all players in the game
    this.broadcastToGame(gameId, {
      type: 'game_action',
      data: { userId, action: data }
    });

    logger.debug(`Game action from ${userId} in game ${gameId}`, data);
  }

  private handleChatMessage(ws: WebSocket, message: GameMessage): void {
    const { gameId, userId, data } = message;
    
    if (!gameId || !userId || !data?.message) {
      this.sendError(ws, 'Missing required chat message data');
      return;
    }

    // Broadcast chat message to all players in the game
    this.broadcastToGame(gameId, {
      type: 'chat_message',
      data: { userId, message: data.message, timestamp: new Date().toISOString() }
    });

    logger.debug(`Chat message from ${userId} in game ${gameId}`, data);
  }

  private broadcastToGame(gameId: string, message: any, excludeUserId?: string): void {
    const room = this.gameRooms.get(gameId);
    if (!room) return;

    room.forEach(userId => {
      if (userId !== excludeUserId) {
        const client = this.clients.get(userId);
        if (client && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      }
    });
  }

  private sendError(ws: WebSocket, message: string): void {
    ws.send(JSON.stringify({
      type: 'error',
      data: { message }
    }));
  }

  private handleDisconnect(ws: WebSocket): void {
    // Find and remove the disconnected client
    for (const [userId, client] of this.clients.entries()) {
      if (client === ws) {
        this.clients.delete(userId);
        
        // Remove from all game rooms
        for (const [gameId, room] of this.gameRooms.entries()) {
          if (room.has(userId)) {
            room.delete(userId);
            if (room.size === 0) {
              this.gameRooms.delete(gameId);
            } else {
              // Notify other players
              this.broadcastToGame(gameId, {
                type: 'player_disconnected',
                data: { userId, gameId }
              });
            }
          }
        }
        
        logger.info(`User ${userId} disconnected`);
        break;
      }
    }
  }

  // Public methods for external use
  public sendToUser(userId: string, message: any): void {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  public broadcastToAll(message: any): void {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.clients.keys());
  }

  public getGameParticipants(gameId: string): string[] {
    const room = this.gameRooms.get(gameId);
    return room ? Array.from(room) : [];
  }
} 