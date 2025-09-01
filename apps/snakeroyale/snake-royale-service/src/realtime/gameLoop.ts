import { MatchManager } from './matchManager';
import { Messages } from './messages';

export class GameLoop {
  private matchManager: MatchManager;
  private lastTick = Date.now();
  private interval: NodeJS.Timeout | null = null;
  private leaderboardTimer = 0;

  constructor(matchManager: MatchManager) {
    this.matchManager = matchManager;
  }

  public start(broadcast: (msg: any) => void) {
    if (this.interval) return;
    this.interval = setInterval(() => {
      const now = Date.now();
      const delta = now - this.lastTick;
      this.lastTick = now;

      this.matchManager.playerManager.tick(delta);
      const zoneChanged = this.matchManager.zoneManager.tick();
      this.matchManager.applyZoneDamage((id) => {
        broadcast({ type: Messages.PLAYER_DEATH, playerId: id });
      });

      if (zoneChanged) {
        broadcast({ type: Messages.ZONE_UPDATE, zone: this.matchManager.zoneManager.getZone() });
      }

      this.matchManager.tickQueues(broadcast);

      // Periodic leaderboard
      this.leaderboardTimer += delta;
      if (this.leaderboardTimer >= 1000) {
        this.leaderboardTimer = 0;
        const leaderboard = this.matchManager.leaderboardManager.getTop(this.matchManager.playerManager.getAllPlayers());
        broadcast({ type: Messages.LEADERBOARD_UPDATE, leaderboard });
      }
    }, 1000 / 20);
  }

  public stop() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }
}

