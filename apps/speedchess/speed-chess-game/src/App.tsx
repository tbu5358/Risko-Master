import { useState, useRef, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LobbyList from "./pages/LobbyList";
import NotFound from "./pages/NotFound";
import Leaderboard from "./pages/Leaderboard";
import Game from "./pages/Game";
import Settings from "./pages/Settings";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import musicFile from "@/assets/music.mp3";
import { Slider } from "@/components/ui/slider";
import { Settings as SettingsIcon } from "lucide-react";

import mouseClickSound from "@/assets/mouse-click.mp3";

const queryClient = new QueryClient();

const App = () => {
  // Volume state (0-100)
  const [musicVolume, setMusicVolume] = useState(() => {
    const v = localStorage.getItem("musicVolume");
    return v ? Number(v) : 15;
  });
  const [sfxVolume, setSfxVolume] = useState(() => {
    const v = localStorage.getItem("sfxVolume");
    return v ? Number(v) : 20;
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const [musicNeedsResume, setMusicNeedsResume] = useState(false);
  const mouseClickAudio = typeof Audio !== "undefined" ? new Audio(mouseClickSound) : null;
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem("onboardingComplete") !== "true";
  });
  const handleCloseOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem("onboardingComplete", "true");
  }, []);

  // Persist volume
  useEffect(() => { localStorage.setItem("musicVolume", String(musicVolume)); }, [musicVolume]);
  useEffect(() => { localStorage.setItem("sfxVolume", String(sfxVolume)); }, [sfxVolume]);

  // Set audio volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = musicVolume / 100;
  }, [musicVolume]);

  // Auto play/loop music, handle autoplay block
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = musicVolume / 100;
      audioRef.current.play().catch(() => {
        setMusicNeedsResume(true);
      });
    }
  }, []);
  // Handler to resume music on user interaction
  const handleResumeMusic = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setMusicNeedsResume(false));
    }
  };

  // Play click sound on every button click
  useEffect(() => {
    function handleButtonClick(e: MouseEvent) {
      // Only play for left clicks on <button> elements
      if (e.button !== 0) return;
      let el = e.target as HTMLElement | null;
      while (el) {
        if (el.tagName === "BUTTON") {
          if (mouseClickAudio) {
            mouseClickAudio.volume = sfxVolume / 100;
            mouseClickAudio.currentTime = 0;
            mouseClickAudio.play();
          }
          break;
        }
        el = el.parentElement;
      }
    }
    document.addEventListener("click", handleButtonClick, true);
    return () => document.removeEventListener("click", handleButtonClick, true);
  }, [sfxVolume]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* Onboarding Overlay */}
        {showOnboarding && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">
            <div className="bg-card/90 rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-md sm:max-w-lg w-full flex flex-col items-center gap-4 sm:gap-5 md:gap-6 animate-fade-in">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-cyan-glow mb-1 sm:mb-2 text-center">Welcome to SpeedChess Arena!</h2>
              <ul className="text-sm sm:text-base md:text-lg text-foreground space-y-2 sm:space-y-3 text-left list-disc pl-5 sm:pl-6">
                <li>Click a piece and then a square to move. Only legal moves are allowed.</li>
                <li>Win by checkmate or if your opponent runs out of time.</li>
                <li>Use the chat to message your opponent during the game.</li>
                <li>After a game, use <span className="font-semibold text-cyan-glow">Rematch</span> to play again instantly.</li>
                <li>Adjust sound/music and other settings from the <span className="font-semibold text-cyan-glow">Settings</span> tab in the bottom navigation.</li>
                <li>Your wallet, leaderboard, and profile are always accessible from the main menu.</li>
              </ul>
              <button
                className="mt-2 sm:mt-3 md:mt-4 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded bg-cyan-glow text-black font-bold text-sm sm:text-base md:text-lg hover:bg-cyan-glow/80 transition-all duration-200 hover:scale-105 shadow-lg"
                onClick={handleCloseOnboarding}
              >
                Got it!
              </button>
            </div>
          </div>
        )}
        {/* Background music */}
        <audio ref={audioRef} src={musicFile} autoPlay loop style={{ display: "none" }} />
        {/* Play Music overlay if needed */}
        {musicNeedsResume && (
          <button
            onClick={handleResumeMusic}
            className="fixed top-20 right-4 z-50 bg-cyan-glow text-black font-bold px-4 py-2 rounded shadow-lg border border-cyan-glow/40 hover:bg-cyan-glow/90 transition"
          >
            ▶ Play Music
          </button>
        )}


        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lobby" element={<LobbyList />} />
            <Route path="/game" element={<Game sfxVolume={sfxVolume} />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
