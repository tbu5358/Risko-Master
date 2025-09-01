import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopNavbar } from '@/components/TopNavbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Lock, Sparkles, Timer } from 'lucide-react';

// Import chest images
import level2Chest from '@/assets/chests/level-2-chest.png';
import level10Chest from '@/assets/chests/level-10-chest.png';
import level20Chest from '@/assets/chests/level-20-chest.png';
import level30Chest from '@/assets/chests/level-30-chest.png';
import level40Chest from '@/assets/chests/level-40-chest.png';
import level50Chest from '@/assets/chests/level-50-chest.png';
import level60Chest from '@/assets/chests/level-60-chest.png';
import level70Chest from '@/assets/chests/level-70-chest.png';
import level80Chest from '@/assets/chests/level-80-chest.png';
import level90Chest from '@/assets/chests/level-90-chest.png';
import level100Chest from '@/assets/chests/level-100-chest.png';

interface RewardCase {
  level: number;
  unlocked: boolean;
  rewards: { amount: number; chance: number }[];
}

// Function to get chest image by level
const getChestImage = (level: number): string => {
  const chestImages: { [key: number]: string } = {
    2: level2Chest,
    10: level10Chest,
    20: level20Chest,
    30: level30Chest,
    40: level40Chest,
    50: level50Chest,
    60: level60Chest,
    70: level70Chest,
    80: level80Chest,
    90: level90Chest,
    100: level100Chest,
  };
  return chestImages[level] || level2Chest;
};

const rewardCases: RewardCase[] = [
  {
    level: 2,
    unlocked: true,
    rewards: [
      { amount: 0.10, chance: 80 },
      { amount: 0.25, chance: 15 },
      { amount: 0.50, chance: 5 }
    ]
  },
  {
    level: 10,
    unlocked: true,
    rewards: [
      { amount: 0.25, chance: 75 },
      { amount: 0.50, chance: 20 },
      { amount: 2.00, chance: 5 }
    ]
  },
  {
    level: 20,
    unlocked: false,
    rewards: [
      { amount: 0.50, chance: 70 },
      { amount: 1.00, chance: 25 },
      { amount: 5.00, chance: 5 }
    ]
  },
  {
    level: 30,
    unlocked: false,
    rewards: [
      { amount: 1.00, chance: 65 },
      { amount: 2.50, chance: 30 },
      { amount: 10.00, chance: 5 }
    ]
  },
  {
    level: 40,
    unlocked: false,
    rewards: [
      { amount: 1.50, chance: 60 },
      { amount: 5.00, chance: 35 },
      { amount: 25.00, chance: 5 }
    ]
  },
  {
    level: 50,
    unlocked: false,
    rewards: [
      { amount: 2.00, chance: 55 },
      { amount: 10.00, chance: 40 },
      { amount: 50.00, chance: 5 }
    ]
  },
  {
    level: 60,
    unlocked: false,
    rewards: [
      { amount: 5.00, chance: 50 },
      { amount: 15.00, chance: 45 },
      { amount: 75.00, chance: 5 }
    ]
  },
  {
    level: 70,
    unlocked: false,
    rewards: [
      { amount: 7.50, chance: 45 },
      { amount: 25.00, chance: 50 },
      { amount: 100.00, chance: 5 }
    ]
  },
  {
    level: 80,
    unlocked: false,
    rewards: [
      { amount: 10.00, chance: 40 },
      { amount: 50.00, chance: 55 },
      { amount: 200.00, chance: 5 }
    ]
  },
  {
    level: 90,
    unlocked: false,
    rewards: [
      { amount: 15.00, chance: 35 },
      { amount: 75.00, chance: 60 },
      { amount: 500.00, chance: 5 }
    ]
  },
  {
    level: 100,
    unlocked: false,
    rewards: [
      { amount: 25.00, chance: 30 },
      { amount: 100.00, chance: 60 },
      { amount: 1000.00, chance: 10 }
    ]
  }
];

