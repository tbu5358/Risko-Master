import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/ui/bottom-navigation"
import { CreateMatchModal } from "@/components/ui/create-match-modal"
import mysticalArena from "@/assets/mystical-chess-arena.png"
import speedchessLogo from "@/assets/speedchess-logo.png"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { fetchBalance } from "@/lib/api"
import { Play, Plus, Wallet } from "lucide-react"

const Index = () => {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(5.00)
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false)
  const playersOnline = 24891
  const dailyPrizePool = 472200

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

  const handleViewLobbies = () => {
    navigate("/lobby")
  }

  const handleCreateMatch = () => {
    setIsCreateMatchOpen(true)
  }

  const handleAddFunds = () => {
    // Add funds logic here
    console.log("Add funds clicked")
  }

  const handleStartMatch = () => {
    // Navigate to the game page
    navigate("/game")
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative pb-20 embedded-fit"
      style={{ 
        backgroundImage: `url(${mysticalArena})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="relative z-10 min-h-screen flex flex-col embedded-fit">
        {/* Main Content Container */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-md mx-auto w-full">
          
          {/* Logo Section */}
          <div className="text-center mb-6 animate-fade-in">
            <div className="flex justify-center mb-0">
              <img 
                src={speedchessLogo} 
                alt="SpeedChess Logo" 
                className="w-56 md:w-64 h-auto drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.3))' }}
              />
            </div>
            <p className="text-metallic-silver text-base md:text-lg font-medium">
              Outplay. Outpace. Out-earn.
            </p>
          </div>

          {/* Main Action Buttons */}
          <div className="w-full space-y-3 mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button 
              onClick={handleViewLobbies}
              className="w-full h-12 text-lg font-bold bg-gradient-button hover:opacity-90 shadow-glow-button border-0 transition-all duration-300"
              size="lg"
            >
              <Play className="mr-3 h-5 w-5" />
              View Lobbies
            </Button>
            
            <Button 
              onClick={handleCreateMatch}
              variant="outline"
              className="w-full h-12 text-lg font-bold bg-midnight-blue/50 hover:bg-electric-blue/10 text-electric-blue border-electric-blue/30 hover:border-electric-blue/50 transition-all duration-300"
              size="lg"
            >
              <Plus className="mr-3 h-5 w-5" />
              Create Match
            </Button>
          </div>

          {/* Balance Section */}
          <div className="w-full bg-midnight-dark/70 backdrop-blur-md rounded-2xl p-5 mb-5 border border-electric-blue/20 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="h-4 w-4 text-electric-blue" />
                <div>
                  <div className="text-xs text-metallic-silver font-medium">Your Balance</div>
                  <div className="text-xl font-bold text-premium-gold">${balance.toFixed(2)}</div>
                </div>
              </div>
              <Button 
                onClick={handleAddFunds}
                className="bg-burnt-orange/20 hover:bg-burnt-orange/30 text-burnt-orange border border-burnt-orange/30 hover:border-burnt-orange/50 transition-all duration-300"
                variant="outline"
              >
                Add Funds
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="w-full grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <div className="bg-midnight-dark/70 backdrop-blur-md rounded-xl p-3 border border-electric-blue/20 text-center">
              <div className="text-xl font-bold text-electric-blue">{playersOnline.toLocaleString()}</div>
              <div className="text-xs text-metallic-silver font-medium">Players Online</div>
            </div>
            <div className="bg-midnight-dark/70 backdrop-blur-md rounded-xl p-3 border border-electric-blue/20 text-center">
              <div className="text-xl font-bold text-premium-gold">${(dailyPrizePool / 1000).toFixed(1)}K</div>
              <div className="text-xs text-metallic-silver font-medium">Daily Prize Pool</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Create Match Modal */}
      <CreateMatchModal 
        open={isCreateMatchOpen} 
        onOpenChange={setIsCreateMatchOpen}
        onStartMatch={handleStartMatch}
      />
    </div>
  )
}

export default Index