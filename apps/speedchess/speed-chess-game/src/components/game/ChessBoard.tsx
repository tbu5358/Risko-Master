import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

interface ChessBoardProps {
  chess: Chess;
  myColor: "white" | "black";
  activeColor: "white" | "black";
  onMove: (from: string, to: string) => void;
  disabled: boolean;
  isCheck?: boolean;
  waitingForOpponent?: boolean;
}

export default function ChessBoard({ chess, myColor, activeColor, onMove, disabled, isCheck = false, waitingForOpponent = false }: ChessBoardProps) {
  // Only allow moves if not disabled and it's your turn
  const allowMove = !disabled && myColor === activeColor;
  
  console.log('[ChessBoard] Render state:', { myColor, activeColor, disabled, allowMove, 'chess.turn()': chess.turn() === 'w' ? 'white' : 'black' });

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    console.log('[ChessBoard] onDrop called:', { 
      sourceSquare, 
      targetSquare, 
      allowMove, 
      myColor, 
      activeColor, 
      disabled,
      'chess.turn()': chess.turn() === 'w' ? 'white' : 'black'
    });
    if (!allowMove) {
      console.log('[ChessBoard] Move denied - not allowed:', { allowMove, myColor, activeColor, disabled });
      return false;
    }
    // Only validate the move, don't apply it
    const move = chess.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (move) {
      // Undo the move immediately so it's only applied in handleMove
      chess.undo();
      console.log('[ChessBoard] Move validated, calling onMove');
      onMove(sourceSquare, targetSquare);
      return true;
    }
    console.log('[ChessBoard] Move failed - invalid move');
    return false;
  };

  return (
    <div className="w-[400px] h-[400px] bg-gradient-to-br from-midnight-blue to-black rounded-lg flex items-center justify-center">
      <div className="relative w-full h-full">
        <Chessboard
          position={chess.fen()}
          boardOrientation={myColor}
          onPieceDrop={onDrop}
          customBoardStyle={{
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
          }}
        />
        {disabled && !waitingForOpponent && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-cyan-glow text-2xl font-bold rounded-lg">
            Waiting for opponent's move...
          </div>
        )}
        {isCheck && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/40 text-red-400 text-3xl font-bold rounded-lg animate-pulse z-10 pointer-events-none">
            CHECK!
          </div>
        )}
      </div>
    </div>
  );
} 