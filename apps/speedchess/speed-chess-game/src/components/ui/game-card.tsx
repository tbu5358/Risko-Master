import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface GameCardProps {
  children: React.ReactNode
  className?: string
}

export function GameCard({ children, className }: GameCardProps) {
  return (
    <Card className={cn(
      "bg-card/60 backdrop-blur-md border-border/20",
      "shadow-lg hover:shadow-xl transition-all duration-300",
      "animate-slide-in",
      className
    )}>
      {children}
    </Card>
  )
}