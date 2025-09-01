import { supabase } from '../config/database';
import { logger } from '../utils/logger';
import { 
  Game, 
  GameParticipant, 
  CreateGameRequest, 
  JoinGameRequest,
  GameStatus,
  DEFAULT_GAME_SETTINGS,
  GameResult
} from '../models/Game';

export class GameService {
  /**
   * Create a new game
   */
  static async createGame(request: CreateGameRequest): Promise<Game> {
    try {
      const gameData = {
        creator_id: request.creator_id,
        status: 'waiting' as GameStatus,
        max_players: request.max_players || 4,
        current_players: 1,
        game_type: request.game_type,
        settings: { ...DEFAULT_GAME_SETTINGS, ...request.settings },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: game, error } = await supabase
        .from('games')
        .insert(gameData)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create game', error);
        throw new Error('Failed to create game');
      }

      // Add creator as first participant
      await this.addParticipant(game.id, {
        user_id: request.creator_id,
        username: 'Creator', // This should come from user service
        is_ready: true,
      });

      logger.info(`Game created successfully: ${game.id}`);
      return game;
    } catch (error) {
      logger.error('Error creating game', error);
      throw error;
    }
  }

  /**
   * Join an existing game
   */
  static async joinGame(request: JoinGameRequest): Promise<GameParticipant> {
    try {
      // Check if game exists and has space
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', request.game_id)
        .eq('status', 'waiting')
        .single();

      if (gameError || !game) {
        throw new Error('Game not found or not available');
      }

      // Check if user is already in the game
      const { data: existingParticipant } = await supabase
        .from('game_participants')
        .select('*')
        .eq('game_id', request.game_id)
        .eq('user_id', request.user_id)
        .single();

      if (existingParticipant) {
        throw new Error('User already in game');
      }

      // Check if game is full
      if (game.current_players >= game.max_players) {
        throw new Error('Game is full');
      }

      // Add participant
      const participant = await this.addParticipant(request.game_id, {
        user_id: request.user_id,
        username: request.username,
        is_ready: false,
      });

      // Update game player count
      await supabase
        .from('games')
        .update({ 
          current_players: game.current_players + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.game_id);

      logger.info(`User ${request.user_id} joined game ${request.game_id}`);
      return participant;
    } catch (error) {
      logger.error('Error joining game', error);
      throw error;
    }
  }

  /**
   * Leave a game
   */
  static async leaveGame(gameId: string, userId: string): Promise<void> {
    try {
      // Remove participant
      const { error: participantError } = await supabase
        .from('game_participants')
        .update({ 
          left_at: new Date().toISOString(),
          is_ready: false
        })
        .eq('game_id', gameId)
        .eq('user_id', userId);

      if (participantError) {
        logger.error('Failed to update participant', participantError);
      }

      // Update game player count
      const { data: game } = await supabase
        .from('games')
        .select('current_players')
        .eq('id', gameId)
        .single();

      if (game) {
        await supabase
          .from('games')
          .update({ 
            current_players: Math.max(0, game.current_players - 1),
            updated_at: new Date().toISOString()
          })
          .eq('id', gameId);
      }

      logger.info(`User ${userId} left game ${gameId}`);
    } catch (error) {
      logger.error('Error leaving game', error);
      throw error;
    }
  }

  /**
   * Get active games
   */
  static async getActiveGames(limit: number = 20, offset: number = 0): Promise<Game[]> {
    try {
      const { data: games, error } = await supabase
        .from('games')
        .select(`
          *,
          game_participants (
            user_id,
            username,
            score,
            is_ready
          )
        `)
        .in('status', ['waiting', 'starting'])
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Failed to get active games', error);
        throw new Error('Failed to get active games');
      }

      return games || [];
    } catch (error) {
      logger.error('Error getting active games', error);
      throw error;
    }
  }

  /**
   * Get game by ID
   */
  static async getGameById(gameId: string): Promise<Game | null> {
    try {
      const { data: game, error } = await supabase
        .from('games')
        .select(`
          *,
          game_participants (
            user_id,
            username,
            score,
            is_ready,
            joined_at
          )
        `)
        .eq('id', gameId)
        .single();

      if (error) {
        logger.error('Failed to get game', error);
        return null;
      }

      return game;
    } catch (error) {
      logger.error('Error getting game', error);
      return null;
    }
  }

  /**
   * Start a game
   */
  static async startGame(gameId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('games')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', gameId);

      if (error) {
        logger.error('Failed to start game', error);
        throw new Error('Failed to start game');
      }

      logger.info(`Game ${gameId} started`);
    } catch (error) {
      logger.error('Error starting game', error);
      throw error;
    }
  }

  /**
   * End a game with results
   */
  static async endGame(gameId: string, result: GameResult): Promise<void> {
    try {
      const { error } = await supabase
        .from('games')
        .update({
          status: 'finished',
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', gameId);

      if (error) {
        logger.error('Failed to end game', error);
        throw new Error('Failed to end game');
      }

      // Store game results (you might want a separate table for this)
      logger.info(`Game ${gameId} ended with winner: ${result.winner_id}`);
    } catch (error) {
      logger.error('Error ending game', error);
      throw error;
    }
  }

  /**
   * Add participant to game
   */
  private static async addParticipant(
    gameId: string, 
    participantData: { user_id: string; username: string; is_ready: boolean }
  ): Promise<GameParticipant> {
    const { data: participant, error } = await supabase
      .from('game_participants')
      .insert({
        game_id: gameId,
        user_id: participantData.user_id,
        username: participantData.username,
        score: 0,
        is_ready: participantData.is_ready,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to add participant', error);
      throw new Error('Failed to add participant');
    }

    return participant;
  }
} 