import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { User } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProfileStats } from "@/lib/api";

interface RecentMatch {
  id: string;
  matchId: string;
  timeAgo: string;
  result: "win" | "loss";
  amount?: number;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"recent" | "wins" | "losses">("recent");
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: userId || "Me", avatar: "U", totalEarnings: 0, gamesWon: 0, gamesPlayed: 0, winRate: 0 });
  const isOwnProfile = !userId; // If no userId, it's the user's own profile

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const username = (userId || "me").toString();
        const stats = await fetchProfileStats(username);
        if (cancelled) return;
        setUser({
          name: stats.username,
          avatar: (stats.username || "U").slice(0, 1).toUpperCase(),
          totalEarnings: Number(stats.total_pnl || 0),
          gamesWon: Number(stats.wins || 0),
          gamesPlayed: Number(stats.wins || 0) + Number(stats.losses || 0),
          winRate: Number(stats.win_rate || 0),
        });
      } catch {}
    })();
    return () => { cancelled = true };
  }, [userId]);

  const recentMatches: RecentMatch[] = [
    { id: "1", matchId: "#39", timeAgo: "15d ago", result: "win", amount: 435 },
    { id: "2", matchId: "#1", timeAgo: "27d ago", result: "win", amount: 128 },
    { id: "3", matchId: "#90", timeAgo: "1mo ago", result: "win", amount: 482 },
    { id: "4", matchId: "#156", timeAgo: "2mo ago", result: "loss" },
    { id: "5", matchId: "#155", timeAgo: "2mo ago", result: "loss" },
    { id: "6", matchId: "#154", timeAgo: "2mo ago", result: "loss" },
    { id: "7", matchId: "#153", timeAgo: "2mo ago", result: "loss" },
    { id: "8", matchId: "#152", timeAgo: "2mo ago", result: "loss" }
  ];

  const biggestWins: RecentMatch[] = [
    { id: "1", matchId: "#90", timeAgo: "1mo ago", result: "win", amount: 482 },
    { id: "2", matchId: "#39", timeAgo: "15d ago", result: "win", amount: 435 },
    { id: "3", matchId: "#1", timeAgo: "27d ago", result: "win", amount: 128 },
    { id: "4", matchId: "#85", timeAgo: "1mo ago", result: "win", amount: 95 },
    { id: "5", matchId: "#78", timeAgo: "2mo ago", result: "win", amount: 87 }
  ];

  const biggestLosses: RecentMatch[] = [
    { id: "1", matchId: "#156", timeAgo: "2mo ago", result: "loss" },
    { id: "2", matchId: "#155", timeAgo: "2mo ago", result: "loss" },
    { id: "3", matchId: "#154", timeAgo: "2mo ago", result: "loss" },
    { id: "4", matchId: "#153", timeAgo: "2mo ago", result: "loss" },
    { id: "5", matchId: "#152", timeAgo: "2mo ago", result: "loss" }
  ];

  const getActiveMatches = () => {
    switch (activeTab) {
      case "recent":
        return recentMatches;
      case "wins":
        return biggestWins;
      case "losses":
        return biggestLosses;
      default:
        return recentMatches;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "recent":
        return "Recent Matches";
      case "wins":
        return "Biggest Wins";
      case "losses":
        return "Biggest Losses";
      default:
        return "Recent Matches";
    }
  };



  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative pb-20" style={{ backgroundImage: 'url(/src/assets/mystical-chess-arena.png)' }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <User className="h-8 w-8 text-electric-blue" />
              <h1 className="text-3xl font-bold text-metallic-silver">
                {isOwnProfile ? "My Profile" : `${user.name}'s Profile`}
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">


          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-midnight-dark/70 backdrop-blur-md rounded-xl p-4 border border-electric-blue/20 text-center">
              <div className="text-2xl font-bold text-premium-gold">${user.totalEarnings.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Earnings</div>
            </div>
            <div className="bg-midnight-dark/70 backdrop-blur-md rounded-xl p-4 border border-electric-blue/20 text-center">
              <div className="text-2xl font-bold text-electric-blue">{user.gamesWon}</div>
              <div className="text-sm text-muted-foreground">Games Won</div>
            </div>
            <div className="bg-midnight-dark/70 backdrop-blur-md rounded-xl p-4 border border-electric-blue/20 text-center">
              <div className="text-2xl font-bold text-metallic-silver">{user.gamesPlayed}</div>
              <div className="text-sm text-muted-foreground">Games Played</div>
            </div>
            <div className="bg-midnight-dark/70 backdrop-blur-md rounded-xl p-4 border border-electric-blue/20 text-center">
              <div className="text-2xl font-bold text-burnt-orange">{user.winRate}%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
          </div>



          {/* Match History Tabs */}
          <div>
            <div className="flex gap-2 mb-3">
              <Button
                onClick={() => setActiveTab("recent")}
                variant={activeTab === "recent" ? "default" : "outline"}
                size="sm"
                className={`${
                  activeTab === "recent"
                    ? "bg-electric-blue text-black hover:bg-electric-blue/90"
                    : "bg-midnight-dark/50 text-metallic-silver border-electric-blue/20 hover:bg-electric-blue/10"
                }`}
              >
                Recent
              </Button>
              <Button
                onClick={() => setActiveTab("wins")}
                variant={activeTab === "wins" ? "default" : "outline"}
                size="sm"
                className={`${
                  activeTab === "wins"
                    ? "bg-electric-blue text-black hover:bg-electric-blue/90"
                    : "bg-midnight-dark/50 text-metallic-silver border-electric-blue/20 hover:bg-electric-blue/10"
                }`}
              >
                Wins
              </Button>
              <Button
                onClick={() => setActiveTab("losses")}
                variant={activeTab === "losses" ? "default" : "outline"}
                size="sm"
                className={`${
                  activeTab === "losses"
                    ? "bg-electric-blue text-black hover:bg-electric-blue/90"
                    : "bg-midnight-dark/50 text-metallic-silver border-electric-blue/20 hover:bg-electric-blue/10"
                }`}
              >
                Losses
              </Button>
            </div>

            <h3 className="text-lg font-semibold text-metallic-silver mb-3">{getTabTitle()}</h3>
            <div className="space-y-2">
              {getActiveMatches().map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 rounded-xl bg-midnight-dark/70 backdrop-blur-md border border-electric-blue/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-midnight-dark flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">{match.matchId}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-metallic-silver text-sm">Match {match.matchId}</div>
                      <div className="text-xs text-muted-foreground">{match.timeAgo}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {match.result === "win" ? (
                      <div className="text-green-400 font-semibold text-sm">+${match.amount}</div>
                    ) : (
                      <div className="text-red-400 font-semibold text-sm">Eliminated</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
} 