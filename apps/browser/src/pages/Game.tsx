import { useParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { TopNavbar } from '@/components/TopNavbar';
import { GameLayout } from '@/components/GameLayout';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Maximize } from 'lucide-react';

const GAME_REGISTRY: Record<string, { url: string; title: string; developer: string; category: string; tags: string[] } > = {
  'speed-chess': {
    url: 'http://localhost:5174',
    title: 'Speed Chess',
    developer: 'RISKO Games',
    category: 'Strategy',
    tags: ['Chess', 'Multiplayer', 'Strategy']
  },
  'snake-royale': {
    url: 'http://localhost:5175',
    title: 'Snake Royale',
    developer: 'RISKO Games',
    category: 'Action',
    tags: ['Action', 'Multiplayer', 'Battle Royale']
  },
  'surio': {
    url: 'http://localhost:5176',
    title: 'Surio',
    developer: 'RISKO Games',
    category: 'Action',
    tags: ['Action', 'Survival', 'Battle Royale']
  }
};

// Mock data - replace with actual API calls later
const MOCK_GAMES = {
  'speed-chess': {
    id: 'speed-chess',
    title: 'Speed Chess',
    description: 'SpeedChess is a fast-paced twist on the classic game, where every move counts and the clock is your greatest enemy. Play head-to-head, think on your feet, and outsmart your opponent before time runs out.',

    developer: 'RISKO Games',
    rating: 9.0,
    votes: 1250,
    released: '2025',
    lastUpdated: '2025',
    players: 150,
    category: 'Strategy',
    tags: ['Chess', 'Multiplayer', 'Strategy']
  },
  'snake-royale': {
    id: 'snake-royale',
    title: 'Snake Royale',
    description: 'SnakeRoyale takes the classic snake game and cranks it up into a chaotic multiplayer battle. Grow your snake, trap your rivals, and dominate the arena to become the last serpent standing.',
    developer: 'RISKO Games',
    rating: 8.8,
    votes: 980,
    released: '2025',
    lastUpdated: '2025',
    players: 120,
    category: 'Action',
    tags: ['Action', 'Multiplayer', 'Battle Royale']
  },
  'surio': {
    id: 'surio',
    title: 'Surio',
    description: 'Surio is a high-stakes survival showdown where only the smartest — and fastest — player wins. Outplay, outlast, and outmaneuver everyone else until you’re the final one in the arena.',
    developer: 'Hasanger Games',
    rating: 8.5,
    votes: 500,
    released: '2025',
    lastUpdated: '2025',
    players: 75,
    category: 'Action',
    tags: ['Action', 'Survival', 'Battle Royale']
  }
};

// Mock related games
const MOCK_RELATED = [
  {
    id: 'snake-royale',
    title: 'Snake Royale',
    thumbnail: '/lovable-uploads/8db44851-1924-4030-9ef7-57b88242c381.png',
    players: 4520,
    category: 'Action'
  },
  {
    id: 'surio',
    title: 'Surio',
    thumbnail: '/lovable-uploads/cacfe553-6472-44e2-b1e2-5f969a729e40.png',
    players: 2150,
    category: 'Racing'
  },
  {
    id: 'pixel-warfare',
    title: 'Pixel Warfare',
    thumbnail: '/lovable-uploads/cc3dd5c6-df0d-4798-93d9-91336492e7a8.png',
    players: 3240,
    category: 'Shooter'
  }
];

const Game = () => {
  const { gameId } = useParams();
  const [gameDetails, setGameDetails] = useState(MOCK_GAMES[gameId as keyof typeof MOCK_GAMES]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const gameUrl = useMemo(() => GAME_REGISTRY[gameId || '']?.url, [gameId]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = () => setIsExpanded(prev => !prev);
  const handleFullscreen = () => {
    const el: any = iframeRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  const Controls = (
    <div className="mt-2 flex items-center gap-2 justify-end">
      <Button
        variant="secondary"
        size="icon"
        className="h-9 w-9"
        onClick={handleToggleExpand}
        aria-label={isExpanded ? 'Exit expanded view' : 'Expand to window'}
        title={isExpanded ? 'Exit expanded view' : 'Expand to window'}
      >
        {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="h-9 w-9"
        onClick={handleFullscreen}
        aria-label="Fullscreen"
        title="Fullscreen"
      >
        <Maximize className="h-4 w-4" />
      </Button>
    </div>
  );

  useEffect(() => {
    // In a real app, fetch game details from API here
    setGameDetails(MOCK_GAMES[gameId as keyof typeof MOCK_GAMES]);
    setIsLoading(true);
  }, [gameId]);

  if (!gameDetails || !gameUrl) {
    return <div>Game not found</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <main className="flex-1 overflow-auto">
          <GameLayout
            gameId={gameId!}
            gameDetails={gameDetails}
            relatedGames={MOCK_RELATED}
            belowGame={!isExpanded ? Controls : undefined}
          >
            {!isExpanded && (
              <div className="relative w-full h-full">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-center text-white">
                      <div className="mb-3">Loading game…</div>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto" />
                    </div>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={gameUrl}
                  className="w-full h-full border-none"
                  title={gameDetails.title}
                  allow="fullscreen; autoplay; clipboard-read; clipboard-write; gamepad; xr-spatial-tracking"
                  sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads"
                  allowFullScreen
                  onLoad={() => setIsLoading(false)}
                />
              </div>
            )}
          </GameLayout>

          {/* Expanded overlay that fills the browser window */}
          {isExpanded && (
            <div className="fixed inset-0 z-50 bg-black">
              <iframe
                ref={iframeRef}
                src={gameUrl}
                className="w-full h-full border-none"
                title={gameDetails.title}
                allow="fullscreen; autoplay; clipboard-read; clipboard-write; gamepad; xr-spatial-tracking"
                sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads"
                allowFullScreen
              />
              <div className="absolute bottom-4 right-4">{Controls}</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Game;