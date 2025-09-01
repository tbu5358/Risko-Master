import React from 'react';

interface CapturedPiecesProps {
  capturedPieces: {
    white: string[];
    black: string[];
  };
}

// Unicode chess piece symbols
const PIECE_SYMBOLS = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
};

export default function CapturedPieces({ capturedPieces }: CapturedPiecesProps) {
  // Map chess.js piece letters to piece names
  const pieceMap: { [key: string]: string } = {
    'p': 'pawn',
    'n': 'knight', 
    'b': 'bishop',
    'r': 'rook',
    'q': 'queen',
    'k': 'king'
  };

  // Count pieces by type
  const countPieces = (pieces: string[]) => {
    const counts: { [key: string]: number } = {};
    pieces.forEach(piece => {
      const pieceName = pieceMap[piece] || piece;
      counts[pieceName] = (counts[pieceName] || 0) + 1;
    });
    return counts;
  };

  const whiteCounts = countPieces(capturedPieces.white);
  const blackCounts = countPieces(capturedPieces.black);

  // Render pieces in order of value (queen, rook, bishop, knight, pawn)
  const renderPieces = (counts: { [key: string]: number }, color: 'white' | 'black') => {
    const symbols = PIECE_SYMBOLS[color];
    const order = ['queen', 'rook', 'bishop', 'knight', 'pawn']; // king is never captured in normal play
    
    return order.map(pieceType => {
      const count = counts[pieceType] || 0;
      if (count === 0) return null;
      
      return Array.from({ length: count }, (_, i) => (
        <span 
          key={`${pieceType}-${i}`} 
          className={`text-2xl ${color === 'white' ? 'text-white' : 'text-gray-900'} drop-shadow-lg transition-all duration-200 hover:scale-110`}
          style={{ 
            textShadow: color === 'white' 
              ? '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(255,255,255,0.3)' 
              : '2px 2px 4px rgba(255,255,255,0.9), 0 0 8px rgba(0,0,0,0.4), 1px 1px 2px rgba(255,255,255,0.6)' 
          }}
        >
          {symbols[pieceType as keyof typeof symbols]}
        </span>
      ));
    }).flat();
  };

  const hasCapturedPieces = capturedPieces.white.length > 0 || capturedPieces.black.length > 0;

  return (
    <div className="w-full max-w-[400px]">
      <div className="text-center mb-3">
        <div className="font-bold text-cyan-glow text-lg flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-cyan-glow rounded-full"></div>
          Captured Pieces
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4 shadow-xl">
        {!hasCapturedPieces ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-4xl mb-3 opacity-50">♔</div>
            <div className="text-muted-foreground text-sm font-medium">No pieces captured yet</div>
            <div className="text-muted-foreground/60 text-xs mt-1">Captured pieces will appear here</div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            {/* White captured pieces (left side) */}
            <div className="flex flex-col items-center flex-1">
              <div className="text-xs text-muted-foreground mb-2 font-medium">White Captured</div>
              <div className="flex items-center justify-center space-x-1 min-h-[2.5rem] bg-white/5 rounded-lg p-2 border border-white/10">
                {capturedPieces.white.length > 0 ? (
                  renderPieces(whiteCounts, 'white')
                ) : (
                  <span className="text-gray-500 text-sm">—</span>
                )}
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-px h-12 bg-cyan-500/30 mx-4"></div>
            
            {/* Black captured pieces (right side) */}
            <div className="flex flex-col items-center flex-1">
              <div className="text-xs text-muted-foreground mb-2 font-medium">Black Captured</div>
              <div className="flex items-center justify-center space-x-1 min-h-[2.5rem] bg-white/10 rounded-lg p-2 border border-white/20">
                {capturedPieces.black.length > 0 ? (
                  renderPieces(blackCounts, 'black')
                ) : (
                  <span className="text-gray-500 text-sm">—</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 