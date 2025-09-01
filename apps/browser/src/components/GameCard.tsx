import { Lock } from 'lucide-react';

interface GameCardProps {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  players: number;
  prize?: string;
  isHot?: boolean;
  onClick?: () => void;
  locked?: boolean;
}

export const GameCard = ({ id, title, thumbnail, players, prize, onClick, locked }: GameCardProps) => {
  const isImageUrl = thumbnail.startsWith('/') || thumbnail.startsWith('http');
  const isOnline = true; // Assume servers are online for now
  
  return (
    <div 
      className="group rounded-xl overflow-hidden border border-border/30 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/10 relative"
      onClick={locked ? undefined : onClick}
    >
      <div className="aspect-square relative">
        {isImageUrl ? (
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-primary/10 to-accent/10"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300"></div>
        )}
        {locked && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
            <Lock className="w-8 h-8 text-white mb-2" />
            <span className="text-white font-bold text-lg">Coming soon</span>
          </div>
        )}
      </div>
      
      <div className="p-3 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-sm">
          <div className={`w-2 h-2 rounded-full ${locked ? 'bg-red-500' : 'bg-green-500'}`} />
          <span className="text-foreground">{players.toLocaleString()}</span>
          <span className="text-muted-foreground">Playing</span>
        </div>
        
        {prize && (
          <div className="text-xs text-muted-foreground">
            Max pot: {prize}
          </div>
        )}
      </div>
    </div>
  );
};