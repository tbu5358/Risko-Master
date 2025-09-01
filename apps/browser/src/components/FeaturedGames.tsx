import { useState } from 'react';
import { GameCard } from '@/components/GameCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const categories = ['Trending', 'Action', 'Puzzle', 'Adventure', 'Strategy', 'Casual', 'Sports'];

const featuredGames = [
	{
		id: 'snake-royale',
		title: 'Snake Royale',
		thumbnail: '/lovable-uploads/8db44851-1924-4030-9ef7-57b88242c381.png',
		category: 'action',
		players: 4520,
		prize: '$1,800',
		isHot: true,
	},
	{
		id: 'surio',
		title: 'Surio',
		thumbnail: '/lovable-uploads/cacfe553-6472-44e2-b1e2-5f969a729e40.png',
		category: 'action',
		players: 2340,
		prize: '$1,800',
		isHot: true,
	},
	{
		id: 'speed-chess',
		title: 'Speed Chess',
		thumbnail: '/lovable-uploads/8442f0da-f578-4ded-b597-619763f18fac.png',
		category: 'strategy',
		players: 1520,
		prize: '$500',
		isHot: false,
	},
	{
		id: '4',
		title: 'Boomerang Bash',
		thumbnail: '/lovable-uploads/8cde4eb3-e8e4-4d22-84fb-3e696a0c4d6c.png',
		category: 'casual',
		players: 0,
		prize: '$360',
		isHot: false,
	},
	{
		id: '5',
		title: 'Racing Mayhem',
		thumbnail: '/lovable-uploads/000c3764-b47b-47f7-b60b-ee0de891a3b8.png',
		category: 'sports',
		players: 0,
		prize: '$360',
		isHot: false,
	},
	{
		id: '6',
		title: 'Fly Guy',
		thumbnail: '/lovable-uploads/cf660b97-8476-47b4-abb2-0bf0d4edc567.png',
		category: 'adventure',
		players: 0,
		prize: '$360',
		isHot: false,
	},
	{
		id: '7',
		title: 'Hex Jump',
		thumbnail: '/lovable-uploads/518cbc49-f908-4606-b167-656903994bbe.png',
		category: 'puzzle',
		players: 0,
		prize: '$1,800',
		isHot: false,
	},
	{
		id: '8',
		title: 'Slap Royale',
		thumbnail: '/lovable-uploads/0988d9dd-d291-4dd7-85e4-1cb2b22df67c.png',
		category: 'action',
		players: 0,
		prize: '$1,800',
		isHot: false,
	},
	{
		id: '9',
		title: 'Time Bomb',
		thumbnail: '/lovable-uploads/d1a4b94e-c98a-4d29-b235-baec290c9a9f.png',
		category: 'action',
		players: 0,
		prize: '$1,800',
		isHot: false,
	},
	{
		id: '10',
		title: 'Turbo Tag',
		thumbnail: '/lovable-uploads/59a5e84d-2e66-41e8-a449-6a2159c41f7b.png',
		category: 'casual',
		players: 0,
		prize: '$1,800',
		isHot: false,
	},
];

export const FeaturedGames = () => {
	const [activeCategory, setActiveCategory] = useState('Trending');
	const navigate = useNavigate();

	const lockedIds = ['4', '5', '6', '7', '8', '9', '10'];

	const filteredGames =
		activeCategory === 'Trending'
			? featuredGames
			: featuredGames.filter((game) => game.category === activeCategory.toLowerCase());

	const handleGameClick = (gameId: string) => {
		navigate(`/game/${gameId}`);
	};

	return (
		<div className="p-6">
			{/* Header */}
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-foreground mb-4">Featured games</h2>

				{/* Category Filters */}
				<div className="flex flex-wrap gap-2">
					{categories.map((category) => (
						<Button
							key={category}
							variant={activeCategory === category ? 'default' : 'outline'}
							size="sm"
							onClick={() => setActiveCategory(category)}
							className={`rounded-full ${
								activeCategory === category
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground border-border hover:bg-muted'
							}`}
						>
							{category}
						</Button>
					))}
				</div>
			</div>

			{/* Games Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
						locked={lockedIds.includes(game.id)}
						onClick={() => handleGameClick(game.id)}
					/>
				))}
			</div>
		</div>
	);
};