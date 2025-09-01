import { useAuthStore } from "@/stores/authStore";
import { useXPStore } from "@/stores/xpStore";
import { useState } from "react";

export function useGameActions() {
  const { recordMatchPlayed, recordWin, recordLeaderboardPlacement } = useAuthStore();
  const { addXP, checkLootBox } = useXPStore();
  const [showLootBox, setShowLootBox] = useState(false);

  const playMatch = (gameType: string = 'casual') => {
    recordMatchPlayed();
    addXP(10, 'match_played');
    
    if (checkLootBox()) {
      setShowLootBox(true);
    }
  };

  const winMatch = () => {
    recordWin();
    addXP(25, 'match_won');
  };

  const placeInLeaderboard = (position: number) => {
    if (position <= 3) {
      recordLeaderboardPlacement(position);
      addXP(100, 'leaderboard_top3');
    }
  };

  const simulateGameSession = () => {
    // Simulate playing a match
    playMatch();
    
    // 60% chance to win
    if (Math.random() < 0.6) {
      winMatch();
    }
    
    // 10% chance to place in top 3
    if (Math.random() < 0.1) {
      const position = Math.floor(Math.random() * 3) + 1;
      placeInLeaderboard(position);
    }
  };

  return {
    playMatch,
    winMatch,
    placeInLeaderboard,
    simulateGameSession,
    showLootBox,
    setShowLootBox
  };
}