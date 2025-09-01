import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useGameSocket, GameEvent } from "@/lib/useMockGameSocket";
import { useLobbyManager, LobbyEvent, LobbyMatch } from "@/lib/useLobbyManager";
import { MatchControlsCard } from "@/components/ui/match-controls-card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Lock, RefreshCw } from "lucide-react";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { CreateMatchModal } from "@/components/ui/create-match-modal";
import { generateUniqueUsername } from "@/lib/utils";



export default function LobbyList() {
  const navigate = useNavigate();
  const [wager, setWager] = useState(5);
  const [time, setTime] = useState(180);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinMatchId, setJoinMatchId] = useState<string | null>(null);
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [availableMatches, setAvailableMatchesState] = useState<LobbyMatch[]>([]);
  const [balance, setBalance] = useState(5.00);
  const [lobbyStatus, setLobbyStatus] = useState<"idle"|"waiting"|"joined"|"ready"|"countdown">("idle");
  const [joinedUser, setJoinedUser] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [createdMatchId, setCreatedMatchId] = useState<string | null>(null);
  const [showLobbyModal, setShowLobbyModal] = useState(false);
  const [lobbyMatchConfig, setLobbyMatchConfig] = useState<any>(null);
  const [showCreatorLobbyModal, setShowCreatorLobbyModal] = useState(false);
  const [creatorMatchConfig, setCreatorMatchConfig] = useState<any>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextRefreshIn, setNextRefreshIn] = useState(30);
  const refreshFunctionRef = useRef<() => void>();

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

  // --- SOCKET LOGIC FOR CREATE ---
  const onCreateEvent = useCallback((event: GameEvent) => {
    console.log('[LobbyList] Creator received socket event:', event);
    if (event.type === "user-joined") {
      // Opponent joined - this will be handled in the game page now
      console.log('[LobbyList] Opponent joined, but creator is already in game page');
    } else if (event.type === "lobby-joined") {
      setJoinedUser(event.username);
      setLobbyStatus("joined");
    } else if (event.type === "lobby-start") {
      setLobbyStatus("countdown");
      setCountdown(event.countdown);
      if (countdownRef.current) clearInterval(countdownRef.current);
      let c = event.countdown;
      countdownRef.current = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(countdownRef.current!);
          setLobbyStatus("idle");
          setCountdown(null);
          navigate(`/game?matchId=${createdMatchId}&color=white`);
        }
      }, 1000);
    }
  }, [createdMatchId, navigate]);
  let username = generateUniqueUsername();
  
  console.log('[LobbyList] Using username:', username);

  // Lobby Manager WebSocket - just log events since matches are handled by lobbyManager
  const handleLobbyEvent = useCallback((event: LobbyEvent) => {
    console.log('[LobbyList] Received lobby event:', event);
    
    switch (event.type) {
      case 'match-created':
        console.log('[LobbyList] Match created:', event.match);
        console.log('[LobbyList] Current username:', username);
        console.log('[LobbyList] Match creator:', event.match.playerWhite);
        console.log('[LobbyList] Are we the creator?', event.match.playerWhite === username);
        console.log('[LobbyList] Username comparison details:', {
          matchCreator: event.match.playerWhite,
          currentUser: username,
          isEqual: event.match.playerWhite === username,
          matchCreatorType: typeof event.match.playerWhite,
          currentUserType: typeof username
        });
        // Only show lobby modal for the actual creator of the match
        if (event.match.playerWhite === username) {
          console.log('[LobbyList] We are the creator, showing lobby modal');
          const creatorConfig = {
            matchId: event.match.id,
            wager: event.match.wager,
            timePerSide: event.match.timePerSide,
            color: "white",
            playerWhite: username,
            playerBlack: "Waiting..."
          };
          setCreatorMatchConfig(creatorConfig);
          setShowCreatorLobbyModal(true);
        } else {
          console.log('[LobbyList] We are not the creator, just updating match list');
          // Make sure we don't show the modal for non-creators
          setShowCreatorLobbyModal(false);
          setCreatorMatchConfig(null);
        }
        break;
      case 'match-joined':
        console.log('[LobbyList] Match joined:', event.matchId, event.playerBlack);
        // If we're the joiner and this is our match, update status
        if (joinMatchId === event.matchId && event.playerBlack === username) {
          setLobbyStatus("ready");
          setJoinedUser(event.playerBlack);
        }
        break;
      case 'match-removed':
        console.log('[LobbyList] Match removed:', event.matchId);
        break;
      case 'match-updated':
        console.log('[LobbyList] Match updated:', event.match);
        break;
      case 'lobby-error':
        console.error('[LobbyList] Lobby error:', event.message);
        break;
    }
  }, [joinMatchId, username]);

  const lobbyManager = useLobbyManager({
    username,
    onEvent: handleLobbyEvent,
  });

  // Use the matches from lobbyManager instead of local state
  useEffect(() => {
    setAvailableMatchesState(lobbyManager.matches);
  }, [lobbyManager.matches]);

  // Manual refresh handler
  function handleManualRefresh() {
    setIsRefreshing(true);
    refreshFunctionRef.current?.();
    setLastRefreshed(new Date());
    setNextRefreshIn(30);
    setTimeout(() => setIsRefreshing(false), 500);
  }

  // Smart polling (every 30s, only if tab is focused)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let countdown: NodeJS.Timeout | null = null;
    
    function poll() {
      if (document.visibilityState === "visible") {
        refreshFunctionRef.current?.();
        setLastRefreshed(new Date());
        setNextRefreshIn(30);
      }
    }
    
    // Store the refresh function in ref
    refreshFunctionRef.current = lobbyManager.refreshMatches;
    
    // Initial poll
    poll();
    
    interval = setInterval(poll, 30000);
    countdown = setInterval(() => {
      setNextRefreshIn((prev) => {
        const newValue = prev > 1 ? prev - 1 : 30;
        // If we're about to reset to 30, trigger a refresh
        if (newValue === 30 && prev === 1) {
          poll();
        }
        return newValue;
      });
    }, 1000);
    
    return () => {
      interval && clearInterval(interval);
      countdown && clearInterval(countdown);
    };
  }, []);

  // Update ref when lobbyManager changes
  useEffect(() => {
    refreshFunctionRef.current = lobbyManager.refreshMatches;
  }, [lobbyManager]);

  // Initial refresh when connection is established
  useEffect(() => {
    if (lobbyManager.connected) {
      refreshFunctionRef.current?.();
      setLastRefreshed(new Date());
      setNextRefreshIn(30);
    }
  }, [lobbyManager.connected]);

  const createSocket = useGameSocket({
    matchId: createdMatchId || "",
    myColor: "white",
    onEvent: onCreateEvent,
    username,
  });

  // WebSocket-based lobby events are handled by the lobbyManager hook

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // --- SOCKET LOGIC FOR JOIN ---
  const onJoinEvent = useCallback((event: GameEvent) => {
    console.log('[LobbyList] Joiner received socket event:', event);
    if (event.type === "start" && event.color === "white") {
      sessionStorage.setItem("matchConfig", JSON.stringify({ matchId: joinMatchId, wager: event.wager, timePerSide: event.timePerSide, color: "black" }));
      setOpponentJoined(true);
      setLobbyStatus("waiting");
      // Send lobby-joined to creator via localStorage event bus
      setTimeout(() => {
        let username = "Guest";
        try {
          const stored = sessionStorage.getItem("username");
          if (stored) username = stored;
        } catch {}
        // Write lobby-joined event to localStorage
        localStorage.setItem("lobby-joined-event", JSON.stringify({ matchId: joinMatchId, username }));
        joinSocket.sendLobbyJoined(username);
      }, 500);
    } else if (event.type === "lobby-start") {
      setLobbyStatus("countdown");
      setCountdown(event.countdown);
      if (countdownRef.current) clearInterval(countdownRef.current);
      let c = event.countdown;
      countdownRef.current = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(countdownRef.current!);
          setLobbyStatus("idle");
          setCountdown(null);
          navigate(`/game?matchId=${joinMatchId}&color=black`);
        }
      }, 1000);
    }
  }, [joinMatchId, navigate]);
  const joinSocket = useGameSocket({
    matchId: joinMatchId || "",
    myColor: "black",
    onEvent: onJoinEvent,
    username,
  });

  function refreshAvailableMatches() {
    lobbyManager.refreshMatches();
  }

  function handleCreate() {
    // Check wallet balance
    let wallet = { usd: 5.00 };
    try {
      const walletRaw = sessionStorage.getItem("walletBalance");
      if (walletRaw) wallet = JSON.parse(walletRaw);
    } catch {}
    if (wallet.usd < wager) {
      alert("Insufficient balance to create this match.");
      return;
    }
    // Deduct wager and update wallet
    wallet.usd -= wager;
    sessionStorage.setItem("walletBalance", JSON.stringify(wallet));
    setCreating(true);
    
    // Create match via WebSocket
    lobbyManager.createMatch(wager, time * 60);
    
    // Show lobby waiting screen for creator
    // The game navigation will happen when both players are ready
  }

  function handleCancelCreate() {
    // Refund wager
    let wallet = { usd: 5.00 };
    try {
      const walletRaw = sessionStorage.getItem("walletBalance");
      if (walletRaw) wallet = JSON.parse(walletRaw);
    } catch {}
    wallet.usd += wager;
    sessionStorage.setItem("walletBalance", JSON.stringify(wallet));
    
    // Cancel match via WebSocket
    if (createdMatchId) {
      lobbyManager.cancelMatch(createdMatchId);
    }
    
    setCreatedMatchId(null);
    setWager(null);
    setTime(null);
    setLobbyStatus("idle");
  }

  function handleJoin(match: LobbyMatch) {
    console.log('[LobbyList] handleJoin called for match:', match);
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
    console.log('[LobbyList] Setting matchConfig for joiner:', joinerConfig);
    sessionStorage.setItem("matchConfig", JSON.stringify(joinerConfig));
    
    // Show the Match Lobby UI modal
    setLobbyMatchConfig(joinerConfig);
    setShowLobbyModal(true);
  }

  // Remove joined matches from the list
  function handleMatchJoined(matchId: string) {
    // Match removal is now handled by WebSocket events
    console.log('[LobbyList] Match joined, will be removed by WebSocket event');
  }



  // On mount, refresh available matches from WebSocket
  useEffect(() => {
    if (lobbyManager.connected) {
      lobbyManager.refreshMatches();
    }
  }, [lobbyManager.connected]);



  function handleStartMatch() {
    if (createSocket) {
      createSocket.sendLobbyStart(10);
    } else if (joinSocket) {
      joinSocket.sendLobbyStart(10);
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative pb-20" style={{ backgroundImage: `url(/src/assets/mystical-chess-arena.png)` }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-metallic-silver mb-2">Game Lobby</h1>
          <p className="text-muted-foreground text-lg">Find your next opponent</p>
        </div>

        {/* Status Banner */}
        {lobbyStatus !== "idle" && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-midnight-dark/80 backdrop-blur-md rounded-xl p-4 border border-electric-blue/20">
              <div className="text-center">
                {lobbyStatus === "joined" && (
                  <div className="space-y-3">
                    <p className="text-electric-blue font-semibold text-lg">{joinedUser} has joined the lobby</p>
                    <Button 
                      onClick={handleStartMatch}
                      className="bg-electric-blue hover:bg-electric-blue/90 text-black font-semibold"
                    >
                      Start Match
                    </Button>
                  </div>
                )}
                {lobbyStatus === "waiting" && (
                  <p className="text-electric-blue font-semibold text-lg">Waiting for opponent to join the lobby...</p>
                )}
                {lobbyStatus === "ready" && (
                  <div className="space-y-3">
                    <p className="text-electric-blue font-semibold text-lg">Joined lobby, waiting for match creator to start the match.</p>
                    <Button 
                      onClick={handleStartMatch}
                      className="bg-electric-blue hover:bg-electric-blue/90 text-black font-semibold"
                    >
                      Start Match
                    </Button>
                  </div>
                )}
                {lobbyStatus === "countdown" && (
                  <p className="text-electric-blue font-semibold text-lg">Match starting in {countdown} seconds...</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-midnight-dark/70 backdrop-blur-md rounded-xl p-4 border border-electric-blue/20 text-center">
              <div className="text-2xl font-bold text-premium-gold">${balance.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Your Balance</div>
            </div>
            <div className="bg-midnight-dark/70 backdrop-blur-md rounded-xl p-4 border border-electric-blue/20 text-center">
              <div className="text-2xl font-bold text-electric-blue">{availableMatches.length}</div>
              <div className="text-sm text-muted-foreground">Available Matches</div>
            </div>
            <div className="bg-midnight-dark/70 backdrop-blur-md rounded-xl p-4 border border-electric-blue/20 text-center">
              <div className="text-2xl font-bold text-burnt-orange">4,872</div>
              <div className="text-sm text-muted-foreground">Matches Today</div>
            </div>
          </div>

          {/* Matches Section */}
          <div className="bg-midnight-dark/70 backdrop-blur-md rounded-xl border border-electric-blue/20 overflow-hidden">
            <div className="p-6 border-b border-electric-blue/20">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-metallic-silver">Available Matches</h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleManualRefresh}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition ${isRefreshing ? "animate-spin" : ""}`}
                    title="Refresh"
                  >
                    <RefreshCw size={18} />
                  </button>
                  <span className={`text-xs ${isRefreshing ? 'text-electric-blue animate-pulse' : nextRefreshIn <= 5 ? 'text-orange-400 animate-pulse' : 'text-muted-foreground'}`}>
                    {isRefreshing ? 'Refreshing...' : `Refreshes in ${nextRefreshIn} seconds`}
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mt-1">Click to join any available match</p>
            </div>
            
            <div className="p-6">
              {availableMatches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground text-lg mb-2">No matches available</div>
                  <div className="text-muted-foreground text-sm">Create a match or wait for others to join</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableMatches.slice(0, 5).map((match: any) => {
                    const isLocked = balance < match.wager;
                    const timeText = match.timePerSide === 180 ? '3 min' : match.timePerSide === 300 ? '5 min' : '';
                    
                    return (
                      <div key={match.id} className="flex items-center justify-between p-4 rounded-lg bg-midnight-dark/50 border border-electric-blue/10 hover:border-electric-blue/30 transition-all duration-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-premium-gold flex items-center justify-center">
                            <span className="text-black font-bold text-sm">
                              {match.playerWhite?.charAt(0)?.toUpperCase() || 'G'}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-metallic-silver">{match.playerWhite || 'Guest'}</div>
                            <div className="text-muted-foreground text-sm">White Player</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold text-premium-gold">${match.wager}</div>
                            <div className="text-muted-foreground text-sm">Entry Fee</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-electric-blue">{timeText}</div>
                            <div className="text-muted-foreground text-sm">Time</div>
                          </div>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button 
                                  disabled={isLocked || (joining && joinMatchId === match.id) || match.hasActivePlayers === false}
                                  className={`${
                                    isLocked || match.hasActivePlayers === false
                                      ? "bg-muted text-muted-foreground cursor-not-allowed" 
                                      : "bg-electric-blue hover:bg-electric-blue/90 text-black font-semibold"
                                  }`}
                                  onClick={() => {
                                    if (isLocked || match.hasActivePlayers === false) return;
                                    handleJoin(match);
                                  }}
                                >
                                  {isLocked ? (
                                    <>
                                      <Lock className="mr-2 h-4 w-4" />
                                      Locked
                                    </>
                                  ) : match.hasActivePlayers === false ? (
                                    <>
                                      <Lock className="mr-2 h-4 w-4" />
                                      Inactive
                                    </>
                                  ) : (
                                    "Join Match"
                                  )}
                                </Button>
                              </span>
                            </TooltipTrigger>
                            {isLocked && (
                              <TooltipContent>Insufficient balance for this entry fee</TooltipContent>
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
              )}
            </div>
          </div>

          {/* Joining Status */}
          {joining && !opponentJoined && (
            <div className="mt-6 text-center">
              <div className="bg-midnight-dark/70 backdrop-blur-md rounded-xl p-4 border border-electric-blue/20">
                <p className="text-electric-blue font-semibold text-lg">Joining match, waiting for creator...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Match Lobby Modal for Joiner */}
      {showLobbyModal && lobbyMatchConfig && (
        <CreateMatchModal 
          open={showLobbyModal} 
          onOpenChange={setShowLobbyModal}
          isJoiner={true}
          joinerMatchConfig={lobbyMatchConfig}
          onStartMatch={() => {
            // Navigate to game when both players are ready
            window.location.href = '/game';
          }}
        />
      )}

      {/* Match Lobby Modal for Creator */}
      {showCreatorLobbyModal && creatorMatchConfig && (
        <CreateMatchModal 
          open={showCreatorLobbyModal} 
          onOpenChange={setShowCreatorLobbyModal}
          isJoiner={false}
          joinerMatchConfig={creatorMatchConfig}
          onStartMatch={() => {
            // Navigate to game when both players are ready
            window.location.href = '/game';
          }}
        />
      )}

      <BottomNavigation />
    </div>
  );
}