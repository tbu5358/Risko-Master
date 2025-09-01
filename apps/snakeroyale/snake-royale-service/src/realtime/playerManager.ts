import { WORLD } from './messages';

export type PlayerId = string;

export interface PlayerState {
  id: PlayerId;
  username: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hp: number;
  color: string;
  boosting: boolean;
  emoji?: string;
}

export class PlayerManager {
  private players: Map<PlayerId, PlayerState> = new Map();

  public createPlayer(id: PlayerId, username: string): PlayerState {
    const player: PlayerState = {
      id,
      username,
      x: Math.random() * WORLD.width,
      y: Math.random() * WORLD.height,
      vx: 0,
      vy: 0,
      size: 10,
      hp: 100,
      color: `hsl(${Math.floor(Math.random() * 360)}, 80%, 50%)`,
      boosting: false
    };
    this.players.set(id, player);
    return player;
  }

  public removePlayer(id: PlayerId): void {
    this.players.delete(id);
  }

  public getPlayer(id: PlayerId): PlayerState | undefined {
    return this.players.get(id);
  }

  public getAllPlayers(): PlayerState[] {
    return Array.from(this.players.values());
  }

  public handleMove(id: PlayerId, x: number, y: number): void {
    const player = this.players.get(id);
    if (!player) return;
    const dx = x - player.x;
    const dy = y - player.y;
    const len = Math.hypot(dx, dy) || 1;
    const speed = player.boosting ? 6 : 3;
    player.vx = (dx / len) * speed;
    player.vy = (dy / len) * speed;
  }

  public setBoost(id: PlayerId, boosting: boolean): void {
    const player = this.players.get(id);
    if (!player) return;
    player.boosting = boosting;
  }

  public setEmoji(id: PlayerId, emoji: string): void {
    const player = this.players.get(id);
    if (!player) return;
    player.emoji = emoji;
  }

  public tick(delta: number): void {
    for (const player of this.players.values()) {
      player.x = Math.max(0, Math.min(WORLD.width, player.x + player.vx));
      player.y = Math.max(0, Math.min(WORLD.height, player.y + player.vy));
      // Simple growth from movement when boosting costs hp slightly
      if (player.boosting) {
        player.size = Math.max(5, player.size - 0.02 * delta);
      } else {
        player.size = Math.min(60, player.size + 0.005 * delta);
      }
    }
  }
}

