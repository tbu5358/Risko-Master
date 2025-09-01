import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, Music, Bell, Monitor, Moon, Sun } from "lucide-react";

export default function Settings() {
  const [musicVolume, setMusicVolume] = useState(50);
  const [sfxVolume, setSfxVolume] = useState(80);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedMusicVolume = localStorage.getItem("musicVolume");
    const savedSfxVolume = localStorage.getItem("sfxVolume");
    const savedNotifications = localStorage.getItem("notifications");
    const savedDarkMode = localStorage.getItem("darkMode");
    const savedAutoPlay = localStorage.getItem("autoPlay");

    if (savedMusicVolume) setMusicVolume(parseInt(savedMusicVolume));
    if (savedSfxVolume) setSfxVolume(parseInt(savedSfxVolume));
    if (savedNotifications !== null) setNotifications(savedNotifications === "true");
    if (savedDarkMode !== null) setDarkMode(savedDarkMode === "true");
    if (savedAutoPlay !== null) setAutoPlay(savedAutoPlay === "true");
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("musicVolume", musicVolume.toString());
  }, [musicVolume]);

  useEffect(() => {
    localStorage.setItem("sfxVolume", sfxVolume.toString());
  }, [sfxVolume]);

  useEffect(() => {
    localStorage.setItem("notifications", notifications.toString());
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("autoPlay", autoPlay.toString());
  }, [autoPlay]);

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative pb-20" style={{ backgroundImage: 'url(/src/assets/mystical-chess-arena.png)' }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">Settings</h1>
        </div>

        {/* Settings Content */}
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Audio Settings */}
          <Card className="bg-card/70 border-cyan-glow/20">
            <CardHeader>
              <CardTitle className="text-cyan-glow flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Audio Settings
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Adjust music and sound effect volumes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground font-medium flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    Music Volume
                  </Label>
                  <span className="text-cyan-glow font-semibold">{musicVolume}%</span>
                </div>
                <Slider
                  value={[musicVolume]}
                  onValueChange={([value]) => setMusicVolume(value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Sound Effects Volume
                  </Label>
                  <span className="text-cyan-glow font-semibold">{sfxVolume}%</span>
                </div>
                <Slider
                  value={[sfxVolume]}
                  onValueChange={([value]) => setSfxVolume(value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Game Settings */}
          <Card className="bg-card/70 border-cyan-glow/20">
            <CardHeader>
              <CardTitle className="text-cyan-glow flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Game Settings
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Customize your gaming experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground font-medium">Auto-play Music</Label>
                  <p className="text-sm text-muted-foreground">Automatically play background music</p>
                </div>
                <Switch
                  checked={autoPlay}
                  onCheckedChange={setAutoPlay}
                  className="data-[state=checked]:bg-cyan-glow"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for game events</p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                  className="data-[state=checked]:bg-cyan-glow"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="bg-card/70 border-cyan-glow/20">
            <CardHeader>
              <CardTitle className="text-cyan-glow flex items-center gap-2">
                {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                Appearance
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Customize the app appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground font-medium">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme for better gaming experience</p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  className="data-[state=checked]:bg-cyan-glow"
                />
              </div>
            </CardContent>
          </Card>

          {/* Reset Settings */}
          <Card className="bg-card/70 border-cyan-glow/20">
            <CardHeader>
              <CardTitle className="text-cyan-glow">Reset Settings</CardTitle>
              <CardDescription className="text-muted-foreground">
                Restore all settings to their default values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => {
                  setMusicVolume(50);
                  setSfxVolume(80);
                  setNotifications(true);
                  setDarkMode(true);
                  setAutoPlay(true);
                }}
                className="w-full bg-red-900/20 hover:bg-red-900/30 text-red-400 border-red-400/30 hover:border-red-400/50"
              >
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
} 