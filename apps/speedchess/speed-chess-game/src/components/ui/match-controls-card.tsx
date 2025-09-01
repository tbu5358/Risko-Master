
import { useState, useEffect, useCallback } from "react"
import { Play, Plus, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GameCard } from "@/components/ui/game-card"
import { useNavigate } from "react-router-dom"
import { useGameSocket } from "@/lib/useMockGameSocket"
import { useLobbyManager, LobbyEvent, LobbyMatch } from "@/lib/useLobbyManager"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { generateUniqueUsername } from "@/lib/utils"

interface MatchControlsCardProps {
  onJoinClick?: () => void;
  onCreateMatch?: (wager: number, time: number) => void;
}

export function MatchControlsCard({ onJoinClick, onCreateMatch }: MatchControlsCardProps) {
  const [selectedWager, setSelectedWager] = useState(5)
  const [timeControl, setTimeControl] = useState(3)
  const [balance, setBalance] = useState(5.00);
  useEffect(() => {
    function updateBalance() {
      let wallet = { usd: 5.00 };
      try {
        const walletRaw = sessionStorage.getItem("walletBalance");
        if (walletRaw) wallet = JSON.parse(walletRaw);
      } catch {}
      setBalance(wallet.usd);
    }
    updateBalance();
    window.addEventListener("focus", updateBalance);
    return () => window.removeEventListener("focus", updateBalance);
  }, []);
  
  const wagerOptions = [1, 5, 20]
  const playersOnline = 142
  const totalWinnings = 25750

  const canAffordWager = balance >= selectedWager

  const [joinableMatches, setJoinableMatches] = useState<any[]>([]);
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  const [joinMatchId, setJoinMatchId] = useState<string | null>(null);
  const [opponentJoined, setOpponentJoined] = useState(false);

  let username = generateUniqueUsername();

  // Lobby Manager WebSocket
  const handleLobbyEvent = useCallback((event: LobbyEvent) => {
    console.log('[MatchControlsCard] Received lobby event:', event);
    
    switch (event.type) {
      case 'match-created':
        console.log('[MatchControlsCard] Match created:', event.match);
        setJoinableMatches(prev => [...prev, event.match].slice(0, 3));
        break;
      case 'match-joined':
        console.log('[MatchControlsCard] Match joined:', event.matchId, event.playerBlack);
        // Remove joined match from list
        setJoinableMatches(prev => prev.filter(match => match.id !== event.matchId));
        break;
      case 'match-removed':
        console.log('[MatchControlsCard] Match removed:', event.matchId);
        setJoinableMatches(prev => prev.filter(match => match.id !== event.matchId));
        break;
      case 'match-updated':
        console.log('[MatchControlsCard] Match updated:', event.match);
        setJoinableMatches(prev => 
          prev.map(match => match.id === event.match.id ? event.match : match)
        );
        break;
      case 'lobby-error':
        console.error('[MatchControlsCard] Lobby error:', event.message);
        break;
    }
  }, []);

  const lobbyManager = useLobbyManager({
    username,
    onEvent: handleLobbyEvent,
  });

  // --- SOCKET LOGIC FOR JOIN ---
  const joinSocket = useGameSocket({
    matchId: joinMatchId || "",
    myColor: "black",
    onEvent: (event) => {
      if (event.type === "start" && event.color === "white") {
        // Received match config from creator
        sessionStorage.setItem("matchConfig", JSON.stringify({ matchId: joinMatchId, wager: event.wager, timePerSide: event.timePerSide, color: "black" }));
        setOpponentJoined(true);
        // Don't navigate directly - let the lobby waiting screen handle navigation
      }
    },
    username,
  });

  // On mount, refresh available matches from WebSocket
  useEffect(() => {
    if (lobbyManager.connected) {
      lobbyManager.refreshMatches();
    }
  }, [lobbyManager.connected]);

  // Patch onCreateMatch to update joinableMatches immediately
  function handleCreateMatchPatched(wager: number, time: number) {
    if (onCreateMatch) {
      onCreateMatch(wager, time);
      // Matches will be updated via WebSocket events
    }
  }

  return (
    <GameCard className="p-6 w-full max-w-md mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-[520px] flex flex-col">
      <Tabs defaultValue="join" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="join">Join Match</TabsTrigger>
          <TabsTrigger value="create">Create Match</TabsTrigger>
        </TabsList>
        
        <TabsContent value="join" className="flex flex-col h-[520px]">
          <div className="flex-1 flex flex-col gap-y-6">
            {/* Quick Join Section */}
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Quick Join Rows */}
              <div className="space-y-3 flex-1">
                {joinableMatches.length === 0 && (
                  <div className="text-center text-muted-foreground">No matches available. Please wait for someone to create a match.</div>
                )}
                {joinableMatches.map((match: any) => {
                  const isLocked = balance < match.wager;
                  return (
                    <div key={match.id} className="bg-black/60 backdrop-blur-sm border border-cyan-glow/30 rounded-lg p-4 hover:bg-black/70 hover:shadow-[0_0_15px_rgba(0,224,255,0.2)] transition-all duration-300 hover:border-cyan-glow/50 hover:scale-[1.02]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-cyan-glow">👤</div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{match.playerWhite}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span className="flex items-center gap-1">⏱ {match.timePerSide === 180 ? '3 Min' : match.timePerSide === 300 ? '5 Min' : ''}</span>
                              <span className="flex items-center gap-1">💰 ${match.wager}</span>
                            </div>
                          </div>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                variant={isLocked || match.hasActivePlayers === false ? "outline" : "mystical"}
                                size="sm"
                                className={`ml-4 font-bold shadow-glow-button border-0 hover:opacity-90 ${isLocked || match.hasActivePlayers === false ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-gradient-button text-white"}`}
                                disabled={isLocked || (joining && joinMatchId === match.id) || match.hasActivePlayers === false}
                                onClick={() => {
                                  if (isLocked || match.hasActivePlayers === false) return;
                                  if (joining) return;
                                  setJoining(true);
                                  setJoinMatchId(match.id);
                                  
                                  // Join match via WebSocket
                                  lobbyManager.joinMatch(match.id);
                                  
                                  // Set matchConfig for the joiner
                                  const joinerConfig = {
                                    matchId: match.id,
                                    wager: match.wager,
                                    timePerSide: match.timePerSide,
                                    color: "black",
                                    playerWhite: match.playerWhite,
                                    playerBlack: username
                                  };
                                  sessionStorage.setItem("matchConfig", JSON.stringify(joinerConfig));
                                  
                                  // Show lobby waiting screen instead of navigating to game
                                  // The game navigation will happen when both players are ready
                                }}
                              >
                                {isLocked ? <><Lock className="mr-2 h-4 w-4" />Locked</> : match.hasActivePlayers === false ? <><Lock className="mr-2 h-4 w-4" />Inactive</> : (joining && joinMatchId === match.id ? "Joining..." : "Join")}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isLocked && (
                            <TooltipContent>Insufficient balance for this wager</TooltipContent>
                          )}
                          {match.hasActivePlayers === false && (
                            <TooltipContent>This match has no active players</TooltipContent>
                          )}
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* View All Lobbies Button */}
          <div className="text-center">
            <Button 
              variant="mystical" 
              size="lg" 
              className="w-full text-lg py-4 font-bold bg-gradient-button hover:opacity-90 shadow-glow-button border-0"
              onClick={onJoinClick}
            >
              <Play className="mr-2 h-5 w-5" />
              VIEW ALL LOBBIES
            </Button>
              </div>
            </div>
            {/* Separator */}
            <div className="w-full flex justify-center my-2">
              <div className="w-2/3 h-px bg-muted-foreground/30" />
          </div>
          {/* Match Info */}
            <div className="text-center space-y-2 mt-0">
            <div className="text-blue-400 font-medium">{playersOnline} Players Online</div>
            <div className="text-gold font-medium">${totalWinnings.toLocaleString()} Total Winnings</div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="create" className="flex flex-col p-0 h-[520px]">
          <div className="flex-1 flex flex-col gap-y-6">
          {/* Wager Selection */}
          <div>
              <label className="block text-xs font-medium mb-1">Select Wager</label>
              <div className="grid grid-cols-3 gap-2">
              {wagerOptions.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedWager === amount ? "mystical" : "outline"}
                  onClick={() => setSelectedWager(amount)}
                    className={
                      selectedWager === amount
                        ? "font-semibold px-2 py-2 text-base"
                        : "font-semibold px-2 py-2 text-base bg-midnight-blue text-cyan-glow border-cyan-glow/30 hover:bg-cyan-glow/10 hover:border-cyan-glow/50 hover:text-white transition-all duration-300"
                    }
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>
          {/* Time Control */}
          <div>
              <label className="block text-xs font-medium mb-1">Time Control</label>
              <div className="grid grid-cols-2 gap-2">
              <Button
                variant={timeControl === 3 ? "mystical" : "outline"}
                onClick={() => setTimeControl(3)}
                  className={
                    timeControl === 3
                      ? "font-semibold px-2 py-2 text-base"
                      : "font-semibold px-2 py-2 text-base bg-midnight-blue text-cyan-glow border-cyan-glow/30 hover:bg-cyan-glow/10 hover:border-cyan-glow/50 hover:text-white transition-all duration-300"
                  }
              >
                3 Minutes
              </Button>
              <Button
                variant={timeControl === 5 ? "mystical" : "outline"}
                onClick={() => setTimeControl(5)}
                  className={
                    timeControl === 5
                      ? "font-semibold px-2 py-2 text-base"
                      : "font-semibold px-2 py-2 text-base bg-midnight-blue text-cyan-glow border-cyan-glow/30 hover:bg-cyan-glow/10 hover:border-cyan-glow/50 hover:text-white transition-all duration-300"
                  }
              >
                5 Minutes
              </Button>
            </div>
          </div>
            {/* Create Match Button and Insufficient Balance */}
            <div className="text-center space-y-1 mt-2">
            <Button 
              variant="mystical" 
              size="lg" 
                className="w-full text-base py-2 font-bold bg-gradient-button hover:opacity-90 shadow-glow-button border-0"
              disabled={!canAffordWager}
                onClick={() => {
                  if (canAffordWager) {
                    handleCreateMatchPatched(selectedWager, timeControl);
                  }
                }}
            >
              {!canAffordWager && <Lock className="mr-2 h-4 w-4" />}
              <Plus className="mr-2 h-5 w-5" />
              CREATE MATCH
            </Button>
            {!canAffordWager && (
                <p className="text-xs text-muted-foreground mt-1">
                Insufficient balance for ${selectedWager} wager
              </p>
            )}
          </div>
            {/* Divider */}
            <div className="w-full flex justify-center my-2">
              <div className="w-2/3 h-px bg-muted-foreground/30" />
            </div>
          {/* Match Info */}
            <div className="text-center space-y-2 mt-0">
            <div className="text-blue-400 font-medium">{playersOnline} Players Online</div>
            <div className="text-gold font-medium">${totalWinnings.toLocaleString()} Total Winnings</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </GameCard>
  )
}
