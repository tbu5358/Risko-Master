import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Volume2, Shield, LogOut, User, Bell } from "lucide-react";

export const SettingsPage = () => {
  const [masterVolume, setMasterVolume] = useState([75]);
  const [soundEffects, setSoundEffects] = useState([65]);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [friendRequestsEnabled, setFriendRequestsEnabled] = useState(true);

  return (
    <div className="min-h-screen p-6 bg-black">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-center text-yellow-400">
          ⚙️ Settings
        </h2>
        
        {/* Audio Settings */}
        <div className="bg-gray-900/50 border border-orange-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="h-5 w-5 text-orange-400" />
            <h3 className="font-semibold text-yellow-400">Audio Settings</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white">Master Volume</span>
                <span className="text-gray-400">{masterVolume[0]}%</span>
              </div>
              <Slider
                value={masterVolume}
                onValueChange={setMasterVolume}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white">Sound Effects</span>
                <span className="text-gray-400">{soundEffects[0]}%</span>
              </div>
              <Slider
                value={soundEffects}
                onValueChange={setSoundEffects}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white">Background Music</span>
              <Switch
                checked={musicEnabled}
                onCheckedChange={setMusicEnabled}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-gray-900/50 border border-orange-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-orange-400" />
            <h3 className="font-semibold text-yellow-400">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white">Game Notifications</span>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white">Friend Requests</span>
              <Switch
                checked={friendRequestsEnabled}
                onCheckedChange={setFriendRequestsEnabled}
              />
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-gray-900/50 border border-orange-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-orange-400" />
            <h3 className="font-semibold text-yellow-400">Privacy & Security</h3>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start bg-transparent border-orange-500/30 text-white hover:bg-orange-500/10"
            >
              <User className="h-4 w-4 mr-3" />
              Change Password
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start bg-transparent border-orange-500/30 text-white hover:bg-orange-500/10"
            >
              <Shield className="h-4 w-4 mr-3" />
              Privacy Settings
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start bg-transparent border-orange-500/30 text-white hover:bg-orange-500/10"
            >
              Block Management
            </Button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-gray-900/50 border border-orange-500/30 rounded-lg p-6">
          <div className="space-y-3">
            <Button 
              variant="destructive" 
              className="w-full justify-start bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};