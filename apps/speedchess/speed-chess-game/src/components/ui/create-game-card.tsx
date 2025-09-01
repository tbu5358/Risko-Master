import { useState } from "react"
import { Plus, Clock, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { GameCard } from "@/components/ui/game-card"

export function CreateGameCard() {
  const [wager, setWager] = useState([10])
  const [timeControl, setTimeControl] = useState(3)
  const [isPrivate, setIsPrivate] = useState(false)
  
  const timeOptions = [3, 5]

  return (
    <GameCard className="p-6 w-96">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">Create Game</h2>
        </div>

        {/* Wager Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="font-semibold">Wager Amount</label>
            <span className="text-primary font-bold">${wager[0]}</span>
          </div>
          <Slider
            value={wager}
            onValueChange={setWager}
            max={50}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$1</span>
            <span>$50</span>
          </div>
        </div>

        {/* Time Control */}
        <div className="space-y-3">
          <h3 className="font-semibold">Time Control</h3>
          <div className="flex gap-2">
            {timeOptions.map((time) => (
              <Button
                key={time}
                variant={timeControl === time ? "mystical" : "outline"}
                onClick={() => setTimeControl(time)}
                className="flex-1"
              >
                <Clock className="mr-2 h-4 w-4" />
                {time} Minutes
              </Button>
            ))}
          </div>
        </div>

        {/* Private Match */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="private"
            checked={isPrivate}
            onCheckedChange={(checked) => setIsPrivate(checked === true)}
          />
          <label htmlFor="private" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Private Match
          </label>
        </div>

        {/* Create Button */}
        <Button variant="mystical" size="lg" className="w-full">
          <Plus className="mr-2 h-5 w-5" />
          CREATE MATCH
        </Button>
      </div>
    </GameCard>
  )
}