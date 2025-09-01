import { v4 as uuid } from 'uuid';
import { PlayerManager, PlayerState } from './playerManager';
import { ZoneManager } from './zoneManager';
import { LeaderboardManager } from './leaderboardManager';
import { Messages } from './messages';

type Amount = 1 | 5 | 20;

export interface LobbyState {
  amount: Amount;
  queued: number;
  countdown?: number;
  prizePool: number;
}

export interface MatchState {
  id: string;
  amount: Amount;
  players: Set<string>; // player ids
  active: boolean;
  createdAt: number;
}

export class MatchManager {
  public lobbies: Map<Amount, Set<string>> = new Map([[1, new Set()], [5, new Set()], [20, new Set()]]);
  public matches: Map<string, MatchState> = new Map();
  public playerManager = new PlayerManager();
  public zoneManager = new ZoneManager();
  public leaderboardManager = new LeaderboardManager();

  private countdowns: Map<Amount, number> = new Map();

  public joinQueue(playerId: string, amount: Amount, username: string) {
    this.lobbies.get(amount)!.add(playerId);
    if (!this.playerManager.getPlayer(playerId)) {
      this.playerManager.createPlayer(playerId, username);
    }
  }

  public leaveQueue(playerId: string) {
    for (const lobby of this.lobbies.values()) lobby.delete(playerId);
  }

  public tickQueues(broadcast: (msg: any) => void) {
    for (const [amount, set] of this.lobbies.entries()) {
      const count = set.size;
      if (count >= 20) {
        this.startMatch(amount, Array.from(set), broadcast);
        set.clear();
        this.countdowns.delete(amount);
        continue;
      }
      // Countdown when at least 2 players
      if (count >= 2) {
        const now = Date.now();
        const endAt = this.countdowns.get(amount) ?? (now + 10_000);
        this.countdowns.set(amount, endAt);
        const remaining = Math.max(0, Math.floor((endAt - now) / 1000));
        if (remaining === 0) {
          this.startMatch(amount, Array.from(set), broadcast);
          set.clear();
          this.countdowns.delete(amount);
        } else {
          broadcast({ type: Messages.LOBBY_UPDATE, amount, queued: count, prizePool: count * amount, countdown: remaining });
        }
      } else {
        this.countdowns.delete(amount);
        broadcast({ type: Messages.LOBBY_UPDATE, amount, queued: count, prizePool: count * amount });
      }
    }
  }

  private startMatch(amount: Amount, playerIds: string[], broadcast: (msg: any) => void) {
    const id = uuid();
    const match: MatchState = { id, amount, players: new Set(playerIds), active: true, createdAt: Date.now() };
    this.matches.set(id, match);
    const players = playerIds
      .map(pid => this.playerManager.getPlayer(pid))
      .filter(Boolean) as PlayerState[];
    // For legacy client we keep MATCH_START, for new spec send MATCH_FOUND
    broadcast({ type: Messages.MATCH_START, matchId: id, amount, players });
    broadcast({ type: Messages.MATCH_FOUND, matchId: id, players: players.map(p => ({ userId: p.id, username: p.username })) });
  }

  public applyZoneDamage(broadcastDeath: (id: string) => void) {
    const zone = this.zoneManager.getZone();
    for (const player of this.playerManager.getAllPlayers()) {
      if (this.zoneManager.isOutside(player.x, player.y)) {
        player.hp = Math.max(0, player.hp - this.zoneManager.getDamagePerSecond() / 10);
        if (player.hp === 0) {
          broadcastDeath(player.id);
          this.playerManager.removePlayer(player.id);
          this.leaveQueue(player.id);
        }
      } else {
        player.hp = Math.min(100, player.hp + 0.5); // regen inside zone
      }
    }
  }
}

