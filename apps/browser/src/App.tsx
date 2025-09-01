import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { DailyLoginReward } from "@/components/DailyLoginReward";
import { XPNotification } from "@/components/XPNotification";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import LeaderboardPage from "./pages/LeaderboardPage";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Search from "./pages/Search";
import RecentlyPlayed from "./pages/RecentlyPlayed";
import TrendingNow from "./pages/TrendingNow";
import Promotions from "./pages/Promotions";
import Affiliate from "./pages/Affiliate";
import LiveSupport from "./pages/LiveSupport";
import NotFound from "./pages/NotFound";
import Game from "./pages/Game";
import { Footer } from "@/components/Footer";

const queryClient = new QueryClient();

const App = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/recently-played" element={<RecentlyPlayed />} />
            <Route path="/trending-now" element={<TrendingNow />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/affiliate" element={<Affiliate />} />
            <Route path="/live-support" element={<LiveSupport />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:username" element={<UserProfile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/game/:gameId" element={<Game />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
          <DailyLoginReward />
          <XPNotification />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
