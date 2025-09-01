import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopNavbar } from '@/components/TopNavbar';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type LeaderboardEntry = Database['public']['Functions']['get_leaderboard']['Returns'][0];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.rpc('get_leaderboard');
        
        if (error) throw error;
        
        setEntries(data);
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();

    // Set up real-time subscription for the leaderboard view
    const channel = supabase
      .channel('leaderboard_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_view'
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        
        {error ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {error}
          </div>
        ) : (
          <Leaderboard
            entries={entries}
            isLoading={isLoading}
            updatedAt={lastUpdated}
          />
        )}
      </div>
    </div>
  );
}