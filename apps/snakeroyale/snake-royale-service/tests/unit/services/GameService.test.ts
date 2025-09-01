import { GameService } from '../../../src/services/GameService';
import { CreateGameRequest, JoinGameRequest } from '../../../src/models/Game';

// Mock Supabase client
jest.mock('../../../src/config/database', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn()
      }))
    }))
  }
}));

describe('GameService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGame', () => {
    it('should create a new game successfully', async () => {
      const mockGame = {
        id: 'test-game-id',
        creator_id: 'test-user-id',
        status: 'waiting',
        max_players: 4,
        current_players: 1,
        game_type: 'snake',
        settings: {
          board_size: 20,
          speed: 'normal',
          power_ups: true,
          obstacles: false,
          time_limit: 300
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const { supabase } = require('../../../src/config/database');
      const mockInsert = supabase.from().insert().select().single;
      mockInsert.mockResolvedValue({ data: mockGame, error: null });

      const request: CreateGameRequest = {
        creator_id: 'test-user-id',
        game_type: 'snake',
        max_players: 4
      };

      const result = await GameService.createGame(request);

      expect(result).toEqual(mockGame);
      expect(supabase.from).toHaveBeenCalledWith('games');
    });

    it('should throw error when game creation fails', async () => {
      const { supabase } = require('../../../src/config/database');
      const mockInsert = supabase.from().insert().select().single;
      mockInsert.mockResolvedValue({ data: null, error: 'Database error' });

      const request: CreateGameRequest = {
        creator_id: 'test-user-id',
        game_type: 'snake'
      };

      await expect(GameService.createGame(request)).rejects.toThrow('Failed to create game');
    });
  });

  describe('joinGame', () => {
    it('should join an existing game successfully', async () => {
      const mockGame = {
        id: 'test-game-id',
        status: 'waiting',
        current_players: 1,
        max_players: 4
      };

      const mockParticipant = {
        id: 'participant-id',
        game_id: 'test-game-id',
        user_id: 'test-user-id',
        username: 'testuser',
        score: 0,
        is_ready: false,
        joined_at: '2024-01-01T00:00:00Z'
      };

      const { supabase } = require('../../../src/config/database');
      const mockSelect = supabase.from().select;
      
      // Mock game lookup
      mockSelect.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValue({ data: mockGame, error: null })
          })
        })
      });

      // Mock participant check
      mockSelect.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      });

      // Mock participant insertion
      const mockInsert = supabase.from().insert().select().single;
      mockInsert.mockResolvedValue({ data: mockParticipant, error: null });

      const request: JoinGameRequest = {
        game_id: 'test-game-id',
        user_id: 'test-user-id',
        username: 'testuser'
      };

      const result = await GameService.joinGame(request);

      expect(result).toEqual(mockParticipant);
    });

    it('should throw error when game is full', async () => {
      const mockGame = {
        id: 'test-game-id',
        status: 'waiting',
        current_players: 4,
        max_players: 4
      };

      const { supabase } = require('../../../src/config/database');
      const mockSelect = supabase.from().select;
      
      mockSelect.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValue({ data: mockGame, error: null })
          })
        })
      });

      const request: JoinGameRequest = {
        game_id: 'test-game-id',
        user_id: 'test-user-id',
        username: 'testuser'
      };

      await expect(GameService.joinGame(request)).rejects.toThrow('Game is full');
    });
  });

  describe('getActiveGames', () => {
    it('should return active games', async () => {
      const mockGames = [
        {
          id: 'game-1',
          status: 'waiting',
          current_players: 2,
          max_players: 4
        },
        {
          id: 'game-2',
          status: 'starting',
          current_players: 3,
          max_players: 4
        }
      ];

      const { supabase } = require('../../../src/config/database');
      const mockSelect = supabase.from().select;
      
      mockSelect.mockReturnValueOnce({
        in: jest.fn().mockReturnValueOnce({
          order: jest.fn().mockReturnValueOnce({
            range: jest.fn().mockResolvedValue({ data: mockGames, error: null })
          })
        })
      });

      const result = await GameService.getActiveGames(20, 0);

      expect(result).toEqual(mockGames);
    });
  });
}); 