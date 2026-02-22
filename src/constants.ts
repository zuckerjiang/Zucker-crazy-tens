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

export const getSuitColor = (suit: Suit): string => {
  switch (suit) {
    case Suit.HEARTS:
    case Suit.DIAMONDS:
      return 'text-red-600';
    case Suit.CLUBS:
    case Suit.SPADES:
      return 'text-black';
  }
};