const CaseOpeningAnimation = ({ 
  isOpen, 
  onComplete, 
  rewards 
}: { 
  isOpen: boolean; 
  onComplete: (amount: number) => void;
  rewards: { amount: number; chance: number }[];
}) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [finalAmount, setFinalAmount] = useState(0);
  const [rewardGiven, setRewardGiven] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  // Sound effect functions
  const playSpinSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+PxtWMcBjiS2e7AciUELIHN9NyIOQgZacLv5ZlPC');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore if audio fails
    } catch (e) {
      // Ignore audio errors
    }
  };

  const playRevealSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+PxtWMcBjiS2e7AciUELIHN9NyIOQgZacLv5ZlPCwgOTKXr8rxeGAg+ltryxnkpBSl+zPLaizsIGGS57OihUgwLTKXj9bVjHAU7k9n1unEoBSuBzvTZijoIG2rE7eSXSwtUr+ftrVYcCkWd4/e2Yx0FOJHa88Z4KwUphM/y2Io4CBpruuznn04OC0mm5O2zXRsHPJPY9bx5KgQne8rx3Y04CRZmuu3pp1MMD0ml4/a1ZB0DOpPa9sNxKgUqf8310Y44CBttu+/lm04OC0ah4/++dhxqKhQjKA==');
      audio.volume = 0.5;
      audio.play().catch(() => {}); // Ignore if audio fails
    } catch (e) {
      // Ignore audio errors
    }
  };

  useEffect(() => {
    if (isOpen && !rewardGiven) {
      setIsScrolling(true);
      setRewardGiven(false);
      setShowParticles(false);
      
      // Play spin start sound
      playSpinSound();
      
      // Generate random outcome based on probabilities
      const random = Math.random() * 100;
      let cumulativeChance = 0;
      let selectedAmount = rewards[0].amount;
      
      for (const reward of rewards) {
        cumulativeChance += reward.chance;
        if (random <= cumulativeChance) {
          selectedAmount = reward.amount;
          break;
        }
      }
      
      setFinalAmount(selectedAmount);
      
      // Stop scrolling after 3 seconds with smooth deceleration
      setTimeout(() => {
        setIsScrolling(false);
        setShowParticles(true);
        
        // Play reveal sound and complete
        setTimeout(() => {
          if (!rewardGiven) {
            playRevealSound();
            setRewardGiven(true);
            onComplete(selectedAmount);
          }
        }, 500);
      }, 3000);
    }
  }, [isOpen, rewards, onComplete, rewardGiven]);

  // Reset reward flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRewardGiven(false);
      setShowParticles(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allAmounts = [0.10, 0.25, 0.50, 1.00, 2.50, 5.00, 10.00, 25.00, 50.00, 100.00, 250.00, 500.00, 1000.00];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-card p-8 rounded-xl border border-primary/20 w-[600px] relative">
        <h3 className="text-2xl font-bold text-center mb-6 text-primary">Opening Case...</h3>
        
        <div className="relative h-24 bg-muted/20 rounded-lg overflow-hidden border-2 border-primary/30">
          {/* Motion blur overlay during spin */}
          {isScrolling && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent z-20 animate-pulse" />
          )}
          
          {/* Spinning rewards container */}
          <div 
            className={`flex absolute top-0 left-0 h-full ${isScrolling ? 'blur-sm' : ''}`}
            style={{
              transform: isScrolling 
                ? 'translateX(-2000px)' 
                : `translateX(-${(25 * 96) - 288}px)`, // Center the winning item (container width 576px / 2 = 288px)
              transition: isScrolling 
                ? 'transform 3s cubic-bezier(0.22, 1, 0.36, 1)' 
                : 'transform 0.5s ease-out',
              filter: isScrolling ? 'blur(1px)' : 'none'
            }}
          >
            {Array.from({ length: 50 }, (_, i) => {
              const amount = i === 25 ? finalAmount : allAmounts[i % allAmounts.length];
              const isWinning = !isScrolling && i === 25;
              
              return (
                <div
                  key={i}
                  className={`flex-shrink-0 w-24 h-24 flex items-center justify-center border-r border-border/30 transition-all duration-300 ${
                    isWinning ? 'bg-gradient-to-br from-primary/30 to-primary/10 border-primary border-2 scale-105' : 'bg-muted/10'
                  }`}
                >
                  <span className={`font-bold transition-all duration-300 ${
                    isWinning ? 'text-primary text-lg drop-shadow-glow' : 'text-foreground'
                  }`}>
                    ${amount.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Static highlight zone in center */}
          <div className="absolute top-0 left-1/2 transform -translate-x-12 w-24 h-24 z-10 pointer-events-none">
            {/* Glowing border frame */}
            <div className={`w-full h-full border-2 rounded-lg transition-all duration-300 ${
              !isScrolling && showParticles 
                ? 'border-primary shadow-glow bg-primary/5 animate-pulse' 
                : 'border-primary/60 bg-primary/5'
            }`} />
            
            {/* Corner indicators */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary rounded-tl" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary rounded-tr" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary rounded-bl" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary rounded-br" />
            
            {/* Center target indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-primary/80" />
          </div>
        </div>
        
        {/* Particle effect when reward lands */}
        {showParticles && !isScrolling && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary rounded-full animate-ping"
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-40px)`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
        )}
        
        {!isScrolling && (
          <div className="text-center mt-6 animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
              <Sparkles className="w-6 h-6 animate-bounce" />
              You won ${finalAmount.toFixed(2)}!
              <Sparkles className="w-6 h-6 animate-bounce" style={{ animationDelay: '0.1s' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Rewards = () => {
  const { isLoggedIn } = useAuthStore();
  const { toast } = useToast();
  const [currentLevel] = useState(15); // Mock user level
  const [timeUntilReset, setTimeUntilReset] = useState({ hours: 23, minutes: 59, seconds: 45 });
  const [openingCase, setOpeningCase] = useState<RewardCase | null>(null);
  const [balance, setBalance] = useState(125.50); // Mock balance

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilReset(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOpenCase = (rewardCase: RewardCase) => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to open reward cases.",
        variant: "destructive"
      });
      return;
    }

    if (!rewardCase.unlocked) {
      toast({
        title: "Case Locked",
        description: `Reach level ${rewardCase.level} to unlock this case.`,
        variant: "destructive"
      });
      return;
    }

    setOpeningCase(rewardCase);
  };

  const handleCaseComplete = (amount: number) => {
    setBalance(prev => prev + amount);
    setOpeningCase(null);
    
    toast({
      title: "Reward Claimed!",
      description: `You won $${amount.toFixed(2)}! Added to your balance.`,
    });
  };

  // Update case unlock status based on user level
  const updatedCases = rewardCases.map(caseItem => ({
    ...caseItem,
    unlocked: currentLevel >= caseItem.level
  }));

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-0">
        <TopNavbar />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  Daily Rewards
                </h1>
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Open daily reward cases to earn USD! Level up to unlock higher tier cases with bigger rewards.
              </p>
            </div>

            {/* Balance & Timer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Your Balance</h3>
                    <p className="text-2xl font-bold text-primary">${balance.toFixed(2)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
                <div className="flex items-center gap-3">
                  <Timer className="w-6 h-6 text-orange-500" />
                  <div>
                    <h3 className="font-semibold">Next Free Case Reset</h3>
                    <p className="text-2xl font-bold text-orange-500">
                      {String(timeUntilReset.hours).padStart(2, '0')}:
                      {String(timeUntilReset.minutes).padStart(2, '0')}:
                      {String(timeUntilReset.seconds).padStart(2, '0')}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Level Progress */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Your Level Progress</h3>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Level {currentLevel}
                  </Badge>
                </div>
                <Progress value={(currentLevel % 10) * 10} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  Next level: {currentLevel + 1} • {100 - ((currentLevel % 10) * 10)}% to go
                </p>
              </div>
            </Card>

            {/* Reward Cases Grid */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Reward Cases</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {updatedCases.map((rewardCase) => {
                  const maxReward = Math.max(...rewardCase.rewards.map(r => r.amount));
                  
                  // Get background image for each level
                  const getBackgroundImage = () => {
                    switch (rewardCase.level) {
                      case 2: return '/lovable-uploads/f96d0d22-2f66-4073-bd0e-6d5c779ef3b6.png';
                      case 10: return '/lovable-uploads/be8fd130-893e-4215-b7d0-0999715e2be4.png';
                      case 20: return '/lovable-uploads/cbe38d27-2545-402f-8d1f-b289a09abb59.png';
                      case 30: return '/lovable-uploads/a714fe69-c74b-4bf3-a995-5895f3960178.png';
                      case 40: return '/lovable-uploads/bbdc7f14-7026-4092-8ee2-fb074d5d81d0.png';
                      case 50: return '/lovable-uploads/2a582b27-d12f-4acc-be95-68ff05853400.png';
                      case 60: return '/lovable-uploads/ea7503a0-8d67-4f26-b8a4-eebd36c20f48.png';
                      case 70: return '/lovable-uploads/dbca34a2-4054-4f8c-981e-6d4a9275308a.png';
                      case 80: return '/lovable-uploads/ae6e341a-0c8a-419c-818f-71d1a631f975.png';
                      case 90: return '/lovable-uploads/b55d4eac-3bb2-4671-9896-719987ca4fe4.png';
                      case 100: return '/lovable-uploads/d62e6af3-895a-4f0d-ae68-68f9273b0a5f.png';
                      default: return '';
                    }
                  };

                  return (
                    <div key={rewardCase.level} className="space-y-5">
                      {/* Case Container */}
                      <Card 
                        className={`relative transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden ${
                          rewardCase.unlocked 
                            ? 'border-primary/20 hover:border-primary/40' 
                            : 'border-muted/40'
                        }`}
                        style={{
                          backgroundImage: `url(${getBackgroundImage()})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          minHeight: '200px',
                          aspectRatio: '1/1'
                        }}
                        onClick={() => handleOpenCase(rewardCase)}
                      >
                        {/* Lock overlay for locked cases */}
                        {!rewardCase.unlocked && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <div className="text-center">
                              <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-muted-foreground font-medium">
                                Reach Level {rewardCase.level}
                              </p>
                            </div>
                          </div>
                        )}
                      </Card>

                      {/* External Button */}
                      <Button 
                        className={`w-full ${
                          rewardCase.unlocked 
                            ? 'bg-muted text-foreground hover:bg-muted/80' 
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                        disabled={!rewardCase.unlocked}
                        onClick={() => handleOpenCase(rewardCase)}
                      >
                        {rewardCase.unlocked ? "Open Case" : "Locked"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Case Opening Animation */}
      {openingCase && (
        <CaseOpeningAnimation
          isOpen={!!openingCase}
          onComplete={handleCaseComplete}
          rewards={openingCase.rewards}
        />
      )}
    </div>
  );
};

export default Rewards;