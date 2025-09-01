import { useState, useEffect } from "react";
import { Clock, Zap } from "lucide-react";

interface MatchTimerProps {
  nextMatchTime?: number; // seconds until next match
}

export const MatchTimer = ({ nextMatchTime = 180 }: MatchTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(nextMatchTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Reset to 3 minutes when match starts
          return 180;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft <= 30;

  return (
    <div className={`
      bg-card/90 backdrop-blur-sm rounded-xl p-4 border-2 transition-all duration-300
      ${isUrgent ? 'border-destructive shadow-glow-accent animate-pulse-glow' : 'border-border shadow-game'}
    `}>
      <div className="flex items-center gap-3">
        <div className={`
          p-2 rounded-lg transition-colors duration-300
          ${isUrgent ? 'bg-destructive/20' : 'bg-primary/20'}
        `}>
          {isUrgent ? (
            <Zap className="h-5 w-5 text-destructive" />
          ) : (
            <Clock className="h-5 w-5 text-primary" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mb-1">
            {isUrgent ? "MATCH STARTING SOON!" : "Next Match In"}
          </div>
          <div className={`
            text-xl font-bold font-mono transition-colors duration-300
            ${isUrgent ? 'text-destructive' : 'text-foreground'}
          `}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Players</div>
          <div className="text-sm font-semibold text-secondary">
            {Math.floor(Math.random() * 50) + 50}/100
          </div>
        </div>
      </div>
    </div>
  );
};