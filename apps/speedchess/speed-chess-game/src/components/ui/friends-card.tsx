import { useState } from "react"
import { Users, UserPlus, Swords, Clock, Lock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/ui/game-card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

export function FriendsCard() {
  const friends = [
    { name: "player1", status: "online", statusText: "In Menu" },
    { name: "chessmaster", status: "in-game", statusText: "Playing" },
    { name: "knight_rider", status: "offline", statusText: "Offline" }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-cyan-glow"
      case "in-game": return "bg-neon-blue"
      case "offline": return "bg-muted-foreground"
      default: return "bg-muted-foreground"
    }
  }

  const [addModal, setAddModal] = useState(false)
  const [challengeModal, setChallengeModal] = useState<string | null>(null)
  const [searchName, setSearchName] = useState("")
  const [challengeState, setChallengeState] = useState<"idle"|"sent">("idle")
  const [challengeWager, setChallengeWager] = useState([10]);
  const [challengeTime, setChallengeTime] = useState(3);
  const [challengePrivate, setChallengePrivate] = useState(false);
  const [challengeSent, setChallengeSent] = useState(false);
  const timeOptions = [3, 5];

  return (
    <GameCard className="p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-full">
      <div className="space-y-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-cyan-glow" />
          <span className="font-semibold text-foreground">Friends</span>
        </div>

        {/* Friends List */}
        {friends.length > 0 ? (
          <div className="space-y-3 flex-1">
            {friends.map((friend, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-cyan-glow/5 transition-all duration-200 border border-muted/10 hover:border-cyan-glow/20">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(friend.status)}`} />
                  <div>
                    <div className="text-sm font-medium text-foreground">{friend.name}</div>
                    <div className="text-xs text-muted-foreground">{friend.statusText}</div>
                  </div>
                </div>
                {friend.status === "online" && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs px-2 py-1 h-7 bg-midnight-blue hover:bg-cyan-glow/10 text-cyan-glow border-cyan-glow/30 hover:border-cyan-glow/50 transition-all duration-300"
                    onClick={() => { setChallengeModal(friend.name); setChallengeState("idle") }}
                  >
                    <Swords className="h-3 w-3 mr-1" />
                    Challenge
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">No friends... add some!</p>
          </div>
        )}

        {/* Add Friends Button */}
        <Button 
          variant="outline" 
          className="w-full bg-midnight-blue hover:bg-cyan-glow/10 text-cyan-glow border-cyan-glow/30 hover:border-cyan-glow/50 transition-all duration-300"
          onClick={() => setAddModal(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Friends
        </Button>
      </div>
      {/* Add Friend Modal */}
      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Add a Friend</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-glow"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              placeholder="Enter username"
              maxLength={16}
            />
            <Button
              className="w-full bg-cyan-glow text-black font-bold hover:bg-cyan-glow/80 transition"
              disabled={!searchName.trim()}
              onClick={() => setAddModal(false)}
            >
              Send Friend Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Challenge Friend Modal */}
      <Dialog open={!!challengeModal} onOpenChange={v => { if (!v) { setChallengeModal(null); setChallengeSent(false); } }}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Challenge {challengeModal}</DialogTitle>
          </DialogHeader>
          {!challengeSent ? (
            <div className="flex flex-col gap-4 mt-2">
              {/* Wager Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold">Wager Amount</label>
                  <span className="text-primary font-bold">${challengeWager[0]}</span>
                </div>
                <Slider
                  value={challengeWager}
                  onValueChange={setChallengeWager}
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
              <div className="space-y-2">
                <h3 className="font-semibold">Time Control</h3>
                <div className="flex gap-2">
                  {timeOptions.map((time) => (
                    <Button
                      key={time}
                      variant={challengeTime === time ? "mystical" : "outline"}
                      onClick={() => setChallengeTime(time)}
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
                  id="private-challenge"
                  checked={challengePrivate}
                  onCheckedChange={(checked) => setChallengePrivate(checked === true)}
                />
                <label htmlFor="private-challenge" className="text-sm font-medium leading-none flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Private Match
                </label>
              </div>
              <Button
                className="w-full bg-cyan-glow text-black font-bold hover:bg-cyan-glow/80 transition"
                onClick={() => setChallengeSent(true)}
              >
                <Plus className="mr-2 h-5 w-5" />
                Send Challenge
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-2 items-center">
              <div className="text-lg text-cyan-glow font-semibold">Waiting on <span className="font-bold">{challengeModal}</span> to accept…</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </GameCard>
  )
}