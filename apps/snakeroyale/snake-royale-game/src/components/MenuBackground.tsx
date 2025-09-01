import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

type Snake = {
  color: string;
  head: Point;
  directionRad: number;
  speed: number; // px per second
  segmentSpacing: number; // px between segments
  segments: Point[]; // head-first order
  turnPhase: number; // for sinusoidal turn
  turnFreq: number; // radians per second for sin
  turnAmp: number; // max radians/sec added
};

const SNAKE_COLORS = [
  "#34d399", // emerald
  "#60a5fa", // blue
  "#a78bfa", // violet
  "#f472b6", // pink
  "#f59e0b", // amber
  "#22d3ee", // cyan
  "#ef4444", // red
  "#10b981", // green
  "#8b5cf6", // purple
  "#fb923c", // orange
];

function createSnake(width: number, height: number, color: string): Snake {
  const segmentSpacing = 10; // px
  const segmentCount = 40; // fixed length
  const head: Point = {
    x: Math.random() * width,
    y: Math.random() * height,
  };
  const directionRad = Math.random() * Math.PI * 2;
  const speed = 80 + Math.random() * 60; // px/s
  const segments: Point[] = Array.from({ length: segmentCount }, (_, i) => ({
    x: head.x - Math.cos(directionRad) * segmentSpacing * i,
    y: head.y - Math.sin(directionRad) * segmentSpacing * i,
  }));
  return {
    color,
    head,
    directionRad,
    speed,
    segmentSpacing,
    segments,
    turnPhase: Math.random() * Math.PI * 2,
    turnFreq: 0.8 + Math.random() * 0.6, // 0.8..1.4 Hz
    turnAmp: 0.7 + Math.random() * 0.4, // radians/sec contribution
  };
}

function wrap(n: number, min: number, max: number) {
  if (n < min) return max - ((min - n) % (max - min));
  if (n >= max) return min + ((n - max) % (max - min));
  return n;
}

export function MenuBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const snakesRef = useRef<Snake[] | null>(null);
  const lastTimeRef = useRef<number>(0);
  const dprRef = useRef<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      dprRef.current = dpr;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Init snakes when size known
      const count = 6 + Math.floor(Math.random() * 5); // 6..10
      snakesRef.current = Array.from({ length: count }, (_, i) =>
        createSnake(window.innerWidth, window.innerHeight, SNAKE_COLORS[i % SNAKE_COLORS.length])
      );
    };
    resize();
    window.addEventListener("resize", resize);

    // Optional offscreen buffer for heavy scenes
    offscreenRef.current = document.createElement("canvas");

    let rafId = 0;
    const maxFPS = 60;
    const minFrameTime = 1000 / maxFPS;

    const loop = (time: number) => {
      const last = lastTimeRef.current || time;
      const deltaMs = time - last;
      if (deltaMs < minFrameTime) {
        rafId = requestAnimationFrame(loop);
        return;
      }
      lastTimeRef.current = time;
      const delta = Math.min(0.05, deltaMs / 1000); // clamp dt <= 50ms

      const snakes = snakesRef.current!;

      // Update
      for (const s of snakes) {
        // Natural sinusoidal turning
        s.turnPhase += s.turnFreq * delta * Math.PI * 2;
        const turn = Math.sin(s.turnPhase) * s.turnAmp * delta;
        s.directionRad += turn;

        // Move head
        s.head.x += Math.cos(s.directionRad) * s.speed * delta;
        s.head.y += Math.sin(s.directionRad) * s.speed * delta;
        // Wrap around screen edges
        s.head.x = wrap(s.head.x, -50, window.innerWidth + 50);
        s.head.y = wrap(s.head.y, -50, window.innerHeight + 50);

        // Insert new head, then maintain spacing along the body
        s.segments[0] = { x: s.head.x, y: s.head.y };
        for (let i = 1; i < s.segments.length; i++) {
          const prev = s.segments[i - 1];
          const cur = s.segments[i];
          const dx = prev.x - cur.x;
          const dy = prev.y - cur.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const needed = s.segmentSpacing;
          const t = (dist - needed) / dist; // move fraction toward prev to keep spacing
          if (t > 0) {
            s.segments[i] = { x: cur.x + dx * t, y: cur.y + dy * t };
          }
        }
      }

      // Draw to offscreen (or directly if offscreen not used)
      const buf = offscreenRef.current!;
      const bctx = buf.getContext("2d", { alpha: false })!;
      buf.width = canvas.width;
      buf.height = canvas.height;
      // Match device-pixel scale so world coords (CSS px) render correctly
      bctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);

      // background
      bctx.fillStyle = "#05060a";
      bctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw snakes
      for (const s of snakes) {
        const baseRadius = 6;
        for (let i = s.segments.length - 1; i >= 0; i--) {
          const p = s.segments[i];
          const r = baseRadius * (0.9 + 0.1 * Math.sin(i * 0.6));
          bctx.beginPath();
          bctx.fillStyle = s.color;
          bctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          bctx.fill();
        }
      }

      // Composite to screen with slight blur underlay (handled in parent overlay as well)
      ctx.drawImage(buf, 0, 0);

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block"
      aria-hidden="true"
    />
  );
}

export default MenuBackground;

