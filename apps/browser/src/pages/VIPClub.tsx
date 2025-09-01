import { useState } from "react";
import { Sidebar } from '@/components/Sidebar';
import { TopNavbar } from '@/components/TopNavbar';

const VIPClub = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">VIP Club</h1>
            <p className="text-muted-foreground">Exclusive benefits and rewards for our VIP members.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VIPClub;