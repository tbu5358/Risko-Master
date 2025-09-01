import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface XPState {
  currentXP: number;
  level: number;
  totalXP: number;
  dailyLoginStreak: number;
  lastLoginDate: string;
  weeklyXP: number;
  weeklyMatchesPlayed: number;
  lootBoxProgress: number;
  flashLobbyActive: boolean;
  flashLobbyEndTime: number;
  addXP: (amount: number, reason: string) => void;
  checkDailyLogin: () => void;
  getXPForLevel: (level: number) => number;
  getLevelFromXP: (xp: number) => number;
  getXPProgress: () => { current: number; required: number; percentage: number };
  getDailyLoginReward: () => number;
  checkLootBox: () => boolean;
  activateFlashLobby: (durationMinutes: number) => void;
  resetWeeklyStats: () => void;
}

// XP requirements scale exponentially: Level n = 100 * (1.5^(n-1))
const getXPForLevel = (level: number): number => {
  if (level <= 1) return 100;
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

const getLevelFromXP = (totalXP: number): number => {
  let level = 1;
  let requiredXP = 0;
  
  while (requiredXP <= totalXP) {
    requiredXP += getXPForLevel(level);
    if (requiredXP > totalXP) break;
    level++;
  }
  
  return level;
};

export const useXPStore = create<XPState>()(
  persist(
    (set, get) => ({
      currentXP: 0,
      level: 1,
      totalXP: 0,
      dailyLoginStreak: 0,
      lastLoginDate: '',
      weeklyXP: 0,
      weeklyMatchesPlayed: 0,
      lootBoxProgress: 0,
      flashLobbyActive: false,
      flashLobbyEndTime: 0,

      addXP: (amount: number, reason: string) => {
        const state = get();
        const isFlashLobby = state.flashLobbyActive && Date.now() < state.flashLobbyEndTime;
        const multiplier = isFlashLobby ? 2 : 1;
        const finalAmount = amount * multiplier;
        
        const newTotalXP = state.totalXP + finalAmount;
        const newLevel = getLevelFromXP(newTotalXP);
        const levelXPRequired = getXPForLevel(newLevel);
        const previousLevelXP = newLevel > 1 ? getXPForLevel(newLevel - 1) : 0;
        const newCurrentXP = newTotalXP - (newTotalXP - levelXPRequired + previousLevelXP);
        
        set({
          currentXP: newCurrentXP,
          level: newLevel,
          totalXP: newTotalXP,
          weeklyXP: state.weeklyXP + finalAmount,
          lootBoxProgress: reason === 'match_played' ? state.lootBoxProgress + 1 : state.lootBoxProgress
        });

        // Show level up notification if level increased
        if (newLevel > state.level) {
          console.log(`🎉 Level Up! You are now level ${newLevel}!`);
        }
      },

      checkDailyLogin: () => {
        const today = new Date().toDateString();
        const state = get();
        
        if (state.lastLoginDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          const isConsecutive = state.lastLoginDate === yesterday.toDateString();
          const newStreak = isConsecutive ? state.dailyLoginStreak + 1 : 1;
          const loginReward = get().getDailyLoginReward();
          
          set({
            lastLoginDate: today,
            dailyLoginStreak: newStreak
          });
          
          get().addXP(loginReward, 'daily_login');
        }
      },

      getXPForLevel,
      getLevelFromXP,

      getXPProgress: () => {
        const state = get();
        const currentLevelXP = getXPForLevel(state.level);
        const percentage = (state.currentXP / currentLevelXP) * 100;
        
        return {
          current: state.currentXP,
          required: currentLevelXP,
          percentage: Math.min(percentage, 100)
        };
      },

      getDailyLoginReward: () => {
        const streak = get().dailyLoginStreak;
        return 5 + Math.min(streak * 2, 20); // Base 5 XP + 2 per streak day, max 25 XP
      },

      checkLootBox: () => {
        const state = get();
        if (state.lootBoxProgress >= 10) {
          set({ lootBoxProgress: 0 });
          return true;
        }
        return false;
      },

      activateFlashLobby: (durationMinutes: number) => {
        set({
          flashLobbyActive: true,
          flashLobbyEndTime: Date.now() + (durationMinutes * 60 * 1000)
        });
      },

      resetWeeklyStats: () => {
        set({
          weeklyXP: 0,
          weeklyMatchesPlayed: 0
        });
      }
    }),
    {
      name: 'xp-storage',
    }
  )
);