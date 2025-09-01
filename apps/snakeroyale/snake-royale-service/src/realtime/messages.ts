export const Messages = {
  // Client -> Server
  JOIN_QUEUE: 'JOIN_QUEUE',
  LEAVE_QUEUE: 'LEAVE_QUEUE',
  PLAYER_MOVE: 'player_move',
  PLAYER_BOOST: 'player_boost',
  PLAYER_EMOJI: 'player_emoji',
  HEARTBEAT: 'HEARTBEAT',

  // New protocol (auth, matchmaking, data)
  CONNECT: 'connect',
  JOIN_MATCH: 'join_match',
  MATCH_CANCEL: 'match_cancel',

  // Server -> Client (lowercase to match existing client listeners)
  LOBBY_UPDATE: 'lobby_update',
  MATCH_START: 'game_start',
  GAME_STATE: 'game_state',
  PLAYER_UPDATE: 'player_update',
  PLAYER_DEATH: 'player_death',
  ZONE_UPDATE: 'zone_update',
  LEADERBOARD_UPDATE: 'leaderboard_update',
  PELLET_SPAWN: 'pellet_spawn',
  PELLET_PICKUP: 'pellet_pickup',
  ERROR: 'error',

  // Spec responses
  CONNECT_SUCCESS: 'connect_success',
  CONNECT_ERROR: 'connect_error',
  BALANCE_UPDATE: 'balance_update',
  MATCH_FOUND: 'match_found',
  MATCH_CANCELLED: 'match_cancelled',
  MATCH_END: 'match_end',
  LEADERBOARD_REQUEST: 'leaderboard_request',
  LEADERBOARD_DATA: 'leaderboard_data',
  PROFILE_REQUEST: 'profile_request',
  PROFILE_DATA: 'profile_data'
} as const;

export type MessageType = typeof Messages[keyof typeof Messages];

export type ClientToServer =
  | { type: typeof Messages.JOIN_QUEUE; amount: 1 | 5 | 20; username?: string }
  | { type: typeof Messages.LEAVE_QUEUE }
  | { type: typeof Messages.PLAYER_MOVE; x: number; y: number }
  | { type: typeof Messages.PLAYER_BOOST; boosting: boolean }
  | { type: typeof Messages.PLAYER_EMOJI; emoji: string }
  | { type: typeof Messages.HEARTBEAT }
  | { type: typeof Messages.CONNECT; token: string }
  | { type: typeof Messages.JOIN_MATCH; entryFee: number }
  | { type: typeof Messages.MATCH_CANCEL }
  | { type: typeof Messages.LEADERBOARD_REQUEST }
  | { type: typeof Messages.PROFILE_REQUEST; userId: string };

export type ServerToClient =
  | { type: typeof Messages.LOBBY_UPDATE; amount: number; queued: number; prizePool: number; countdown?: number }
  | { type: typeof Messages.MATCH_START; matchId: string; amount: number; players: any[] }
  | { type: typeof Messages.GAME_STATE; state: 'active'; players: any[]; foods: any[]; zone: any }
  | { type: typeof Messages.PLAYER_UPDATE; player: any }
  | { type: typeof Messages.PLAYER_DEATH; playerId: string }
  | { type: typeof Messages.ZONE_UPDATE; zone: any }
  | { type: typeof Messages.LEADERBOARD_UPDATE; leaderboard: any[] }
  | { type: typeof Messages.PELLET_SPAWN; foods: any[] }
  | { type: typeof Messages.PELLET_PICKUP; playerId: string; foodId: string }
  | { type: typeof Messages.ERROR; message: string }
  | { type: typeof Messages.CONNECT_SUCCESS; userId: string; username: string; walletBalance: number }
  | { type: typeof Messages.CONNECT_ERROR; error: string }
  | { type: typeof Messages.BALANCE_UPDATE; walletBalance: number }
  | { type: typeof Messages.MATCH_FOUND; matchId: string; players: { userId: string; username: string }[] }
  | { type: typeof Messages.MATCH_CANCELLED }
  | { type: typeof Messages.MATCH_END; matchId: string; placement: number; winnings: number; newBalance: number }
  | { type: typeof Messages.LEADERBOARD_DATA; players: { rank: number; username: string; wins: number; earnings: number }[] }
  | { type: typeof Messages.PROFILE_DATA; stats: { gamesPlayed: number; wins: number; losses: number; earnings: number } };

export const WORLD = {
  width: 4000,
  height: 2000
};

