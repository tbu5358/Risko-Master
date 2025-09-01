import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useXPStore } from "@/stores/xpStore";
import { Calendar, Gift, Flame } from "lucide-react";

export function DailyLoginReward() {
  const [showReward, setShowReward] = useState(false);
  const { dailyLoginStreak, getDailyLoginReward, checkDailyLogin, lastLoginDate } = useXPStore();

  useEffect(() => {
    const today = new Date().toDateString();
    if (lastLoginDate !== today) {
      checkDailyLogin();
      setShowReward(true);
    }
  }, []);

  const rewardAmount = getDailyLoginReward();

  return (
    <Dialog open={showReward} onOpenChange={setShowReward}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Gift className="w-5 h-5 text-primary" />
            Daily Login Reward
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">
              +{rewardAmount} XP
            </div>
            <p className="text-muted-foreground">
              Welcome back! Here's your daily XP bonus.
            </p>
          </div>

          {dailyLoginStreak > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <Badge variant="secondary">
                <Calendar className="w-3 h-3 mr-1" />
                {dailyLoginStreak} day streak!
              </Badge>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Keep your streak alive for bigger rewards!</p>
            <p>Next reward: +{getDailyLoginReward() + 2} XP</p>
          </div>

          <Button onClick={() => setShowReward(false)} className="w-full">
            Claim Reward
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}