import { Trophy, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GameCard } from "@/components/ui/game-card"
import { useNavigate } from "react-router-dom"

export function LeaderboardCard() {
  const navigate = useNavigate();
  const topPlayers = [
    { rank: 1, name: "aj", winnings: 1610.39 },
    { rank: 2, name: "dth", winnings: 987.02 },
    { rank: 3, name: "1dollar", winnings: 922.44 }
  ]

  return (
    <GameCard className="p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-full">
      <div className="space-y-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-cyan-glow" />
            <span className="font-semibold text-foreground">Leaderboard</span>
          </div>
          <Badge variant="secondary" className="bg-cyan-glow/10 text-cyan-glow border-cyan-glow/30">
            <div className="w-2 h-2 bg-cyan-glow rounded-full mr-2 animate-pulse"></div>
            Live
          </Badge>
        </div>

        {/* Top Players */}
        <div className="space-y-3 flex-1">
          {topPlayers.map((player) => (
            <div key={player.rank} className="flex items-center justify-between p-3 rounded-lg hover:bg-cyan-glow/5 transition-colors border border-muted/10 hover:border-cyan-glow/20">
              <div className="flex items-center gap-3">
                <span className="font-bold text-cyan-glow w-6">{player.rank}.</span>
                <span className="font-medium text-foreground">{player.name}</span>
              </div>
              <div className="flex items-center gap-1 text-cyan-glow font-semibold text-sm">
                <TrendingUp className="h-4 w-4" />
                ${player.winnings.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* View Full Button */}
        <Button 
          variant="outline" 
          className="w-full bg-midnight-blue hover:bg-cyan-glow/10 text-cyan-glow border-cyan-glow/30 hover:border-cyan-glow/50 transition-all duration-300"
          onClick={() => navigate("/leaderboard")}
        >
          View Full Leaderboard
        </Button>
      </div>
    </GameCard>
  )
}