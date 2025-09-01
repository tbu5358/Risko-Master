export interface Game {
  id: string;
  creator_id: string;
  status: GameStatus;
  max_players: number;
  current_players: number;
  game_type: GameType;
  settings: GameSettings;
  created_at: string;
  updated_at: string;
  started_at?: string;
  ended_at?: string;
}

export interface GameParticipant {
  id: string;
  game_id: string;
  user_id: string;
  username: string;
  score: number;
  is_ready: boolean;
  joined_at: string;
  left_at?: string;
}

export interface GameSettings {
  board_size: number;
  speed: GameSpeed;
  power_ups: boolean;
  obstacles: boolean;
  time_limit?: number; // in seconds
}

export type GameStatus = 'waiting' | 'starting' | 'active' | 'paused' | 'finished' | 'cancelled';
export type GameType = 'snake' | 'snake_royale' | 'custom';
export type GameSpeed = 'slow' | 'normal' | 'fast' | 'extreme';

export interface CreateGameRequest {
  creator_id: string;
  game_type: GameType;
  max_players?: number;
  settings?: Partial<GameSettings>;
}

export interface JoinGameRequest {
  game_id: string;
  user_id: string;
  username: string;
}

export interface GameAction {
  type: 'move' | 'power_up' | 'chat' | 'ready' | 'pause' | 'resume';
  data: any;
  timestamp: string;
}

export interface GameResult {
  game_id: string;
  winner_id?: string;
  participants: GameParticipant[];
  duration: number; // in seconds
  final_scores: Record<string, number>;
  game_data: any; // Additional game-specific data
}

// Default game settings
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  board_size: 20,
  speed: 'normal',
  power_ups: true,
  obstacles: false,
  time_limit: 300, // 5 minutes
};

// Game validation schemas
export const GAME_VALIDATION_SCHEMAS = {
  createGame: {
    creator_id: 'uuid',
    game_type: ['snake', 'snake_royale', 'custom'],
    max_players: { min: 2, max: 8 },
    settings: 'object'
  },
  joinGame: {
    game_id: 'uuid',
    user_id: 'uuid',
    username: { min: 3, max: 50 }
  }
}; 