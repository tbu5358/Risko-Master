import { Trophy, Users, User, Settings, Home, List } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function BottomNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: Home, label: "Menu", path: "/" },
    { icon: List, label: "Lobbies", path: "/lobby" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ]

  return (
    <TooltipProvider>
      <div className="fixed bottom-0 left-0 right-0 bg-midnight-dark/95 backdrop-blur-md border-t border-cyan-glow/20 z-50">
        <div className="flex justify-around items-center px-4 py-3 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center justify-center h-auto py-3 px-4 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? "bg-electric-blue/20 text-electric-blue shadow-glow" 
                        : "text-metallic-silver hover:text-electric-blue hover:bg-electric-blue/10"
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}