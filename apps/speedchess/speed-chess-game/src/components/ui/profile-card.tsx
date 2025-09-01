import { User } from "lucide-react"
import { GameCard } from "@/components/ui/game-card"

export function ProfileCard() {
  const playerName = "Player123"
  const stats = {
    wins: 24,
    losses: 8,
    totalWon: 1250.00,
    totalLost: 320.00
  }

  return (
    <GameCard className="p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-full">
      <div className="space-y-6 h-full flex flex-col">
        {/* Header with Player Name */}
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-cyan-glow" />
          <span className="font-semibold text-foreground">{playerName}</span>
        </div>

        {/* Stats */}
        <div className="space-y-4 flex-1">
          {/* Wins/Losses */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Wins</div>
              <div className="text-xl font-semibold text-cyan-glow">{stats.wins}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Losses</div>
              <div className="text-xl font-semibold text-muted-foreground">{stats.losses}</div>
            </div>
          </div>

          {/* Total Won/Lost */}
          <div className="space-y-3 pt-2 border-t border-muted/20">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Won:</span>
              <span className="font-semibold text-cyan-glow">${stats.totalWon.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Lost:</span>
              <span className="font-semibold text-muted-foreground">${stats.totalLost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </GameCard>
  )
}