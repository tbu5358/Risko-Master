import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useXPStore } from "@/stores/xpStore";
import { Star, Zap } from "lucide-react";

interface LevelBadgeProps {
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
}

export function LevelBadge({ showProgress = false, size = 'md', variant = 'default' }: LevelBadgeProps) {
  const { level, getXPProgress, flashLobbyActive, flashLobbyEndTime } = useXPStore();
  const progress = getXPProgress();
  const isFlashActive = flashLobbyActive && Date.now() < flashLobbyEndTime;

  const sizeClasses = {
    sm: 'h-6 px-2 text-xs',
    md: 'h-7 px-3 text-sm',
    lg: 'h-8 px-4 text-base'
  };

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (level >= 25) return 'bg-gradient-to-r from-blue-500 to-purple-500';
    if (level >= 10) return 'bg-gradient-to-r from-green-500 to-blue-500';
    return 'bg-gradient-to-r from-yellow-500 to-orange-500';
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        <Badge 
          className={`${sizeClasses[size]} ${getLevelColor(level)} text-white border-0 font-bold relative overflow-hidden`}
        >
          {isFlashActive && (
            <Zap className="w-3 h-3 mr-1 animate-pulse" />
          )}
          <Star className="w-3 h-3 mr-1" />
          {level}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Badge 
          className={`${sizeClasses[size]} ${getLevelColor(level)} text-white border-0 font-bold relative overflow-hidden`}
        >
          {isFlashActive && (
            <Zap className="w-4 h-4 mr-1 animate-pulse" />
          )}
          <Star className="w-4 h-4 mr-1" />
          Level {level}
        </Badge>
        {isFlashActive && (
          <Badge variant="secondary" className="animate-pulse">
            2X XP Active!
          </Badge>
        )}
      </div>
      
      {showProgress && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress.current} XP</span>
            <span>{progress.required} XP</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>
      )}
    </div>
  );
}