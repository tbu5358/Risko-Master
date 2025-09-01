import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Coins, Crown, Trophy, Users } from "lucide-react";

interface PlayerStatsPanelProps {
  player: {
    username: string;
    avatar?: string;
    level: number;
    xp: number;
    maxXp: number;
    coins: number;
    rank: string;
    onlineFriends: number;
  };
}

export const PlayerStatsPanel = ({ player }: PlayerStatsPanelProps) => {
  const xpProgress = (player.xp / player.maxXp) * 100;

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border shadow-game">
      {/* Player Avatar & Basic Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Avatar className="h-12 w-12 border-2 border-primary shadow-glow-primary">
            <AvatarImage src={player.avatar} alt={player.username} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
              {player.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -top-1 -right-1 bg-secondary rounded-full w-4 h-4 flex items-center justify-center">
            <Crown className="h-2 w-2 text-secondary-foreground" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-foreground">{player.username}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-primary text-primary">
              Level {player.level}
            </Badge>
            <Badge variant="outline" className="text-xs border-secondary text-secondary">
              {player.rank}
            </Badge>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>XP Progress</span>
          <span>{player.xp} / {player.maxXp}</span>
        </div>
        <Progress 
          value={xpProgress} 
          className="h-2 bg-muted"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
          <Coins className="h-4 w-4 text-game-gold" />
          <div>
            <div className="text-xs text-muted-foreground">Balance</div>
            <div className="font-bold text-game-gold">${player.coins.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-secondary" />
          <div>
            <div className="text-xs text-muted-foreground">Friends</div>
            <div className="font-bold text-secondary">{player.onlineFriends} online</div>
          </div>
        </div>
      </div>
    </div>
  );
};