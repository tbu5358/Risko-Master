export type Match = {
  id: string;
  playerWhite: string;
  playerBlack: string;
  wager: number; // in USD
  timePerSide: number; // in seconds (180 or 300)
  moves: string[];
  state: 'waiting' | 'active' | 'ended';
  resignedBy?: 'white' | 'black';
}; 