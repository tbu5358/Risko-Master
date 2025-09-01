import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Clock, 
  TrendingUp, 
  Gift,
  Users,
  Trophy,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Headphones,
  Globe,
  ChevronDown
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276c-.598.343-1.2205.645-1.8733.8925a.0766.0766 0 00-.0407.1056c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1835 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.1046 2.1568 2.4189 0 1.3333-.9555 2.419-2.1569 2.419zm7.9748 0c-1.1835 0-2.1568-1.0857-2.1568-2.419 0-1.3332.9554-2.4189 2.1568-2.4189 1.2108 0 2.1757 1.1046 2.1568 2.4189 0 1.3333-.946 2.419-2.1568 2.419Z" />
  </svg>
);

const navigationItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Clock, label: 'Recently Played', path: '/recently-played' },
  { icon: TrendingUp, label: 'Trending Now', path: '/trending-now' },
  { icon: Gift, label: 'Promotions', path: '/promotions' },
  { icon: Users, label: 'Affiliate', path: '/affiliate' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: DiscordIcon, label: 'Discord', path: 'https://discord.com', external: true },
  { icon: Headphones, label: 'Live Support', path: '/live-support' },
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleNavigation = (item: typeof navigationItems[0]) => {
    if (item.external) {
      window.open(item.path, '_blank');
    } else {
      navigate(item.path);
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // In a real app, this would trigger a language change
    console.log(`Language changed to: ${languageCode}`);
    window.location.reload(); // Simulate page reload for language change
  };

  const selectedLang = languages.find(lang => lang.code === selectedLanguage);

  return (
    <div className="w-64 sticky top-0 h-screen overflow-y-auto bg-sidebar-bg border-r border-border/30 flex flex-col">
      {/* Navigation Section */}
      <div className="p-4 flex-1">
        <nav className="space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <div key={item.label}>
                <button
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </button>
                {/* Add separator after Trending Now (index 2) */}
                {index === 2 && (
                  <Separator className="my-2" />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Language Selection */}
      <div className="p-4 border-t border-border/30">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Language
          </label>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full bg-background/50 border-border/50">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedLang?.flag}</span>
                  <span className="text-sm">{selectedLang?.name}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{language.flag}</span>
                    <span>{language.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
