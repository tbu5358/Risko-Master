interface TimerProps {
  color: "white" | "black";
  time: number;
  active: boolean;
}

export default function Timer({ color, time, active }: TimerProps) {
  return (
    <div className={`px-4 py-2 rounded-lg font-mono text-lg ${active ? "bg-cyan-glow/20 text-cyan-glow font-bold" : "bg-muted-foreground/10 text-muted-foreground"}`}>
      {color.charAt(0).toUpperCase() + color.slice(1)}: {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
    </div>
  );
} 