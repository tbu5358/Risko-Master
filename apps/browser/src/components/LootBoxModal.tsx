import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useXPStore } from "@/stores/xpStore";
import { Package, Sparkles, Coins } from "lucide-react";

interface LootBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LootBoxReward {
  type: 'xp' | 'cosmetic' | 'title';
  amount?: number;
  item?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export function LootBoxModal({ isOpen, onClose }: LootBoxModalProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<LootBoxReward | null>(null);
  const { addXP } = useXPStore();

  const generateReward = (): LootBoxReward => {
    const random = Math.random();
    
    if (random < 0.05) { // 5% legendary
      return {
        type: 'xp',
        amount: 500,
        rarity: 'legendary'
      };
    } else if (random < 0.15) { // 10% epic
      return {
        type: 'title',
        item: 'Elite Player',
        rarity: 'epic'
      };
    } else if (random < 0.35) { // 20% rare
      return {
        type: 'xp',
        amount: 100,
        rarity: 'rare'
      };
    } else { // 65% common
      return {
        type: 'xp',
        amount: 50,
        rarity: 'common'
      };
    }
  };

  const openLootBox = () => {
    setIsOpening(true);
    
    setTimeout(() => {
      const newReward = generateReward();
      setReward(newReward);
      
      if (newReward.type === 'xp' && newReward.amount) {
        addXP(newReward.amount, 'loot_box');
      }
      
      setIsOpening(false);
    }, 2000);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const handleClose = () => {
    setReward(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Package className="w-5 h-5 text-primary" />
            Loot Box Reward
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-center">
          {!reward && !isOpening && (
            <>
              <div className="text-6xl animate-bounce">
                📦
              </div>
              <p className="text-muted-foreground">
                You've earned a loot box for playing 10 matches!
              </p>
              <Button onClick={openLootBox} className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Open Loot Box
              </Button>
            </>
          )}

          {isOpening && (
            <div className="space-y-4">
              <div className="text-6xl animate-spin">
                ✨
              </div>
              <p>Opening your reward...</p>
            </div>
          )}

          {reward && (
            <div className="space-y-4">
              <div className={`p-6 rounded-lg bg-gradient-to-r ${getRarityColor(reward.rarity)} text-white`}>
                {reward.type === 'xp' && (
                  <>
                    <Coins className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">+{reward.amount} XP</div>
                  </>
                )}
                {reward.type === 'title' && (
                  <>
                    <Sparkles className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-lg font-bold">"{reward.item}" Title</div>
                  </>
                )}
              </div>
              
              <Badge variant="secondary" className="capitalize">
                {reward.rarity} Reward
              </Badge>
              
              <Button onClick={handleClose} className="w-full">
                Awesome!
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}