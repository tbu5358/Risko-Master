import { useEffect, useState } from "react"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/ui/game-card"
import { fetchBalance } from "@/lib/api"

export function WalletCard() {
  const [balance, setBalance] = useState(5.00);

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const b = await fetchBalance()
        if (!cancelled) setBalance(Number(b))
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <GameCard className="p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-full">
      <div className="space-y-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-cyan-glow" />
          <span className="font-semibold text-foreground">Wallet</span>
        </div>
        
        {/* Balance */}
        <div className="text-center flex-1 flex items-center justify-center">
          <div>
            <div className="text-3xl font-bold text-cyan-glow">${balance.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">USD Balance</div>
          </div>
        </div>
        
        {/* Add Funds Button */}
        <Button 
          variant="outline" 
          className="w-full font-bold bg-midnight-blue hover:bg-cyan-glow/10 text-cyan-glow border-cyan-glow/30 hover:border-cyan-glow/50 transition-all duration-300"
        >
          Add Funds
        </Button>
      </div>
    </GameCard>
  )
}