import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/ui/game-card"

interface JoinGameCardProps {
  onJoinClick?: () => void
}

export function JoinGameCard({ onJoinClick }: JoinGameCardProps) {
  return (
    <GameCard className="p-8 w-96">
      <div className="text-center">
        {/* Main Join Button */}
        <Button 
          variant="mystical" 
          size="lg" 
          className="w-full text-xl py-6 animate-mystical-glow font-bold"
          onClick={onJoinClick}
        >
          <Play className="mr-3 h-6 w-6" />
          JOIN GAME
        </Button>
      </div>
    </GameCard>
  )
}