import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameCard } from '@/components/GameCard';
import { useNavigate } from 'react-router-dom';
import { Users, Star, Calendar, Crown } from 'lucide-react';

interface GameDetails {
  id: string;
  title: string;
  description: string;
  developer: string;
  rating: number;
  votes: number;
  released: string;
  lastUpdated: string;
  players: number;
  category: string;
  tags: string[];
}

interface RelatedGame {
  id: string;
  title: string;
  thumbnail: string;
  players: number;
  category: string;
}

interface GameLayoutProps {
  gameId: string;
  children: ReactNode; // This will be the iframe
  gameDetails: GameDetails;
  relatedGames: RelatedGame[];
  belowGame?: ReactNode; // Optional toolbar rendered below the iframe
}

export const GameLayout = ({ gameId, children, gameDetails, relatedGames, belowGame }: GameLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-10 space-y-6">
        {/* Game Window */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          {children}
        </div>
        {/* Optional controls directly below game window */}
        {belowGame}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="font-semibold">{gameDetails.rating} / 10</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center space-x-2">
              <Users className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Players</p>
                <p className="font-semibold">{gameDetails.players.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Released</p>
                <p className="font-semibold">{gameDetails.released}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center space-x-2">
              <Crown className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-semibold">{gameDetails.category}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Info */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{gameDetails.title}</h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>by {gameDetails.developer}</span>
                <span>•</span>
                <span>Last updated: {gameDetails.lastUpdated}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {gameDetails.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {gameDetails.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-2 space-y-3 pt-5">
        <h2 className="font-semibold text-lg text-right">More Games</h2>
        {/* Visually reduce GameCard size to 75% on the game page only (GameLayout context) */}
        <div className="grid gap-2 origin-top-left scale-75 justify-end justify-items-end ml-auto w-fit">
          {relatedGames.map(game => (
            <GameCard
              key={game.id}
              {...game}
              onClick={() => navigate(`/game/${game.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};