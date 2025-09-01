import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Trophy, Crown, Medal, Award } from "lucide-react";
import { ClickableUsername } from "@/components/ui/clickable-username";
import { fetchLeaderboard, type LeaderboardEntry } from "@/lib/api";

type PlayerRow = {
  rank: number;
  name: string;
  winnings: number;
  games: number;
  winrate: number; // 0..1
};

function mapEntryToPlayerRow(entry: LeaderboardEntry, index: number): PlayerRow {
  return {
    rank: index + 1,
    name: entry.username,
    winnings: Number(entry.total_pnl ?? 0),
    games: Number(entry.wins ?? 0) + Number(entry.losses ?? 0),
    winrate: Math.max(0, Math.min(1, Number(entry.win_rate ?? 0) / 100))
  };
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-6 w-6 text-yellow-400" />;
    case 2:
      return <Medal className="h-6 w-6 text-gray-300" />;
    case 3:
      return <Award className="h-6 w-6 text-amber-600" />;
    default:
      return <Trophy className="h-5 w-5 text-cyan-glow" />;
  }
};

const getRankBackground = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-400/30";
    case 2:
      return "bg-gradient-to-r from-gray-300/20 to-gray-500/20 border-gray-300/30";
    case 3:
      return "bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-600/30";
    default:
      return "bg-card/80 border-cyan-glow/20 hover:bg-cyan-glow/10";
  }
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchLeaderboard(10);
        setPlayers(data.map(mapEntryToPlayerRow));
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative pb-20" style={{ backgroundImage: 'url(/src/assets/mystical-chess-arena.png)' }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">Global Leaderboard</h1>
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="max-w-4xl mx-auto">
          {/* Season Rewards Section - Moved to top */}
          <div className="mb-6 text-center">
            <div className="bg-card/90 rounded-xl p-4 border border-cyan-glow/20">
              <h3 className="text-lg font-semibold text-cyan-glow mb-2">Season Rewards</h3>
              <p className="text-muted-foreground mb-3 text-sm">
                Top players receive exclusive rewards and recognition
              </p>
              <div className="flex justify-center gap-6 text-xs">
                <div className="text-center">
                  <div className="text-yellow-400 font-bold text-sm">🥇 1st Place</div>
                  <div className="text-muted-foreground text-xs">$500 Bonus</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-300 font-bold text-sm">🥈 2nd Place</div>
                  <div className="text-muted-foreground text-xs">$250 Bonus</div>
                </div>
                <div className="text-center">
                  <div className="text-amber-600 font-bold text-sm">🥉 3rd Place</div>
                  <div className="text-muted-foreground text-xs">$100 Bonus</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {players.map((player) => (
                             <div 
                 key={player.rank} 
                 className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${getRankBackground(player.rank)}`}
               >
                 {/* Rank and Player Info */}
                 <div className="flex items-center gap-3">
                   <div className="flex items-center justify-center w-10 h-10 rounded-full bg-card/80 border border-cyan-glow/20">
                     {getRankIcon(player.rank)}
                   </div>
                  <div>
                                                              <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-cyan-glow/40 flex items-center justify-center">
                         <span className="text-cyan-glow font-bold text-xs">P</span>
                       </div>
                       <div>
                         <ClickableUsername username={player.name} className="font-semibold text-foreground text-base">
                           {player.name}
                         </ClickableUsername>
                         <div className="text-muted-foreground text-xs">Rank #{player.rank}</div>
                       </div>
                     </div>
                  </div>
                </div>

                                 {/* Stats */}
                 <div className="text-right">
                   <div className="text-xl font-bold text-cyan-glow">
                     ${player.winnings.toLocaleString()}
                   </div>
                   <div className="text-muted-foreground text-xs">
                     {player.games} games • {Math.round(player.winrate * 100)}% win rate
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
} 