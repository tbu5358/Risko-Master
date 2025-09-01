import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import * as supabaseService from '@/services/supabaseService';

interface AppUser {
  id: string;
  username: string;
  email: string;
  balance: number;
  level: number;
  totalXP: number;
  avatar_url?: string;
  avatar?: string; // Backward compatibility
  roles: 'user' | 'admin' | 'moderator';
  memberSince?: string; // Backward compatibility
  stats: {
    gamesPlayed: number;
    wins: number;
    winRate: number;
    totalProfits: number; // Added for compatibility
    leaderboardPlacements: number[];
  };
}

interface AuthState {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoggedIn: boolean; // Added for backward compatibility
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: any }>;
  signup: (username: string, email: string, password: string) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
  addFunds: (amount: number) => Promise<void>;
  updateUserLevel: (level: number, totalXP: number) => void;
  recordMatchPlayed: () => void;
  recordWin: () => void;
  recordLeaderboardPlacement: (position: number) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoggedIn: false,
      isLoading: true,

      initialize: () => {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);
            
            set({ session, isLoading: false });
            
            if (session?.user) {
              // Only fetch profile data after session is confirmed
              setTimeout(async () => {
                try {
                  const profile = await supabaseService.getUserProfile(session.user.id);
                  const balance = await supabaseService.getWalletBalance(session.user.id);
                  
                  if (profile) {
                    set({
                      user: {
                        id: profile.id,
                        username: profile.username,
                        email: session.user.email || '',
                        balance,
                        level: 1, // Default level
                        totalXP: 0, // Default XP
                        avatar_url: null,
                        avatar: null, // Backward compatibility
                        roles: (profile.roles?.[0] as 'user' | 'admin' | 'moderator') || 'user',
                        memberSince: new Date().toISOString(), // Backward compatibility
                        stats: {
                          gamesPlayed: 0, // TODO: Calculate from match_history
                          wins: 0, // TODO: Calculate from match_history
                          winRate: 0, // TODO: Calculate from match_history
                          totalProfits: 0, // Added for compatibility
                          leaderboardPlacements: []
                        }
                      },
                      isAuthenticated: true,
                      isLoggedIn: true
                    });
                  }
                } catch (error) {
                  console.error('Error fetching user data:', error);
                  // If profile fetch fails, create a default user with session but flag for completion
                  set({
                    user: {
                      id: session.user.id,
                      username: session.user.email?.split('@')[0] || 'user',
                      email: session.user.email || '',
                      balance: 0,
                      level: 1,
                      totalXP: 0,
                      avatar_url: null,
                      avatar: null,
                      roles: 'user',
                      memberSince: new Date().toISOString(),
                      stats: {
                        gamesPlayed: 0,
                        wins: 0,
                        winRate: 0,
                        totalProfits: 0,
                        leaderboardPlacements: []
                      }
                    },
                    isAuthenticated: true,
                    isLoggedIn: true
                  });
                }
              }, 0);
            } else {
              set({ 
                user: null, 
                isAuthenticated: false,
                isLoggedIn: false
              });
            }
          }
        );

        // THEN check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) {
            set({ isLoading: false });
          }
          // If session exists, the auth state change listener will handle it
        });

        return () => subscription.unsubscribe();
      },

      login: async (email: string, password: string) => {
        const { data, error } = await supabaseService.signIn(email, password);
        return { error };
      },

      signup: async (username: string, email: string, password: string) => {
        const { data, error } = await supabaseService.signUp(email, password, username);
        return { error };
      },

      logout: async () => {
        await supabaseService.signOut();
        set({ 
          user: null, 
          session: null,
          isAuthenticated: false,
          isLoggedIn: false
        });
      },

      addFunds: async (amount: number) => {
        const { data, error } = await supabaseService.creditWallet(amount, 'Manual deposit');
        
        if (!error && data?.new_balance !== undefined) {
          const { user } = get();
          if (user) {
            set({
              user: {
                ...user,
                balance: data.new_balance
              }
            });
          }
        }
      },

      updateUserLevel: (level: number, totalXP: number) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              level,
              totalXP
            }
          });
        }
      },

      recordMatchPlayed: () => {
        const { user } = get();
        if (user) {
          const newGamesPlayed = user.stats.gamesPlayed + 1;
          const newWinRate = newGamesPlayed > 0 ? (user.stats.wins / newGamesPlayed) * 100 : 0;
          
          set({
            user: {
              ...user,
              stats: {
                ...user.stats,
                gamesPlayed: newGamesPlayed,
                winRate: Math.round(newWinRate * 10) / 10
              }
            }
          });
        }
      },

      recordWin: () => {
        const { user } = get();
        if (user) {
          const newWins = user.stats.wins + 1;
          const newWinRate = user.stats.gamesPlayed > 0 ? (newWins / user.stats.gamesPlayed) * 100 : 0;
          
          set({
            user: {
              ...user,
              stats: {
                ...user.stats,
                wins: newWins,
                winRate: Math.round(newWinRate * 10) / 10
              }
            }
          });
        }
      },

      recordLeaderboardPlacement: (position: number) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              stats: {
                ...user.stats,
                leaderboardPlacements: [...user.stats.leaderboardPlacements, position]
              }
            }
          });
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);