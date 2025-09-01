import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TopNavbar } from '@/components/TopNavbar';
import { GameCard } from '@/components/GameCard';
import { Search as SearchIcon, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock games data for search
const allGames = [
  {
    id: '1',
    title: 'Snake Royale',
    thumbnail: '/lovable-uploads/8db44851-1924-4030-9ef7-57b88242c381.png',
    category: 'action',
    players: 4520,
    prize: '$1,800',
    isHot: true,
  },
  {
    id: '2',
    title: 'Last Man Standing',
    thumbnail: '/lovable-uploads/cacfe553-6472-44e2-b1e2-5f969a729e40.png',
    category: 'action',
    players: 2340,
    prize: '$1,800',
    isHot: true,
  },
  {
    id: '3',
    title: 'Racing Mayhem',
    thumbnail: '/lovable-uploads/000c3764-b47b-47f7-b60b-ee0de891a3b8.png',
    category: 'sports',
    players: 1890,
    prize: '$360',
    isHot: true,
  },
  {
    id: '4',
    title: 'Boomerang Bash',
    thumbnail: '/lovable-uploads/8cde4eb3-e8e4-4d22-84fb-3e696a0c4d6c.png',
    category: 'casual',
    players: 3240,
    prize: '$360',
    isHot: false,
  },
  {
    id: '5',
    title: 'Speed Chess',
    thumbnail: '/lovable-uploads/8442f0da-f578-4ded-b597-619763f18fac.png',
    category: 'strategy',
    players: 1520,
    prize: '$500',
    isHot: false,
  },
  {
    id: '6',
    title: 'Fly Guy',
    thumbnail: '/lovable-uploads/cf660b97-8476-47b4-abb2-0bf0d4edc567.png',
    category: 'adventure',
    players: 980,
    prize: '$360',
    isHot: false,
  },
  {
    id: '7',
    title: 'Hex Jump',
    thumbnail: '/lovable-uploads/518cbc49-f908-4606-b167-656903994bbe.png',
    category: 'puzzle',
    players: 2150,
    prize: '$1,800',
    isHot: false,
  },
  {
    id: '8',
    title: 'Slap Royale',
    thumbnail: '/lovable-uploads/0988d9dd-d291-4dd7-85e4-1cb2b22df67c.png',
    category: 'action',
    players: 3780,
    prize: '$1,800',
    isHot: true,
  },
  {
    id: '9',
    title: 'Time Bomb',
    thumbnail: '/lovable-uploads/d1a4b94e-c98a-4d29-b235-baec290c9a9f.png',
    category: 'action',
    players: 1340,
    prize: '$1,800',
    isHot: false,
  },
  {
    id: '10',
    title: 'Turbo Tag',
    thumbnail: '/lovable-uploads/59a5e84d-2e66-41e8-a449-6a2159c41f7b.png',
    category: 'casual',
    players: 2640,
    prize: '$1,800',
    isHot: true,
  },
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [filteredGames, setFilteredGames] = useState(allGames);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('players');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    let filtered = allGames;

    // Filter by search query
    if (query) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(query.toLowerCase()) ||
        game.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(game => game.category === category);
    }

    // Sort games
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'players':
          aValue = a.players;
          bValue = b.players;
          break;
        case 'prize':
          aValue = parseInt(a.prize.replace('$', '').replace(',', ''));
          bValue = parseInt(b.prize.replace('$', '').replace(',', ''));
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = a.players;
          bValue = b.players;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredGames(filtered);
  }, [query, category, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ query: searchQuery });
  };

  const categories = ['all', 'action', 'sports', 'casual', 'strategy', 'adventure', 'puzzle'];

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Games</h1>
          <p className="text-muted-foreground">
            {query ? `Showing results for "${query}"` : 'Find your next favorite game'}
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </div>
        </form>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-card rounded-lg border">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="players">Players</SelectItem>
                <SelectItem value="prize">Prize</SelectItem>
                <SelectItem value="title">Name</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2"
            >
              {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Results */}
        {filteredGames.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  id={game.id}
                  title={game.title}
                  thumbnail={game.thumbnail}
                  category={game.category}
                  players={game.players}
                  prize={game.prize}
                  isHot={game.isHot}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No games found</h3>
            <p className="text-muted-foreground mb-4">
              {query 
                ? `No games match your search for "${query}". Try different keywords or browse all games.`
                : 'Try adjusting your filters or search for specific games.'
              }
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setCategory('all');
                setSearchParams({});
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;