export enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades',
}

export enum Rank {
  ACE = 'A',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
}

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type GameStatus = 'waiting' | 'playing' | 'suit_selection' | 'game_over';

export interface GameState {
  deck: Card[];
  discardPile: Card[];
  playerHand: Card[];
  aiHand: Card[];
  currentTurn: 'player' | 'ai';
  status: GameStatus;
  currentSuit: Suit | null; // For when an 8 is played
  winner: 'player' | 'ai' | null;
  lastAction: string;
}
