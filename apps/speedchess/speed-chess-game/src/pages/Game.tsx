import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Chess } from "chess.js";
import { Match } from "@/lib/matchTypes";
import ChessBoard from "@/components/game/ChessBoard";
import GameSidebar from "@/components/game/GameSidebar";
import Timer from "@/components/game/Timer";
import { useGameSocket, GameEvent } from "@/lib/useMockGameSocket";
import GameChat from "@/components/game/GameChat";
import CapturedPieces from "@/components/game/CapturedPieces";
import { generateUniqueUsername } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import moveSound from "@/assets/move.mp3";
import chatSound from "@/assets/chat.mp3";
import { Skeleton } from "@/components/ui/skeleton";

const mockMatch: Match = {
  id: "mock-1",
  playerWhite: "aj",
  playerBlack: "dth",
  wager: 5,
  timePerSide: 180,
  moves: [],
  state: "active",
};

// Piece values for scoring
const PIECE_VALUES = {
  p: 1,   // pawn
  n: 3,   // knight
  b: 3,   // bishop
  r: 5,   // rook
  q: 9,   // queen
  k: 0,   // king (not captured in normal play)
};

export default function Game({ sfxVolume = 80 }: { sfxVolume?: number }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [chess] = useState(new Chess());
  const [myColor, setMyColor] = useState<"white" | "black">("white");
  const [activeColor, setActiveColor] = useState<"white" | "black">("white");
  const [clocks, setClocks] = useState({ white: 180, black: 180 });
  const [scores, setScores] = useState({ white: 0, black: 0 });
  const [capturedPieces, setCapturedPieces] = useState({ white: [] as string[], black: [] as string[] });
  const [isCheck, setIsCheck] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ from: "white" | "black"; message: string }[]>([]);
  const [showResignModal, setShowResignModal] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const leftGameRef = useRef(false);
  const processedEventsRef = useRef(new Set<string>());
  const moveAudio = typeof Audio !== "undefined" ? new Audio(moveSound) : null;
  const chatAudio = typeof Audio !== "undefined" ? new Audio(chatSound) : null;
  const checkAudio = typeof Audio !== "undefined" ? new Audio(chatSound) : null; // Reuse chat sound for check
  
  // Handle audio loading errors
  useEffect(() => {
    if (moveAudio) {
      moveAudio.addEventListener('error', () => {
        console.log('[Game] Move audio failed to load, continuing without sound');
      });
    }
    if (chatAudio) {
      chatAudio.addEventListener('error', () => {
        console.log('[Game] Chat audio failed to load, continuing without sound');
      });
    }
    if (checkAudio) {
      checkAudio.addEventListener('error', () => {
        console.log('[Game] Check audio failed to load, continuing without sound');
      });
    }
  }, [moveAudio, chatAudio, checkAudio]);
  const [opponentTyping, setOpponentTyping] = useState(false);

  // Function to calculate scores based on captured pieces
  const calculateScores = useCallback(() => {
    const history = chess.history({ verbose: true });
    const whiteCaptures: { [key: string]: number } = { p: 0, n: 0, b: 0, r: 0, q: 0 };
    const blackCaptures: { [key: string]: number } = { p: 0, n: 0, b: 0, r: 0, q: 0 };
    const whiteCapturedPieces: string[] = [];
    const blackCapturedPieces: string[] = [];
    
    history.forEach((move, index) => {
      if (move.captured) {
        // Even indices (0, 2, 4...) are white moves, odd indices are black moves
        if (index % 2 === 0) {
          // White captured a piece
          whiteCaptures[move.captured]++;
          whiteCapturedPieces.push(move.captured);
        } else {
          // Black captured a piece
          blackCaptures[move.captured]++;
          blackCapturedPieces.push(move.captured);
        }
      }
    });
    
    // Calculate scores based on captured pieces
    const whiteScore = Object.entries(whiteCaptures).reduce((score, [piece, count]) => {
      return score + (PIECE_VALUES[piece as keyof typeof PIECE_VALUES] * count);
    }, 0);
    
    const blackScore = Object.entries(blackCaptures).reduce((score, [piece, count]) => {
      return score + (PIECE_VALUES[piece as keyof typeof PIECE_VALUES] * count);
    }, 0);
    
    setScores({ white: whiteScore, black: blackScore });
    setCapturedPieces({ white: whiteCapturedPieces, black: blackCapturedPieces });
  }, [chess]);

  // On mount, read match config from sessionStorage
  useEffect(() => {
    const configRaw = sessionStorage.getItem("matchConfig");
    console.log('[Game] Reading matchConfig from sessionStorage:', configRaw);
    if (!configRaw) {
      setError("No match config found. Please create or join a match from the lobby.");
      return;
    }
    try {
      const config = JSON.parse(configRaw);
      console.log('[Game] Parsed config:', config);
      let timePerSide = config.timePerSide;
      // If timePerSide is <= 10, treat as minutes and convert to seconds (for backward compatibility)
      if (typeof timePerSide === "number" && timePerSide <= 10) {
        timePerSide = timePerSide * 60;
      }
      console.log('[Game] Checking if demo game:', { isDemo: config.isDemo, configKeys: Object.keys(config) });
      if (config.isDemo) {
        console.log('[Game] Setting up demo game');
        setMatch({
          id: config.matchId,
          playerWhite: "DemoPlayer",
          playerBlack: "You",
          wager: config.wager,
          timePerSide: timePerSide,
          moves: [],
          state: "waiting", // Always start as waiting for demo games
        });
        setMyColor("black");
        // Don't set activeColor yet for demo games either
        // setActiveColor("white");
        chess.reset();
        setScores({ white: 0, black: 0 });
        setIsCheck(false);
        
        // Set waiting state for demo games too
        console.log('[Game] Setting waiting state for demo game');
        setWaitingForOpponent(true);
        setClocks({ white: timePerSide, black: timePerSide });
        setIsInitialized(true);
        console.log('[Game] Demo game initialization complete');
      } else {
        // For real games, both players are already joined from the lobby
        console.log('[Game] Setting up real game with config:', config);
        setMatch({
          id: config.matchId,
          playerWhite: config.playerWhite || "Guest",
          playerBlack: config.playerBlack || "Guest",
          wager: config.wager,
          timePerSide: timePerSide,
          moves: [],
          state: "active", // Start as active since both players are already joined
        });
        setMyColor(config.color || "white");
        setActiveColor("white"); // Start with white
        chess.reset();
        setScores({ white: 0, black: 0 });
        setIsCheck(false);
        
        // Both players are already joined from lobby, so start immediately
        console.log('[Game] Both players joined from lobby, starting game immediately');
        setWaitingForOpponent(false);
        setClocks({ white: timePerSide, black: timePerSide });
        
        // Mark as initialized to allow socket events
        setIsInitialized(true);
        console.log('[Game] Game initialization complete - ready to play');
      }
    } catch {
      setError("Invalid match config. Please try again.");
    }
  }, [chess]);

  let username = generateUniqueUsername();

  // Only use socket logic if not demo
  const isDemo = (() => {
    const configRaw = sessionStorage.getItem("matchConfig");
    if (!configRaw) return false;
    try {
      const config = JSON.parse(configRaw);
      return !!config.isDemo;
    } catch {
      return false;
    }
  })();

  // Function to check if current player's king is in check
  const checkForCheck = useCallback(() => {
    // Check if the current player (whose turn it is) is in check
    if (chess.isCheck()) {
      // Show check popup if we are in check (regardless of whose turn it is)
      // This means the opponent just put us in check
      const currentTurn = chess.turn() === 'w' ? 'white' : 'black';
      if (myColor === currentTurn) {
        setIsCheck(true);
        // Play check sound
        if (checkAudio) {
          try {
            checkAudio.volume = sfxVolume / 100;
            checkAudio.play().catch(() => {
              console.log('[Game] Failed to play check sound');
            });
          } catch (error) {
            console.log('[Game] Error playing check sound:', error);
          }
        }
        // Check popup will stay visible until player moves out of check
      }
    } else {
      setIsCheck(false);
    }
  }, [chess, myColor, checkAudio, sfxVolume]);

  // Socket event handler - stabilized with useCallback to prevent socket reconnections
  const handleSocketEvent = useCallback((event: GameEvent) => {
    // Don't process events until initialization is complete
    if (!isInitialized) {
      console.log('[Game] Ignoring socket event - not yet initialized:', event);
      return;
    }
    
    console.log('[Game] handleSocketEvent START', { 
      event, 
      myColor, 
      activeColor, 
      'chess.turn()': chess.turn() === 'w' ? 'white' : 'black',
      waitingForOpponent,
      matchState: match?.state
    });
    if (!match) {
      console.log('[Game] No match, ignoring socket event');
      return;
    }
    if (event.type === "move") {
      // Only apply the move if it's the opponent's move (not our own move being echoed back)
      const currentTurn = chess.turn() === 'w' ? 'white' : 'black';
      console.log('[Game] Processing move event', { currentTurn, myColor, 'is opponent move?': currentTurn !== myColor, event });
      
      // Check if this is our own move being echoed back - if so, don't apply it again
      // We can detect this by checking if the move is valid for the current turn
      // If the move is valid for the current turn, then it's a legitimate move from the opponent
      // If the move is invalid for the current turn, then it's an echo of our own move
      try {
        // Try to validate the move without applying it
        const tempChess = new Chess(chess.fen());
        const isValidMove = tempChess.move({ from: event.from, to: event.to, promotion: "q" });
        if (!isValidMove) {
          console.log('[Game] Ignoring move event - move is invalid for current turn, must be echo of our own move');
          return;
        }
      } catch (error) {
        console.log('[Game] Ignoring move event - move validation failed, must be echo of our own move');
        return;
      }
      
      // Validate the move before applying it
      try {
        const move = chess.move({ from: event.from, to: event.to, promotion: "q" });
        if (move) {
          console.log('[Game] Move applied via socket', { move, 'new chess.turn()': chess.turn() === 'w' ? 'white' : 'black' });
          setMatch((m) => m ? { ...m, moves: [...m.moves, `${event.from}-${event.to}`] } : null);
          const newActiveColor = chess.turn() === 'w' ? 'white' : 'black';
          console.log('[Game] Setting activeColor from', activeColor, 'to', newActiveColor);
          setActiveColor(newActiveColor);
          // Update scores after opponent's move
          calculateScores();
          // Check if we are now in check
          checkForCheck();
          // Clear check state if we moved out of check
          if (isCheck && !chess.isCheck()) {
            console.log('[Game] Player moved out of check via socket, clearing check popup');
            setIsCheck(false);
          }
          // Play sound for opponent's move
          if (moveAudio) { 
            try {
              moveAudio.volume = sfxVolume / 100; 
              moveAudio.play().catch(() => {
                console.log('[Game] Failed to play move sound');
              });
            } catch (error) {
              console.log('[Game] Error playing move sound:', error);
            }
          }
        } else {
          console.log('[Game] Invalid move received via socket:', event);
        }
      } catch (error) {
        console.error('[Game] Error applying move via socket:', error, event);
        // If the chess state is corrupted, reset it
        if (error.message.includes('Invalid move')) {
          console.log('[Game] Chess state corrupted, resetting...');
          chess.reset();
          setActiveColor(chess.turn() === 'w' ? 'white' : 'black');
          setIsCheck(false);
        }
      }
      console.log('[Game] handleSocketEvent END for move');
      return;
    } else if (event.type === "start") {
      console.log('[Game] Processing start event:', event);
      // Only process if this is the first time we're seeing this start event
      if (match && match.state === "active") {
        console.log('[Game] Start event already processed, ignoring');
        return;
      }
      // Process start events from either player - both players need to start the game
      console.log('[Game] Starting game with start event:', event);
      setMatch((m) => m ? { ...m, timePerSide: event.timePerSide, wager: event.wager, id: event.matchId, moves: [], state: "active" } : null);
      // Don't change myColor - it should remain the color set when joining
      // setMyColor(event.color);
      chess.reset();
      setActiveColor(chess.turn() === 'w' ? 'white' : 'black');
      // Initialize clocks when game starts
      setClocks({ white: event.timePerSide, black: event.timePerSide });
      // Reset scores for new game
      setScores({ white: 0, black: 0 });
      // Reset check state
      setIsCheck(false);
      // Clear waiting state
      setWaitingForOpponent(false);
    } else if (event.type === "user-joined") {
      console.log('[Game] User joined event received - this should not happen in new lobby flow');
      // This event should not occur in the new lobby flow since players join in lobby first
      // Both players should already be "joined" when they reach the game
      console.log('[Game] Ignoring user-joined event in new lobby flow');
    } else if (event.type === "resign") {
      console.log('[Game] Processing resign event');
      // Determine who resigned based on who sent the event
      const resignedBy = event.from === "white" ? "white" : "black";
      setMatch((m) => m ? { ...m, state: "ended", resignedBy } : null);
    } else if (event.type === "chat") {
      // Only add messages from the opponent to avoid duplicates
      if (event.from !== myColor) {
        setChatMessages((msgs) => [...msgs, { from: event.from, message: event.message }]);
        if (chatAudio) { 
          try {
            chatAudio.volume = sfxVolume / 100; 
            chatAudio.play().catch(() => {
              console.log('[Game] Failed to play chat sound');
            });
          } catch (error) {
            console.log('[Game] Error playing chat sound:', error);
          }
        }
      }
      setOpponentTyping(false);
    } else if (event.type === "typing") {
      if (event.from !== myColor) {
        setOpponentTyping(true);
        setTimeout(() => setOpponentTyping(false), 2000);
      }

    } else {
      console.log('[Game] Unknown event type:', event.type);
    }
  }, [chess, match, myColor, activeColor, calculateScores, checkForCheck, sfxVolume, moveAudio, chatAudio, setChatMessages, setOpponentTyping, isInitialized, username]);

  const socket = !isDemo ? useGameSocket({
    matchId: match?.id || "",
    myColor,
    onEvent: handleSocketEvent,
    username,
  }) : null;

  // Debug socket connection and send start event
  useEffect(() => {
    if (socket && match && myColor) {
      console.log('[Game] Socket connected with myColor:', myColor, 'matchId:', match?.id, 'match.state:', match?.state, 'waitingForOpponent:', waitingForOpponent);
      
      // In the new lobby flow, both players are already joined when they reach the game
      // No need to wait for user-joined events or send start events
      console.log('[Game] Both players already joined from lobby - game ready to play');
    }
  }, [socket, myColor, match?.id, match, waitingForOpponent]);

  // Rematch button handler



  // Clear processed events when match changes
  useEffect(() => {
    processedEventsRef.current.clear();
  }, [match?.id]);

  // Calculate initial scores when game starts
  useEffect(() => {
    if (match && match.state === "active") {
      calculateScores();
    }
  }, [match?.state, calculateScores]);

  // --- LOCAL MOVE HANDLER ---
  function handleMove(from: string, to: string) {
    console.log('[Game] handleMove START', { myColor, activeColor, from, to, 'chess.turn()': chess.turn() === 'w' ? 'white' : 'black' });
    if (myColor !== activeColor) {
      console.log('[Game] Not your turn!');
      return;
    }
    if (!match || match.state !== "active") return;
    if (!myColor || (myColor !== 'white' && myColor !== 'black')) {
      console.log('[Game] Invalid myColor:', myColor);
      return;
    }
    
    // Only allow the move if it is legal in the current chess.js state
    try {
      const move = chess.move({ from, to, promotion: "q" });
      if (!move) {
        console.log('[Game] Invalid move attempted', { from, to });
        return;
      }
      console.log('[Game] Move successful, updating state...', { move, 'new chess.turn()': chess.turn() === 'w' ? 'white' : 'black' });
      // If move is valid, update state and send to socket
      setMatch((m) => m ? { ...m, moves: [...m.moves, `${from}-${to}`] } : null);
      const newActiveColor = chess.turn() === 'w' ? 'white' : 'black';
      console.log('[Game] Setting activeColor from', activeColor, 'to', newActiveColor);
      setActiveColor(newActiveColor);
      // Update scores after move
      calculateScores();
      // Check if opponent is now in check
      checkForCheck();
      // Clear check state if we moved out of check
      if (isCheck && !chess.isCheck()) {
        console.log('[Game] Player moved out of check, clearing check popup');
        setIsCheck(false);
      }
      console.log('[Game] handleMove END - sent to socket, new activeColor should be:', newActiveColor);
      if (socket && myColor) {
        console.log('[Game] Sending move to socket:', { from, to });
        socket.sendMove(from, to);
      } else {
        console.log('[Game] Cannot send move - socket:', !!socket, 'myColor:', myColor);
      }
      if (moveAudio) { 
        try {
          moveAudio.volume = sfxVolume / 100; 
          moveAudio.play().catch(() => {
            console.log('[Game] Failed to play move sound');
          });
        } catch (error) {
          console.log('[Game] Error playing move sound:', error);
        }
      }
    } catch (error) {
      console.error('[Game] Error making move:', error, { from, to });
      // If the chess state is corrupted, reset it
      if (error.message.includes('Invalid move')) {
        console.log('[Game] Chess state corrupted during move, resetting...');
        chess.reset();
        setActiveColor(chess.turn() === 'w' ? 'white' : 'black');
        setIsCheck(false);
      }
    }
  }

  // --- TIMER LOGIC ---
  useEffect(() => {
    console.log('[Timer] Timer useEffect triggered:', { 
      hasMatch: !!match, 
      matchState: match?.state, 
      waitingForOpponent, 
      activeColor,
      clocks 
    });
    
    if (!match || match.state !== "active" || waitingForOpponent) {
      console.log('[Timer] Timer not starting - conditions not met:', {
        noMatch: !match,
        notActive: match?.state !== "active",
        waiting: waitingForOpponent
      });
      return;
    }
    
    console.log('[Timer] Starting timer for activeColor:', activeColor, 'clocks:', clocks);
    const interval = setInterval(() => {
      setClocks((clocks) => {
        if (activeColor === "white" && clocks.white > 0) {
          console.log('[Timer] Decrementing white clock:', clocks.white - 1);
          return { ...clocks, white: clocks.white - 1 };
        } else if (activeColor === "black" && clocks.black > 0) {
          console.log('[Timer] Decrementing black clock:', clocks.black - 1);
          return { ...clocks, black: clocks.black - 1 };
        }
        return clocks;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeColor, match, waitingForOpponent]);

  // Debug activeColor changes
  useEffect(() => {
    console.log('[Debug] activeColor changed to:', activeColor, 'myColor:', myColor, 'chess.turn():', chess.turn() === 'w' ? 'white' : 'black', 'waitingForOpponent:', waitingForOpponent);
  }, [activeColor, myColor, chess, waitingForOpponent]);

  // Debug clocks changes
  useEffect(() => {
    console.log('[Debug] clocks updated:', clocks, 'activeColor:', activeColor);
  }, [clocks, activeColor]);

  // Debug when disabled state changes
  useEffect(() => {
    const isDisabled = myColor !== activeColor || match?.state !== "active";
    console.log('[Debug] Disabled state:', { isDisabled, myColor, activeColor, matchState: match?.state });
  }, [myColor, activeColor, match?.state]);

  // Debug waiting state changes
  useEffect(() => {
    console.log('[Debug] Waiting state changed:', { waitingForOpponent, myColor, matchState: match?.state, isInitialized });
  }, [waitingForOpponent, myColor, match?.state, isInitialized]);

  // Debug match state changes
  useEffect(() => {
    console.log('[Debug] Match state changed:', { matchState: match?.state, waitingForOpponent, isInitialized });
  }, [match?.state, waitingForOpponent, isInitialized]);

  // Sync waiting state with match state
  useEffect(() => {
    if (match?.state === "active" && waitingForOpponent) {
      console.log('[Debug] Syncing: Match is active but still waiting, clearing waiting state');
      setWaitingForOpponent(false);
    }
  }, [match?.state, waitingForOpponent]);

  // Debug chess reset
  useEffect(() => {
    console.log('[Debug] Chess reset, turn is:', chess.turn() === 'w' ? 'white' : 'black', 'activeColor:', activeColor);
  }, [chess, activeColor]);

  // --- TIMEOUT LOGIC ---
  useEffect(() => {
    if (!match || match.state !== "active") return;
    if (clocks.white === 0) {
      setMatch((m) => m ? { ...m, state: "ended", resignedBy: "white" } : null);
      if (myColor === "white") socket?.sendResign(myColor);
    } else if (clocks.black === 0) {
      setMatch((m) => m ? { ...m, state: "ended", resignedBy: "black" } : null);
      if (myColor === "black") socket?.sendResign(myColor);
    }
  }, [clocks.white, clocks.black, match, myColor, socket]);

  // --- GAME END RESULT ---
  const result = useMemo(() => {
    console.log('[Debug] Result calculation:', { matchState: match?.state, hasMatch: !!match });
    if (!match || match.state !== "ended") return null;
    console.log('[Debug] Game ended, calculating result');
    let winner: "white" | "black" | null = null;
    let reason = "";
    if (chess.isCheckmate()) {
      winner = activeColor === "white" ? "black" : "white";
      reason = "Checkmate";
    } else if (clocks.white === 0) {
      winner = "black";
      reason = "Timeout";
    } else if (clocks.black === 0) {
      winner = "white";
      reason = "Timeout";
    } else if (match.moves.length > 0 && match.moves[match.moves.length - 1] === "resign") {
      // Use resignedBy field to determine winner
      winner = match.resignedBy === "white" ? "black" : "white";
      reason = "Resignation";
    } else {
      reason = "Draw or Other";
    }
    let youWon = (winner && myColor === winner);
    let youLost = (winner && myColor !== winner);
    return {
      winner,
      reason,
      youWon,
      youLost,
      wager: match.wager,
    };
  }, [match, chess, activeColor, clocks, myColor]);

  function handleSendChat(msg: string) {
    if (!msg.trim()) return;
    setChatMessages((msgs) => [...msgs, { from: myColor, message: msg }]);
    socket?.sendChat(myColor, msg);
  }

  // --- RESIGN HANDLER ---
  function handleResign() {
    if (!match || match.state !== "active") return;
    setShowResignModal(false);
    setTimeout(() => {
      setMatch((m) => m ? { ...m, state: "ended", resignedBy: myColor } : null);
      socket?.sendResign(myColor);
    }, 300);
  }



  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-2xl text-red-500">{error}</div>;
  }
  if (!match) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <Skeleton className="h-10 w-2/3 mb-6 mx-auto" />
          <div className="flex flex-col md:flex-row gap-6 md:gap-[30px] items-center justify-center">
            <Skeleton className="w-64 h-80 rounded-xl" />
            <Skeleton className="w-full max-w-[350px] h-[350px] rounded-xl" />
            <Skeleton className="w-80 h-80 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative flex flex-col" style={{ backgroundImage: 'url(/src/assets/mystical-chess-arena.png)' }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-4 sm:py-8 flex flex-col gap-4 sm:gap-6">
        {/* Main Game Layout - Responsive */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-[30px] justify-center items-stretch w-full">
          {/* Sidebar */}
          <div className="md:mt-[56px] flex-1 flex justify-center md:justify-end mb-4 md:mb-0 transition-all duration-300">
            <GameSidebar
              playerWhite={match.playerWhite}
              playerBlack={match.playerBlack}
              myColor={myColor}
              onResign={() => setShowResignModal(true)}
              wager={match.wager}
              timePerSide={match.timePerSide}
              clocks={clocks}
              activeColor={activeColor}
              waitingForOpponent={waitingForOpponent}
            />
          </div>
          {/* Enhanced Chess Board + Info Bar */}
          <div className="flex flex-col items-center justify-center flex-shrink-0 w-full max-w-[95vw] sm:max-w-[400px] mx-auto transition-all duration-300">
            {/* Game Status Indicator */}
            {isCheck && (
              <div className="mb-4 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/40 rounded-lg px-4 py-2 shadow-lg animate-pulse">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                  CHECK!
                </div>
              </div>
            )}
            {/* Enhanced Info Bar - Centered above chessboard */}
            <div className="w-full flex justify-center mb-4">
              <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl border border-cyan-500/20 px-6 py-3 shadow-xl">
                <div className="flex gap-6 sm:gap-8 items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-xl font-bold text-yellow-400">${match.wager} Wagered</span>
                  </div>
                  <div className="w-px h-6 bg-cyan-500/30"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-glow rounded-full"></div>
                    <span className="text-lg font-medium text-foreground">
                      Elapsed:
                      <span className="ml-2 text-cyan-glow font-bold">
                        {(() => {
                          const elapsed = (match.timePerSide - clocks.white) + (match.timePerSide - clocks.black);
                          const min = Math.floor(elapsed / 60);
                          const sec = elapsed % 60;
                          return `${min}:${String(sec).padStart(2, '0')}`;
                        })()}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-center">
              <div className="w-full max-w-[95vw] sm:max-w-[400px] aspect-square transition-all duration-300 relative">
                <ChessBoard
                  chess={chess}
                  myColor={myColor}
                  activeColor={activeColor}
                  onMove={handleMove}
                  disabled={myColor !== activeColor || match.state !== "active" || waitingForOpponent}
                  isCheck={isCheck}
                  waitingForOpponent={waitingForOpponent}
                />
                {/* Waiting for Opponent Overlay */}
                {waitingForOpponent && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm text-cyan-glow rounded-lg z-20">
                    <div className="text-center p-8 bg-card/90 rounded-xl shadow-2xl border border-cyan-500/30">
                      <div className="animate-pulse mb-4 text-4xl">⏳</div>
                      <div className="text-3xl font-bold mb-2">Waiting for opponent to join...</div>
                      <div className="text-lg text-muted-foreground">Clocks paused</div>
                      <div className="mt-4 text-sm text-cyan-400/70">Please wait while your opponent joins the match</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Enhanced Captured Pieces Display */}
            <div className="w-full flex justify-center mt-6">
              <CapturedPieces capturedPieces={capturedPieces} />
            </div>
          </div>
          {/* Chat Menu */}
          <div className="md:mt-[56px] flex-1 flex justify-center md:justify-start mt-4 md:mt-0 transition-all duration-300">
            <GameChat
              messages={chatMessages}
              onSend={handleSendChat}
              myColor={myColor}
              playerWhite={match!.playerWhite}
              playerBlack={match!.playerBlack}
              onTyping={() => socket?.sendTyping(myColor)}
              opponentTyping={opponentTyping}
            />
          </div>
        </div>
        {/* Resign Confirmation Modal */}
        <AlertDialog open={showResignModal} onOpenChange={setShowResignModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Resignation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to resign? This will end the game and count as a loss.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResign} className="bg-red-600 hover:bg-red-700 text-white">
                Resign
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


        {/* Game End Modal/Overlay */}
        {result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-500">
            <div className="bg-gradient-to-br from-card/95 to-card/90 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 min-w-[380px] max-w-[500px] animate-fade-in border border-cyan-500/20">
              {/* Header */}
              <div className="flex flex-col items-center gap-3">
                <h2 className="text-4xl font-bold text-cyan-glow text-center">Game Over</h2>
              </div>

              {/* Result Display */}
              <div className="text-center space-y-2">
                <div className={`text-2xl font-bold ${result.youWon ? 'text-green-400' : result.youLost ? 'text-red-400' : 'text-yellow-400'}`}>
                  {result.youWon && <span className="animate-pulse">Victory!</span>}
                  {result.youLost && <span>Defeat</span>}
                  {!result.youWon && !result.youLost && <span>Draw</span>}
                </div>
                <div className="text-lg text-muted-foreground font-medium">
                  {result.reason}
                </div>
              </div>

                            {/* Game Statistics */}
              <div className="w-full bg-muted/20 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Wager:</span>
                  <span className={`font-bold text-lg ${result.youWon ? 'text-green-400' : result.youLost ? 'text-red-400' : 'text-yellow-400'}`}>
                    {result.youWon ? `+$${result.wager}` : result.youLost ? `-$${result.wager}` : `$${result.wager}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Moves:</span>
                  <span className="font-semibold">{match.moves.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Time Used:</span>
                  <span className="font-semibold">
                    {myColor === 'white' ? 
                      `${Math.floor((match.timePerSide - clocks.white) / 60)}:${String(Math.floor((match.timePerSide - clocks.white) % 60)).padStart(2, '0')}` :
                      `${Math.floor((match.timePerSide - clocks.black) / 60)}:${String(Math.floor((match.timePerSide - clocks.black) % 60)).padStart(2, '0')}`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Opponent Time:</span>
                  <span className="font-semibold">
                    {myColor === 'white' ? 
                      `${Math.floor((match.timePerSide - clocks.black) / 60)}:${String(Math.floor((match.timePerSide - clocks.black) % 60)).padStart(2, '0')}` :
                      `${Math.floor((match.timePerSide - clocks.white) / 60)}:${String(Math.floor((match.timePerSide - clocks.white) % 60)).padStart(2, '0')}`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Game Duration:</span>
                  <span className="font-semibold">
                    {Math.floor((Date.now() - (match.id.split('_')[1] ? parseInt(match.id.split('_')[1]) : Date.now())) / 1000)}s
                  </span>
                </div>
              </div>

              {/* Player Info */}
              <div className="w-full space-y-2">
                <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                  <span className="text-muted-foreground">White:</span>
                  <span className="font-semibold">{match.playerWhite}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-black/5 rounded">
                  <span className="text-muted-foreground">Black:</span>
                  <span className="font-semibold">{match.playerBlack}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="w-full">
                <button 
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold transition-all duration-200 hover:scale-105 shadow-lg" 
                  onClick={() => window.location.href = "/lobby"}
                >
                  Back to Lobby
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 