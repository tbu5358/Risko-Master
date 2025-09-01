import { useEffect, useRef, useState } from 'react';
import { Search, User, Bell, Menu, LogOut, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/authStore';
import { AuthModal } from '@/components/AuthModal';
import { SettingsModal } from '@/components/SettingsModal';
import { AddFundsModal } from '@/components/AddFundsModal';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';

export const TopNavbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login'
  });
  const [settingsModal, setSettingsModal] = useState(false);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const headerEl = headerRef.current;
    const mainEl = headerEl?.parentElement?.querySelector('main');

    const updateScrolled = () => {
      const mainScrollTop = (mainEl && 'scrollTop' in mainEl) ? (mainEl as HTMLElement).scrollTop : 0;
      const winScrollTop = window.scrollY || 0;
      setIsScrolled((mainScrollTop > 0) || (winScrollTop > 0));
    };

    updateScrolled();
    mainEl?.addEventListener('scroll', updateScrolled, { passive: true });
    window.addEventListener('scroll', updateScrolled, { passive: true });
    return () => {
      mainEl?.removeEventListener('scroll', updateScrolled as EventListener);
      window.removeEventListener('scroll', updateScrolled as EventListener);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 h-16 border-b border-border/30 flex items-center justify-between px-6 backdrop-blur-md transition-colors ${
        isScrolled ? 'bg-card/60 shadow-sm' : 'bg-card/80'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
          <img 
            src="/lovable-uploads/9F784482-4A00-4F24-88AF-0D271AAFB7E2.png" 
            alt="Risko Logo" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl mx-8">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search for games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border/50 focus:border-primary/50 rounded-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(e);
              }
            }}
          />
        </form>
      </div>

      {/* Player Stats & Actions */}
      <div className="flex items-center space-x-4">
        {/* Stats */}
        <div className="hidden md:flex items-center space-x-6 text-sm">
          <div className="text-center">
            <div className="text-foreground font-semibold">10+</div>
            <div className="text-muted-foreground text-xs">games</div>
          </div>
          <div className="text-center">
            <div className="text-foreground font-semibold">8.4K</div>
            <div className="text-muted-foreground text-xs">playing</div>
          </div>
        </div>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-card border-border p-3">
            <div className="text-sm text-muted-foreground text-center py-6">
              No notifications
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        
        {/* Auth Buttons */}
        {isAuthenticated && user ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">{user.username}</span>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1 cursor-pointer"
                  onClick={() => setAddFundsOpen(true)}
                >
                  <Wallet className="w-3 h-3" />
                  {typeof user.balance === 'number'
                    ? (user.balance <= 0
                        ? 'Add Funds'
                        : `$${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
                    : 'Add Funds'}
                </Badge>
              </div>
            </div>
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <User className="w-4 h-4" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
            >
              Login
            </Button>
            <Button 
              size="sm"
              onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
            >
              Sign Up
            </Button>
          </>
        )}
        
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/20 bg-background/95 backdrop-blur-md">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <Link to="/leaderboard" className="block py-2 text-muted-foreground hover:text-primary font-medium">
              Leaderboard
            </Link>
            <Link to="/dashboard" className="block py-2 text-muted-foreground hover:text-primary font-medium">
              Dashboard
            </Link>
            <Link to="/profile" className="block py-2 text-muted-foreground hover:text-primary font-medium">
              Profile
            </Link>
          </nav>
        </div>
      )}
      
      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        mode={authModal.mode}
        onSwitchMode={(mode) => setAuthModal({ isOpen: true, mode })}
      />
      
      

      <AddFundsModal
        isOpen={addFundsOpen}
        onClose={() => setAddFundsOpen(false)}
      />
    </header>
  );
};
