import { useState, useEffect, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Clock, Send, Crown, User } from "lucide-react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn, generateUniqueUsername } from "@/lib/utils"
import { useLobbySocket, LobbyEvent } from "@/lib/useLobbySocket"
import { useLobbyManager } from "@/lib/useLobbyManager"

interface CreateMatchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  challengeMode?: boolean
  challengedFriend?: {
    id: string
    name: string
    avatar: string
  }
  matchId?: string
  playerWhite?: string
  playerBlack?: string
  onStartMatch?: () => void
  isJoiner?: boolean
  joinerMatchConfig?: any
}

export function CreateMatchModal({ 
  open, 
  onOpenChange, 
  challengeMode = false, 
  challengedFriend,
  matchId,
  playerWhite,
  playerBlack,
  onStartMatch,
  isJoiner = false,
  joinerMatchConfig
}: CreateMatchModalProps) {
  const [selectedBet, setSelectedBet] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<number | null>(null)
  const [isWaiting, setIsWaiting] = useState(false)
  const [waitingTime, setWaitingTime] = useState(0)
  const [chatMessages, setChatMessages] = useState<Array<{id: string, username: string, message: string, timestamp: Date}>>([])
  const [newMessage, setNewMessage] = useState("")
  const [opponentJoined, setOpponentJoined] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [gameStarting, setGameStarting] = useState(false)
  const [currentMatchId, setCurrentMatchId] = useState<string>("")
  const [currentUsername, setCurrentUsername] = useState<string>("Guest")
  const [playerBlackState, setPlayerBlackState] = useState<string>("")
  const hasShownJoinMessageRef = useRef(false)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const betAmounts = [1, 5, 20]
  const timeframes = [3, 5] // minutes

  // Get username from sessionStorage
  useEffect(() => {
    const username = generateUniqueUsername();
    setCurrentUsername(username);
    console.log('[CreateMatchModal] Set username to:', username);
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedBet(null)
      setSelectedTime(null)
      setIsWaiting(false)
      setWaitingTime(0)
      setOpponentJoined(false)
      setGameStarting(false)
      setCountdown(30)
      setChatMessages([])
      setNewMessage("")
      setCurrentMatchId("")
      setPlayerBlackState("")
      hasShownJoinMessageRef.current = false
      // Clear any existing countdown interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    } else if (isJoiner && joinerMatchConfig) {
      // For joiner, immediately show lobby waiting screen
      setIsWaiting(true)
      setSelectedBet(joinerMatchConfig.wager)
      setSelectedTime(joinerMatchConfig.timePerSide / 60) // Convert seconds to minutes
      setCurrentMatchId(joinerMatchConfig.matchId)
      setPlayerBlackState(joinerMatchConfig.playerBlack)
      // For joiner, we are the opponent joining, so set opponentJoined to true
      setOpponentJoined(true)
      
      // Add system message for joiner
      const joinMessage = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: "System",
        message: `You joined ${joinerMatchConfig.playerWhite}'s match`,
        timestamp: new Date()
      }
      setChatMessages([joinMessage])
      
      // Start countdown immediately for joiner since both players are now in the lobby
      if (!countdownIntervalRef.current) {
        setGameStarting(true)
        let countdown = 30
        setCountdown(countdown)
        
        countdownIntervalRef.current = setInterval(() => {
          countdown--
          setCountdown(countdown)
          console.log('[CreateMatchModal] Joiner countdown:', countdown)
          
          if (countdown <= 0) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current)
              countdownIntervalRef.current = null
            }
            console.log('[CreateMatchModal] Joiner countdown finished, starting game!')
            // Start the game
            if (onStartMatch) {
              onStartMatch()
            }
          }
        }, 1000)
      }
      
      // Join the lobby immediately for joiner
      console.log('[CreateMatchModal] Joiner joining lobby for match:', joinerMatchConfig.matchId)
    }
  }, [open, isJoiner, joinerMatchConfig])

  // Timer for waiting state
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isWaiting) {
      interval = setInterval(() => {
        setWaitingTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isWaiting])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCreateMatch = () => {
    if (selectedBet && selectedTime) {
      setIsWaiting(true)
      
      console.log('[CreateMatchModal] Creating match:', { bet: selectedBet, time: selectedTime, username: currentUsername })
      
      // Create match via WebSocket lobby manager
      lobbyManager.createMatch(selectedBet, selectedTime * 60)
      
      console.log(`Creating match with bet: $${selectedBet}, time: ${selectedTime} minutes`)
      
      // Don't show the lobby waiting screen - navigate directly to game
      // The match config will be set when the server responds with the match ID
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: "You",
        message: newMessage.trim(),
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, message])
      setNewMessage("")
      
      // Send message via WebSocket if connected
      if (lobbySocket && currentMatchId) {
        lobbySocket.sendLobbyChat(newMessage.trim())
      }
    }
  }

  // WebSocket event handler
  const handleLobbyEvent = useCallback((event: LobbyEvent) => {
    console.log('[CreateMatchModal] Received lobby event:', event)
    
    switch (event.type) {
      case 'lobby-chat':
        const chatMessage = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          username: event.username,
          message: event.message,
          timestamp: new Date(event.timestamp)
        }
        setChatMessages(prev => [...prev, chatMessage])
        break
        
      case 'lobby-opponent-joined':
        console.log('[CreateMatchModal] Received lobby-opponent-joined event:', event)
        
        // Only process if we haven't already processed this opponent
        if (!opponentJoined || playerBlackState !== event.username) {
        setOpponentJoined(true)
        setPlayerBlackState(event.username)
        console.log('[CreateMatchModal] Set playerBlackState to:', event.username)
          
          // Update the match config in sessionStorage with the actual black player name
          const existingConfigRaw = sessionStorage.getItem("matchConfig");
          if (existingConfigRaw) {
            try {
              const existingConfig = JSON.parse(existingConfigRaw);
              const updatedConfig = {
                ...existingConfig,
                playerBlack: event.username
              };
              sessionStorage.setItem("matchConfig", JSON.stringify(updatedConfig));
              console.log('[CreateMatchModal] Updated match config with black player:', event.username);
            } catch (error) {
              console.error('[CreateMatchModal] Error updating match config:', error);
            }
          }
        
        // Only show join message once
        if (!hasShownJoinMessageRef.current) {
          hasShownJoinMessageRef.current = true
          console.log('[CreateMatchModal] Opponent joined:', event.username)
          
          // Removed the join message as requested - no need to show "username joined the match" message
        }
        
        // Start 30-second countdown when both players are in the lobby (only once)
        if (!countdownIntervalRef.current) {
          setGameStarting(true)
          let countdown = 30
          setCountdown(countdown)
          
          countdownIntervalRef.current = setInterval(() => {
            countdown--
            setCountdown(countdown)
            console.log('[CreateMatchModal] Countdown:', countdown)
            
            if (countdown <= 0) {
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
                countdownIntervalRef.current = null
              }
              console.log('[CreateMatchModal] Countdown finished, starting game!')
              // Start the game
              if (onStartMatch) {
                onStartMatch()
              }
            }
          }, 1000)
          }
        } else {
          console.log('[CreateMatchModal] Ignoring duplicate opponent-joined event for:', event.username)
        }
        break
        
      case 'lobby-match-starting':
        if (onStartMatch) {
          onStartMatch()
        }
        break
        
      case 'lobby-countdown':
        // Synchronize with server countdown
        console.log('[CreateMatchModal] Received server countdown:', event.seconds)
        setCountdown(event.seconds)
        setGameStarting(true)
        
        // Clear any existing local countdown and use server countdown
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current)
          countdownIntervalRef.current = null
        }
        
        // Set up countdown based on server value
        if (event.seconds > 0) {
          let countdown = event.seconds
          countdownIntervalRef.current = setInterval(() => {
            countdown--
            setCountdown(countdown)
            console.log('[CreateMatchModal] Server-synchronized countdown:', countdown)
            
            if (countdown <= 0) {
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
                countdownIntervalRef.current = null
              }
              console.log('[CreateMatchModal] Server countdown finished, starting game!')
              if (onStartMatch) {
                onStartMatch()
              }
            }
          }, 1000)
        }
        break
    }
  }, [currentUsername, onStartMatch])

  // Initialize WebSocket when match is created
  const lobbySocket = useLobbySocket({
    matchId: isJoiner && joinerMatchConfig ? joinerMatchConfig.matchId : (currentMatchId || ""),
    username: currentUsername,
    onEvent: handleLobbyEvent,
    onStartMatch: () => {
      if (onStartMatch) {
        onStartMatch()
      }
    }
  })

  // Lobby Manager for creating matches
  const lobbyManager = useLobbyManager({
    username: currentUsername,
    onEvent: (event) => {
      console.log('[CreateMatchModal] Received lobby manager event:', event)
      // Handle lobby manager events (match creation, etc.)
      if (event.type === 'match-created') {
        console.log('[CreateMatchModal] Match created event received');
        console.log('[CreateMatchModal] Current username:', currentUsername);
        console.log('[CreateMatchModal] Match creator:', event.match.playerWhite);
        console.log('[CreateMatchModal] Are we the creator?', event.match.playerWhite === currentUsername);
        
        // Only process match-created events if we are the actual creator
        if (event.match.playerWhite === currentUsername) {
          console.log('[CreateMatchModal] We are the creator, processing match creation');
          setCurrentMatchId(event.match.id)
          // Store match config for the Game component
          const matchConfig = {
            matchId: event.match.id,
            playerWhite: currentUsername,
            playerBlack: "Waiting...",
            wager: event.match.wager,
            timePerSide: event.match.timePerSide,
            color: "white",
            isDemo: false
          }
          sessionStorage.setItem("matchConfig", JSON.stringify(matchConfig))
          
          // Stay in lobby waiting screen - don't navigate yet
          // Navigation will happen when both players are ready
        } else {
          console.log('[CreateMatchModal] We are not the creator, ignoring match creation event');
        }
      } else if (event.type === 'match-joined' && !isJoiner) {
        // Creator received notification that someone joined their match
        console.log('[CreateMatchModal] Creator: Someone joined my match:', event.playerBlack)
        
        // Only process if we haven't already processed this opponent
        if (!opponentJoined || playerBlackState !== event.playerBlack) {
        setOpponentJoined(true)
        setPlayerBlackState(event.playerBlack)
        console.log('[CreateMatchModal] Set playerBlackState to:', event.playerBlack)
          
          // Update the match config in sessionStorage with the actual black player name
          const existingConfigRaw = sessionStorage.getItem("matchConfig");
          if (existingConfigRaw) {
            try {
              const existingConfig = JSON.parse(existingConfigRaw);
              const updatedConfig = {
                ...existingConfig,
                playerBlack: event.playerBlack
              };
              sessionStorage.setItem("matchConfig", JSON.stringify(updatedConfig));
              console.log('[CreateMatchModal] Updated match config with black player:', event.playerBlack);
            } catch (error) {
              console.error('[CreateMatchModal] Error updating match config:', error);
            }
          }
        
        // Add system message to chat
        const joinMessage = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          username: "System",
          message: `${event.playerBlack} joined your match`,
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, joinMessage])
        } else {
          console.log('[CreateMatchModal] Ignoring duplicate match-joined event for:', event.playerBlack)
        }
      }
    },
  })



  // Handle real-time lobby events
  useEffect(() => {
    if (isWaiting && currentMatchId) {
      // Initialize countdown when opponent joins
      if (opponentJoined) {
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              // Auto-start match when countdown reaches 0
              if (onStartMatch) {
                onStartMatch()
              }
              return 0
            }
            return prev - 1
          })
        }, 1000)
        return () => clearInterval(timer)
      }
    }
  }, [isWaiting, opponentJoined, currentMatchId, onStartMatch])

  const handleCancelMatch = () => {
    // Send cancel signal via WebSocket
    if (lobbySocket && currentMatchId) {
      lobbySocket.sendCancelMatch()
    }
    
    setIsWaiting(false)
    setWaitingTime(0)
    setOpponentJoined(false)
    setCountdown(30)
    setChatMessages([])
    setNewMessage("")
    setCurrentMatchId("")
    onOpenChange(false)
    console.log("Match cancelled")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isWaiting ? (
      <DialogContent className="sm:max-w-md bg-midnight-dark border border-cyan-glow/20 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-cyan-glow text-center">
              {challengeMode ? "Challenge Friend" : "Create Match"}
            </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
            {/* Entry Fee Section */}
              <div className="space-y-3">
              <h3 className="text-lg font-semibold text-soft-blue-grey">Choose Entry Fee</h3>
                <div className="grid grid-cols-3 gap-3">
                  {betAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedBet === amount ? "default" : "outline"}
                      className={`h-12 text-lg font-bold ${
                        selectedBet === amount
                          ? "bg-gradient-button text-midnight-dark shadow-glow-button"
                          : "bg-midnight-blue/50 hover:bg-cyan-glow/10 text-cyan-glow border-cyan-glow/30 hover:border-cyan-glow/50"
                      }`}
                      onClick={() => setSelectedBet(amount)}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Timeframe Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-soft-blue-grey">Choose Timeframe</h3>
                <div className="grid grid-cols-2 gap-3">
                  {timeframes.map((minutes) => (
                    <Button
                      key={minutes}
                      variant={selectedTime === minutes ? "default" : "outline"}
                      className={`h-12 text-lg font-bold ${
                        selectedTime === minutes
                          ? "bg-gradient-button text-midnight-dark shadow-glow-button"
                          : "bg-midnight-blue/50 hover:bg-cyan-glow/10 text-cyan-glow border-cyan-glow/30 hover:border-cyan-glow/50"
                      }`}
                      onClick={() => setSelectedTime(minutes)}
                    >
                      {minutes} Minutes
                    </Button>
                  ))}
                </div>
              </div>

              {/* Create Match Button */}
              <Button
                onClick={handleCreateMatch}
                disabled={!selectedBet || !selectedTime}
                className="w-full h-14 text-xl font-bold bg-gradient-button hover:opacity-90 shadow-glow-button disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"
              >
              {challengeMode ? "Send Challenge" : "Create Match"}
              </Button>
          </div>
        </DialogContent>
      ) : (
        // Match Lobby Waiting Screen
        <DialogContent className="sm:max-w-4xl bg-midnight-dark border border-cyan-glow/20 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-cyan-glow text-center">
              Match Lobby
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6">
            {/* Players Section */}
            <div className="lg:col-span-2 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* White Player */}
                <div className="bg-gradient-to-br from-midnight-dark/80 to-midnight-dark/60 backdrop-blur-md rounded-xl p-6 border border-cyan-glow/30 h-48 flex flex-col justify-center shadow-lg shadow-cyan-glow/10 hover:shadow-xl hover:shadow-cyan-glow/20 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-glow/50">
                  <div className="text-center mb-6">
                      <div className="font-bold text-metallic-silver text-xl bg-gradient-to-r from-metallic-silver to-white bg-clip-text text-transparent leading-tight">
                        {isJoiner ? (joinerMatchConfig?.playerWhite || "Match Creator") : (currentUsername || "You")}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">White Player</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">Win Rate:</span>
                      <span className="text-electric-blue font-bold drop-shadow-sm bg-gradient-to-r from-electric-blue to-cyan-400 bg-clip-text text-transparent">68%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">Games Played:</span>
                      <span className="text-electric-blue font-bold drop-shadow-sm bg-gradient-to-r from-electric-blue to-cyan-400 bg-clip-text text-transparent">156</span>
                    </div>
                  </div>
                </div>

                {/* Black Player */}
                <div className="bg-gradient-to-br from-midnight-dark/80 to-midnight-dark/60 backdrop-blur-md rounded-xl p-6 border border-cyan-glow/30 h-48 flex flex-col justify-center shadow-lg shadow-cyan-glow/10 hover:shadow-xl hover:shadow-cyan-glow/20 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-glow/50">
                  <div className="text-center mb-6">
                      <div className="font-bold text-metallic-silver text-xl bg-gradient-to-r from-metallic-silver to-white bg-clip-text text-transparent leading-tight">
                        {isJoiner ? (currentUsername || "You") : (opponentJoined ? (playerBlackState || "Match Joiner") : "Waiting for opponent...")}
                      </div>
                      {/* Debug info */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Debug: opponentJoined={opponentJoined.toString()}, playerBlackState="{playerBlackState}"
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground font-medium">Black Player</div>
                  </div>
                  {(isJoiner || opponentJoined) && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium">Win Rate:</span>
                        <span className="text-electric-blue font-bold drop-shadow-sm bg-gradient-to-r from-electric-blue to-cyan-400 bg-clip-text text-transparent">72%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium">Games Played:</span>
                        <span className="text-electric-blue font-bold drop-shadow-sm bg-gradient-to-r from-electric-blue to-cyan-400 bg-clip-text text-transparent">142</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

                        {/* Match Info */}
          <div className="bg-gradient-to-br from-midnight-dark/80 to-midnight-dark/60 backdrop-blur-md rounded-xl p-4 border border-cyan-glow/30 h-32 shadow-lg shadow-cyan-glow/10 hover:shadow-xl hover:shadow-cyan-glow/20 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-glow/50">
            <div className="grid grid-cols-2 gap-6 h-full">
              <div className="text-center flex flex-col justify-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-premium-gold to-yellow-400 bg-clip-text text-transparent drop-shadow-sm mb-1">${selectedBet}</div>
                <div className="text-sm text-muted-foreground font-medium">Entry Fee</div>
              </div>
              <div className="text-center flex flex-col justify-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-electric-blue to-cyan-400 bg-clip-text text-transparent drop-shadow-sm mb-1">{selectedTime} min</div>
                <div className="text-sm text-muted-foreground font-medium">Time Control</div>
              </div>
            </div>
          </div>

              {/* Waiting Counter / Countdown Display */}
              <div className="bg-gradient-to-br from-midnight-dark/80 to-midnight-dark/60 backdrop-blur-md rounded-xl border border-cyan-glow/30 p-4 h-32 flex items-center justify-center shadow-lg shadow-cyan-glow/10 hover:shadow-xl hover:shadow-cyan-glow/20 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-glow/50">
                {!opponentJoined ? (
                  // Waiting for opponent
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Clock className="h-6 w-6 text-burnt-orange drop-shadow-sm animate-pulse" />
                      <span className="text-burnt-orange font-bold bg-gradient-to-r from-burnt-orange to-orange-400 bg-clip-text text-transparent text-lg">
                        Waiting for opponent...
                      </span>
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-burnt-orange to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
                      {formatTime(waitingTime)}
                    </div>
                  </div>
                ) : (
                  // Countdown to game start
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Clock className="h-6 w-6 text-electric-blue drop-shadow-sm animate-pulse" />
                      <span className="text-electric-blue font-bold bg-gradient-to-r from-electric-blue to-cyan-400 bg-clip-text text-transparent text-lg">
                        {gameStarting ? "Starting match..." : "Game starting soon..."}
                      </span>
                    </div>
                    
                    {gameStarting && (
                      <div className="text-3xl font-bold bg-gradient-to-r from-electric-blue to-cyan-400 bg-clip-text text-transparent drop-shadow-sm animate-pulse">
                        {countdown}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

                      {/* Chat Section */}
          <div className="bg-gradient-to-br from-midnight-dark/80 to-midnight-dark/60 backdrop-blur-md rounded-xl border border-cyan-glow/30 overflow-hidden flex flex-col h-full shadow-lg shadow-cyan-glow/10 hover:shadow-xl hover:shadow-cyan-glow/20 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-glow/50">
              <div className="p-6 border-b border-cyan-glow/30 flex-shrink-0 bg-gradient-to-r from-midnight-dark/40 to-midnight-dark/20">
                <h3 className="font-bold text-metallic-silver bg-gradient-to-r from-metallic-silver to-white bg-clip-text text-transparent text-lg">Lobby Chat</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No messages yet
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div key={message.id} className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-bold ${
                          message.username === "System" 
                            ? "text-burnt-orange drop-shadow-sm" 
                            : message.username === "You" 
                              ? "text-electric-blue drop-shadow-sm" 
                              : "text-premium-gold drop-shadow-sm"
                        }`}>
                          {message.username}:
                        </span>
                      </div>
                      <div className="text-sm text-metallic-silver bg-gradient-to-r from-midnight-dark/60 to-midnight-dark/40 rounded-lg px-3 py-2 border border-cyan-glow/10 shadow-sm">
                        {message.message}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-cyan-glow/30 flex-shrink-0 bg-gradient-to-r from-midnight-dark/40 to-midnight-dark/20">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-midnight-dark/50 border-cyan-glow/30 text-metallic-silver placeholder:text-muted-foreground focus:border-cyan-glow/60 focus:ring-2 focus:ring-cyan-glow/20 transition-all duration-200"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    className="bg-gradient-to-r from-electric-blue to-cyan-500 hover:from-electric-blue/90 hover:to-cyan-500/90 text-white px-3 transition-all duration-200 hover:scale-105 shadow-lg shadow-electric-blue/30"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {!opponentJoined && (
            <div className="flex justify-center mt-8 mb-4">
              <Button
                onClick={handleCancelMatch}
                variant="outline"
                className="!bg-gradient-to-r !from-red-900/20 !to-red-800/20 !hover:from-red-600/20 !hover:to-red-700/20 !text-red-400 !border-red-400/30 !hover:border-red-400/60 !hover:text-red-300 !transition-all !duration-200 !hover:scale-105 !shadow-lg !shadow-red-500/20 !focus:ring-0 !focus:ring-offset-0 !hover:bg-gradient-to-r !hover:from-red-600/20 !hover:to-red-700/20 !hover:bg-accent-none"
              >
                Cancel Match
              </Button>
            </div>
          )}
      </DialogContent>
      )}
    </Dialog>
  )
}