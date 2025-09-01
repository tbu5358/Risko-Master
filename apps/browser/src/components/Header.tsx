import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  isWalletConnected: boolean;
  onConnectWallet: () => void;
}

export const Header = ({ isWalletConnected, onConnectWallet }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold font-montserrat tracking-wide text-primary">
            NEXUS
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#games" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Games
          </a>
          <a href="#stats" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Stats
          </a>
          <a href="#leaderboard" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Leaderboard
          </a>
        </nav>

        {/* Wallet Connection */}
        <div className="flex items-center space-x-4">
          {isWalletConnected && (
            <Badge variant="outline" className="border-success text-success">
              Connected
            </Badge>
          )}
          <Button 
            onClick={onConnectWallet}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold teal-glow"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {isWalletConnected ? 'Disconnect' : 'Connect Wallet'}
          </Button>
          
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/20 bg-background/95 backdrop-blur-md">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <a href="#games" className="block py-2 text-muted-foreground hover:text-primary font-medium">
              Games
            </a>
            <a href="#stats" className="block py-2 text-muted-foreground hover:text-primary font-medium">
              Stats
            </a>
            <a href="#leaderboard" className="block py-2 text-muted-foreground hover:text-primary font-medium">
              Leaderboard
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
