import { WORLD } from './messages';

export interface ZoneState {
  x: number;
  y: number;
  radius: number;
  stage: number; // 1..N
}

export class ZoneManager {
  private zone: ZoneState;
  private nextShrinkAtMs: number;
  private readonly stageConfigs = [
    { durationMs: 30_000, damagePerSec: 5, radiusFactor: 0.8 },
    { durationMs: 30_000, damagePerSec: 10, radiusFactor: 0.6 },
    { durationMs: 30_000, damagePerSec: 20, radiusFactor: 0.4 }
  ];

  constructor() {
    this.zone = {
      x: WORLD.width / 2,
      y: WORLD.height / 2,
      radius: Math.min(WORLD.width, WORLD.height) * 0.45,
      stage: 1
    };
    this.nextShrinkAtMs = Date.now() + this.stageConfigs[0].durationMs;
  }

  public getZone(): ZoneState {
    return this.zone;
  }

  public getDamagePerSecond(): number {
    const cfg = this.stageConfigs[Math.min(this.zone.stage - 1, this.stageConfigs.length - 1)];
    return cfg.damagePerSec;
  }

  public tick(): boolean {
    const now = Date.now();
    if (now >= this.nextShrinkAtMs) {
      const currentIndex = Math.min(this.zone.stage - 1, this.stageConfigs.length - 1);
      const nextIndex = Math.min(currentIndex + 1, this.stageConfigs.length - 1);
      const nextCfg = this.stageConfigs[nextIndex];
      this.zone.stage = nextIndex + 1;
      this.zone.radius = Math.max(100, this.zone.radius * nextCfg.radiusFactor);
      // Slight center shift
      this.zone.x = Math.max(200, Math.min(WORLD.width - 200, this.zone.x + (Math.random() - 0.5) * 200));
      this.zone.y = Math.max(100, Math.min(WORLD.height - 100, this.zone.y + (Math.random() - 0.5) * 200));
      this.nextShrinkAtMs = now + nextCfg.durationMs;
      return true; // zone changed
    }
    return false;
  }

  public isOutside(x: number, y: number): boolean {
    const dx = x - this.zone.x;
    const dy = y - this.zone.y;
    return Math.hypot(dx, dy) > this.zone.radius;
  }
}

