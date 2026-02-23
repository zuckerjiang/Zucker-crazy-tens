import { Suit, Rank, Card } from './types';

export const SUITS = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];
export const RANKS = [
  Rank.ACE, Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, 
  Rank.SIX, Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN, 
  Rank.JACK, Rank.QUEEN, Rank.KING
];

export const createDeck = (numDecks: number = 1, limit?: number): Card[] => {
  let deck: Card[] = [];
  for (let i = 0; i < numDecks; i++) {
    SUITS.forEach(suit => {
      RANKS.forEach(rank => {
        deck.push({
          id: `${rank}-${suit}-${i}`,
          suit,
          rank,
        });
      });
    });
  }
  deck = shuffle(deck);
  if (limit) {
    return deck.slice(0, limit);
  }
  return deck;
};

export const shuffle = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const getSuitSymbol = (suit: Suit): string => {
  switch (suit) {
    case Suit.HEARTS: return '♥';
    case Suit.DIAMONDS: return '♦';
    case Suit.CLUBS: return '♣';
    case Suit.SPADES: return '♠';
  }
};

export const getSuitName = (suit: Suit): string => {
  switch (suit) {
    case Suit.HEARTS: return 'RED';
    case Suit.DIAMONDS: return 'YELLOW';
    case Suit.CLUBS: return 'GREEN';
    case Suit.SPADES: return 'BLUE';
  }
};

export const getSuitColor = (suit: Suit): string => {
  switch (suit) {
    case Suit.HEARTS:
      return 'text-red-500';
    case Suit.DIAMONDS:
      return 'text-yellow-400';
    case Suit.CLUBS:
      return 'text-green-500';
    case Suit.SPADES:
      return 'text-blue-500';
  }
};

export const getSuitBgColor = (suit: Suit): string => {
  switch (suit) {
    case Suit.HEARTS:
      return 'bg-red-500';
    case Suit.DIAMONDS:
      return 'bg-yellow-400';
    case Suit.CLUBS:
      return 'bg-green-500';
    case Suit.SPADES:
      return 'bg-blue-500';
  }
};
