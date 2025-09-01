import { Button } from "@/components/ui/button";
import { Home, Trophy, Users, Settings, User } from "lucide-react";

interface GameNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const GameNavigation = ({ activeSection, onSectionChange }: GameNavigationProps) => {
  const navItems = [
    { id: 'main', label: 'Home', icon: Home },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-md mx-auto p-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="icon"
                onClick={() => onSectionChange(item.id)}
                className={`
                  relative transition-all duration-300
                  ${isActive ? 'shadow-glow-primary' : 'hover:bg-accent/20'}
                `}
              >
                <Icon className="h-5 w-5" />
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full animate-pulse" />
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};