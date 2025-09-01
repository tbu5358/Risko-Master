import { useState } from "react";
import { Trophy, Crown, Medal, User } from "lucide-react";

interface Player {
  id: string;
  username: string;
  rank: number;
  winnings: number;
  avatar?: string;
}

interface LeaderboardPageProps {
  onPlayerClick: (player: Player) => void;
}

export const LeaderboardPage = ({ onPlayerClick }: LeaderboardPageProps) => {
  // Mock leaderboard data
  const players: Player[] = Array.from({ length: 10 }, (_, i) => ({
    id: `player-${i + 1}`,
    username: `Player${i + 1}`,
    rank: i + 1,
    winnings: Math.floor(Math.random() * 50000 + 10000),
  }));

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-300" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-yellow-600" />;
    return <Trophy className="h-5 w-5 text-orange-500" />;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500";
    if (rank === 2) return "bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-gray-300";
    if (rank === 3) return "bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border-yellow-600";
    return "bg-gray-900/50 border-orange-500/30";
  };

  return (
    <div className="min-h-screen p-6 bg-black">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">
          🏆 Global Leaderboard
        </h2>
        
        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.id}
              onClick={() => onPlayerClick(player)}
              className={`
                ${getRankStyle(player.rank)}
                border rounded-lg p-4 flex items-center gap-4 cursor-pointer
                hover:bg-orange-500/10 transition-all duration-200
                ${player.rank <= 3 ? 'shadow-lg' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                {getRankIcon(player.rank)}
                <div className="text-lg font-bold text-orange-400">
                  #{player.rank}
                </div>
              </div>

              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-lg">
                {player.username.charAt(0)}
              </div>

              <div className="flex-1">
                <div className="font-semibold text-white hover:text-yellow-400 transition-colors">
                  {player.username}
                </div>
                <div className="text-sm text-gray-400">
                  Rank #{player.rank}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-yellow-400 text-lg">
                  ${player.winnings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Earnings</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};