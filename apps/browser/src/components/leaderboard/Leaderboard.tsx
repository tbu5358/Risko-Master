import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Podium } from './Podium';
import { LeaderboardRow } from './LeaderboardRow';
import { LeaderboardLoadingState } from './LoadingState';
import type { LeaderboardProps } from './types';

export function Leaderboard({ entries, isLoading, updatedAt }: LeaderboardProps) {
  if (isLoading) {
    return (
      <div className="flex-1 overflow-x-hidden overflow-y-auto pt-6 md:pt-8 pb-8">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <LeaderboardLoadingState />
        </div>
      </div>
    );
  }

  // Split entries into podium and rest
  const podiumEntries = entries.slice(0, 3);
  const remainingEntries = entries.slice(3);

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground">
      <main className="flex-1 overflow-x-hidden overflow-y-auto pt-6 md:pt-8 pb-8">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          {/* Podium Section */}
          <section className="mb-8">
            <div className="bg-card/90 backdrop-blur border border-border rounded-xl overflow-visible">
              <div className="p-4 sm:p-8 pt-8 sm:pt-10">
                <Podium entries={podiumEntries} />
              </div>
            </div>
          </section>

          {/* List Section */}
          <section>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground border-b border-border">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5 md:col-span-6">Username</div>
                <div className="col-span-3 md:col-span-2 text-right">Total PnL</div>
                <div className="col-span-3 md:col-span-3 text-right">Win Rate</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-border">
                {remainingEntries.map((entry, index) => (
                  <LeaderboardRow
                    key={entry.username}
                    rank={index + 4}
                    entry={entry}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Updated timestamp if available */}
          {updatedAt && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Last updated: {new Date(updatedAt).toLocaleString()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}