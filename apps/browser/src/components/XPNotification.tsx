import { useEffect, useState } from "react";
import { useXPStore } from "@/stores/xpStore";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface XPGain {
  amount: number;
  reason: string;
  timestamp: number;
}

export function XPNotification() {
  const [recentGains, setRecentGains] = useState<XPGain[]>([]);
  const { totalXP } = useXPStore();

  useEffect(() => {
    // This would be triggered when XP is gained
    // For now, we'll just show it as a floating notification system
  }, [totalXP]);

  const removeGain = (timestamp: number) => {
    setRecentGains(prev => prev.filter(gain => gain.timestamp !== timestamp));
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {recentGains.map((gain) => (
        <div
          key={gain.timestamp}
          className="animate-fade-in"
          onAnimationEnd={() => {
            setTimeout(() => removeGain(gain.timestamp), 2000);
          }}
        >
          <Badge className="bg-green-500 text-white border-0 shadow-lg">
            <Plus className="w-3 h-3 mr-1" />
            {gain.amount} XP
          </Badge>
        </div>
      ))}
    </div>
  );
}