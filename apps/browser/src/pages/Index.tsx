import { TopNavbar } from '@/components/TopNavbar';
import { Sidebar } from '@/components/Sidebar';
import { FeaturedGames } from '@/components/FeaturedGames';
import LiveBetsFeed from '@/components/LiveBetsFeed';
import { FAQ } from '@/components/FAQ';
import { useAuthStore } from '@/stores/authStore';

const Index = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <TopNavbar />
        
        {/* Featured Games Section */}
        <main className="flex-1 overflow-auto">
          <FeaturedGames />
          <LiveBetsFeed />
          <FAQ />
        </main>
      </div>
    </div>
  );
};

export default Index;
