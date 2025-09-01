import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Coins, Users, Trophy, Timer } from "lucide-react";
import { ws } from "@/lib/ws";

interface MatchmakingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMatchFound?: (payload?: { matchId?: string; entryFee?: number }) => void;
}

export const MatchmakingModal = ({ open, onOpenChange, onMatchFound }: MatchmakingModalProps) => {
  const [selectedBet, setSelectedBet] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [playersFound, setPlayersFound] = useState(0);
  const [searchTime, setSearchTime] = useState(0);

  const gameOptions = [
    { bet: 1, payout: 90 },
    { bet: 5, payout: 450 },
    { bet: 20, payout: 1800 }
  ];
  const maxPlayers = 100;
  const selectedGame = gameOptions.find(g => g.bet === selectedBet);

  const startMatchmaking = () => {
    // DEV: instantly start the game and provide a dummy match id
    onMatchFound?.({ matchId: `dev-${Date.now()}`, entryFee: selectedBet });
    onOpenChange(false);
    setIsSearching(false);
    setPlayersFound(0);
    setSearchTime(0);
  };

  const cancelSearch = () => {
    ws.send('match_cancel', {});
    setIsSearching(false);
    setPlayersFound(0);
    setSearchTime(0);
  };

  useEffect(() => {
    const onLobby = (d: any) => {
      // Update pseudo counters from server if needed; for now just increment
      setPlayersFound(p => Math.min(100, d?.queued ?? (p + 3)));
      setSearchTime(s => s + 1);
    };
    const onFound = () => {
      onMatchFound?.();
      onOpenChange(false);
      setIsSearching(false);
      setPlayersFound(0);
      setSearchTime(0);
    };
    const onCancelled = () => {
      setIsSearching(false);
      setPlayersFound(0);
      setSearchTime(0);
    };
    ws.on('lobby_update', onLobby);
    ws.on('match_found', onFound);
    ws.on('match_cancelled', onCancelled);
    return () => {
      ws.off('lobby_update', onLobby);
      ws.off('match_found', onFound);
      ws.off('match_cancelled', onCancelled);
    };
  }, [onMatchFound, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-md border-border shadow-game max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Join Match
          </DialogTitle>
        </DialogHeader>

        {!isSearching ? (
          <div className="space-y-6">
            {/* Game Selection */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Select Game Mode</h3>
              <div className="space-y-2">
                {gameOptions.map((game) => (
                  <div
                    key={game.bet}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedBet === game.bet 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedBet(game.bet)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-game-gold" />
                        <span className="font-semibold">${game.bet}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Prize Pool</div>
                        <div className="font-bold text-secondary">${game.payout}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Match Info */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entry Fee:</span>
                <span className="font-semibold text-game-gold flex items-center gap-1">
                  <Coins className="h-4 w-4" />
                  ${selectedBet}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prize Pool:</span>
                <span className="font-semibold text-secondary flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  ${selectedGame?.payout}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Players:</span>
                <span className="font-semibold flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  100
                </span>
              </div>
            </div>

            {/* Rules */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Last snake standing wins majority of the prize pool</p>
              <p>• Top 5 players receive partial rewards</p>
              <p>• Match starts when 100 players join</p>
            </div>

            <Button 
              variant="default" 
              size="lg" 
              className="w-full"
              onClick={startMatchmaking}
            >
              Find Match
            </Button>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            {/* Searching Animation */}
            <div className="space-y-4">
              <div className="animate-pulse-glow">
                <Users className="h-12 w-12 mx-auto text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Finding Players...</h3>
                <p className="text-muted-foreground">Search Time: {searchTime}s</p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Players Found</span>
                <span className="font-semibold">{playersFound}/{maxPlayers}</span>
              </div>
              <Progress value={(playersFound / maxPlayers) * 100} className="h-3" />
            </div>

            {/* Current Match Info */}
            <div className="bg-muted/30 rounded-lg p-3 text-sm">
              <div className="flex justify-between mb-2">
                <span>Your Entry Fee:</span>
                <Badge variant="outline" className="border-game-gold text-game-gold">
                  <Coins className="h-3 w-3 mr-1" />
                  ${selectedBet}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Estimated Prize:</span>
                <Badge variant="outline" className="border-secondary text-secondary">
                  <Trophy className="h-3 w-3 mr-1" />
                  ${selectedGame?.payout}
                </Badge>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="lg" 
              className="w-full"
              onClick={cancelSearch}
            >
              Cancel Search
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};