interface GameSidebarProps {
  playerWhite: string;
  playerBlack: string;
  myColor: "white" | "black";
  onResign: () => void;
  wager: number;
  timePerSide: number;
  clocks: { white: number; black: number };
  activeColor: "white" | "black";
  waitingForOpponent?: boolean;
}

export default function GameSidebar({ playerWhite, playerBlack, myColor, onResign, wager, timePerSide, clocks, activeColor, waitingForOpponent }: GameSidebarProps) {
  // Helper function to get clock color based on time remaining
  const getClockColor = (time: number) => {
    if (time <= 30) return "text-red-400 animate-pulse"; // Critical time
    if (time <= 60) return "text-yellow-400"; // Warning time
    return "text-cyan-glow"; // Normal time
  };

  // Helper function to get player status
  const getPlayerStatus = (color: "white" | "black") => {
    if (waitingForOpponent) return "text-gray-400";
    if (activeColor === color) return "text-cyan-glow font-bold";
    return "text-muted-foreground";
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-xl border border-cyan-500/20 p-6 w-64 flex flex-col gap-6">
      {/* Players Section */}
      <div>
        <div className="font-bold text-cyan-glow text-lg mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-glow rounded-full"></div>
          Players
        </div>
        <div className="flex flex-col gap-3">
          <div className={`p-3 rounded-lg transition-all duration-200 ${activeColor === "white" ? "bg-cyan-500/10 border border-cyan-500/30" : "bg-gray-800/30"}`}>
              <div className={`font-semibold ${getPlayerStatus("white")}`}>
                {playerWhite}
            </div>
            <div className="text-xs text-muted-foreground">White Player</div>
          </div>
          
          <div className={`p-3 rounded-lg transition-all duration-200 ${activeColor === "black" ? "bg-cyan-500/10 border border-cyan-500/30" : "bg-gray-800/30"}`}>
              <div className={`font-semibold ${getPlayerStatus("black")}`}>
                {playerBlack}
            </div>
            <div className="text-xs text-muted-foreground">Black Player</div>
          </div>
        </div>
        
        {waitingForOpponent && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-lg text-center shadow-lg">
            <div className="text-yellow-400 text-lg font-bold mb-1">⏳ Waiting for opponent...</div>
            <div className="text-yellow-400/80 text-sm">Clocks paused until opponent joins</div>
            <div className="text-yellow-400/60 text-xs mt-1">Please wait while your opponent joins the match</div>
          </div>
        )}
      </div>

      {/* Clocks Section - Enhanced */}
      <div>
        <div className="font-bold text-cyan-glow text-lg mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-glow rounded-full"></div>
          Clocks
        </div>
        <div className="flex flex-col gap-3">
          <div className={`p-3 rounded-lg transition-all duration-200 ${activeColor === "white" ? "bg-cyan-500/10 border border-cyan-500/30" : "bg-gray-800/30"}`}>
            <div className="text-xs text-muted-foreground mb-1">White</div>
            <div className={`text-2xl font-bold ${getClockColor(clocks.white)}`}>
              {Math.floor(clocks.white / 60)}:{(clocks.white % 60).toString().padStart(2, '0')}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg transition-all duration-200 ${activeColor === "black" ? "bg-cyan-500/10 border border-cyan-500/30" : "bg-gray-800/30"}`}>
            <div className="text-xs text-muted-foreground mb-1">Black</div>
            <div className={`text-2xl font-bold ${getClockColor(clocks.black)}`}>
              {Math.floor(clocks.black / 60)}:{(clocks.black % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Resign Button - Enhanced */}
      <div className="mt-auto">
        <button 
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg px-4 py-3 font-bold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-red-500/25 border border-red-500/30" 
          onClick={onResign}
        >
          Resign Game
        </button>
      </div>
    </div>
  );
} 