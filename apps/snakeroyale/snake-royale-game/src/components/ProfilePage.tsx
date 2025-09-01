import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Target, Zap } from "lucide-react";

interface ProfilePageProps {
  player?: {
    username: string;
    level: number;
    xp: number;
    maxXp: number;
    winnings: number;
    gamesPlayed: number;
    gamesWon: number;
    rank: string;
    avatar?: string;
  };
  isOwnProfile?: boolean;
}

export const ProfilePage = ({ 
  player = {
    username: "SnakeHunter",
    level: 15,
    xp: 2450,
    maxXp: 3000,
    winnings: 15750,
    gamesPlayed: 156,
    gamesWon: 47,
    rank: "Diamond"
  },
  isOwnProfile = true 
}: ProfilePageProps) => {
  const xpProgress = (player.xp / player.maxXp) * 100;
  const winRate = Math.round((player.gamesWon / player.gamesPlayed) * 100);

  // Mock badges
  const badges = [
    { name: "First Win", icon: Trophy, color: "text-yellow-400" },
    { name: "Win Streak", icon: Zap, color: "text-orange-400" },
    { name: "Top 10", icon: Crown, color: "text-yellow-400" },
    { name: "Marksman", icon: Target, color: "text-orange-400" },
  ];

  // Mock recent matches
  const recentMatches = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    rank: Math.floor(Math.random() * 100) + 1,
    prize: i < 3 ? Math.floor(Math.random() * 500 + 100) : 0,
    date: `${Math.floor(Math.random() * 30) + 1}d ago`
  }));

  return (
    <div className="min-h-screen p-6 bg-black">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-black text-3xl font-bold mx-auto mb-4">
            {player.username.charAt(0)}
          </div>
          <h2 className="text-3xl font-bold text-yellow-400">
            {player.username}
          </h2>
          <div className="text-gray-400">Level {player.level} • {player.rank}</div>
        </div>

        {/* XP Progress */}
        <div className="bg-gray-900/50 border border-orange-500/30 rounded-lg p-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>XP Progress</span>
            <span>{player.xp} / {player.maxXp}</span>
          </div>
          <Progress 
            value={xpProgress} 
            className="h-3 bg-gray-800"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/50 border border-orange-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              ${player.winnings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Earnings</div>
          </div>
          <div className="bg-gray-900/50 border border-orange-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{player.gamesWon}</div>
            <div className="text-sm text-gray-400">Games Won</div>
          </div>
          <div className="bg-gray-900/50 border border-orange-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{player.gamesPlayed}</div>
            <div className="text-sm text-gray-400">Games Played</div>
          </div>
          <div className="bg-gray-900/50 border border-orange-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{winRate}%</div>
            <div className="text-sm text-gray-400">Win Rate</div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-gray-900/50 border border-orange-500/30 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-400 mb-4">Badges & Achievements</h3>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                  <Icon className={`h-6 w-6 ${badge.color}`} />
                  <div>
                    <div className="font-medium text-white">{badge.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-gray-900/50 border border-orange-500/30 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-400 mb-4">Recent Matches</h3>
          <div className="space-y-2">
            {recentMatches.map((match) => (
              <div key={match.id} className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">#{match.rank}</span>
                  <span className="text-sm text-white">Match #{match.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{match.date}</span>
                  <span className={`text-sm font-semibold ${
                    match.prize > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {match.prize > 0 ? `+$${match.prize}` : 'Eliminated'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};