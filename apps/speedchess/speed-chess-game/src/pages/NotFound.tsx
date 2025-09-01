import { useLocation } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-midnight-blue to-black">
      <div className="text-center p-8 bg-card/80 rounded-xl shadow-2xl border-cyan-glow/10">
        <div className="text-6xl mb-4 animate-bounce">♟️🏰</div>
        <h1 className="text-5xl font-bold mb-4 text-cyan-glow">404 - Lost in the Arena</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Oops! This chessboard doesn't exist.<br />
          Maybe you tried a move that's not on the map?
        </p>
        <a
          href="/"
          className="inline-block px-8 py-3 rounded bg-cyan-glow text-black font-bold text-lg hover:bg-cyan-glow/80 transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Return to Lobby
        </a>
      </div>
    </div>
  );
};

export default NotFound;
