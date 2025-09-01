import { PlayerState } from './playerManager';

export class LeaderboardManager {
  public getTop(players: PlayerState[], topN: number = 10) {
    return players
      .slice()
      .sort((a, b) => b.size - a.size)
      .slice(0, topN)
      .map((p, index) => ({ rank: index + 1, id: p.id, username: p.username, size: Math.floor(p.size) }));
  }
}

