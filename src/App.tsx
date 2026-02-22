/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  Info, 
  User, 
  Cpu, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Suit, Rank, Card, GameStatus, GameState } from './types';
import { createDeck, getSuitSymbol, getSuitColor, SUITS } from './constants';

// --- Components ---

interface PlayingCardProps {
  card: Card;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ 
  card, 
  isFaceUp = true, 
  onClick, 
  isPlayable = false,
  className = "" 
}) => {
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: -20 }}
      whileHover={isPlayable ? { y: -15, scale: 1.05 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-20 h-28 sm:w-24 sm:h-36 rounded-lg card-shadow cursor-pointer transition-shadow
        ${isFaceUp ? 'bg-white' : 'bg-indigo-900 border-2 border-yellow-600'}
        ${isPlayable ? 'ring-4 ring-yellow-400 shadow-xl' : ''}
        ${className}
      `}
    >
      {isFaceUp ? (
        <div className={`flex flex-col justify-between h-full p-2 ${getSuitColor(card.suit)}`}>
          <div className="flex flex-col items-start leading-none">
            <span className="text-lg sm:text-xl font-bold">{card.rank}</span>
            <span className="text-sm sm:text-base">{getSuitSymbol(card.suit)}</span>
          </div>
          <div className="flex justify-center items-center text-3xl sm:text-4xl opacity-20">
            {getSuitSymbol(card.suit)}
          </div>
          <div className="flex flex-col items-end leading-none rotate-180">
            <span className="text-lg sm:text-xl font-bold">{card.rank}</span>
            <span className="text-sm sm:text-base">{getSuitSymbol(card.suit)}</span>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center p-1">
          <div className="w-full h-full border border-yellow-600/30 rounded flex items-center justify-center">
             <div className="text-yellow-500 font-serif font-bold text-[10px] sm:text-xs text-center leading-tight tracking-tighter uppercase transform -rotate-12">
               Harry<br/>Potter
             </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const SuitPicker = ({ onSelect }: { onSelect: (suit: Suit) => void }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full text-black shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">选择新花色</h2>
        <div className="grid grid-cols-2 gap-4">
          {SUITS.map(suit => (
            <button
              key={suit}
              onClick={() => onSelect(suit)}
              className={`
                flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-100
                hover:border-blue-500 hover:bg-blue-50 transition-all group
              `}
            >
              <span className={`text-5xl mb-2 ${getSuitColor(suit)} group-hover:scale-110 transition-transform`}>
                {getSuitSymbol(suit)}
              </span>
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                {suit}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const GameOverModal = ({ winner, onRestart }: { winner: 'player' | 'ai' | null, onRestart: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl p-10 max-w-sm w-full text-center text-black shadow-2xl"
      >
        <div className={`inline-flex p-4 rounded-full mb-6 ${winner === 'player' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
          <Trophy size={48} />
        </div>
        <h2 className="text-3xl font-bold mb-2">
          {winner === 'player' ? '你赢了！' : 'AI 赢了！'}
        </h2>
        <p className="text-gray-500 mb-8">
          {winner === 'player' ? '太棒了，你清空了所有的牌！' : '别灰心，下次一定能赢。'}
        </p>
        <button
          onClick={onRestart}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw size={20} />
          再来一局
        </button>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    discardPile: [],
    playerHand: [],
    aiHand: [],
    currentTurn: 'player',
    status: 'waiting',
    currentSuit: null,
    winner: null,
    lastAction: '欢迎来到 Zucker 疯狂 10 点！'
  });

  const [pendingEightCard, setPendingEightCard] = useState<Card | null>(null);

  // Initialize game
  const initGame = useCallback(() => {
    // Create exactly 100 cards total (from 2 decks)
    const fullDeck = createDeck(2, 100);
    const playerHand = fullDeck.splice(0, 10);
    const aiHand = fullDeck.splice(0, 10);
    
    // Ensure the first discard is not an 8
    let firstDiscardIndex = 0;
    while (fullDeck[firstDiscardIndex].rank === Rank.EIGHT) {
      firstDiscardIndex++;
    }
    const discardPile = [fullDeck.splice(firstDiscardIndex, 1)[0]];

    setGameState({
      deck: fullDeck,
      discardPile,
      playerHand,
      aiHand,
      currentTurn: 'player',
      status: 'playing',
      currentSuit: discardPile[0].suit,
      winner: null,
      lastAction: '游戏开始！你的回合。'
    });
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];

  const isCardPlayable = useCallback((card: Card) => {
    if (card.rank === Rank.EIGHT) return true;
    if (gameState.currentSuit && card.suit === gameState.currentSuit) return true;
    if (card.rank === topDiscard.rank) return true;
    return false;
  }, [gameState.currentSuit, topDiscard]);

  const checkWinCondition = (hand: Card[], player: 'player' | 'ai') => {
    if (hand.length === 0) {
      setGameState(prev => ({
        ...prev,
        status: 'game_over',
        winner: player,
        lastAction: player === 'player' ? '你赢了！' : 'AI 赢了！'
      }));
      return true;
    }
    return false;
  };

  const drawCard = (player: 'player' | 'ai') => {
    if (gameState.deck.length === 0) {
      setGameState(prev => ({
        ...prev,
        currentTurn: prev.currentTurn === 'player' ? 'ai' : 'player',
        lastAction: '摸牌堆已空，跳过回合。'
      }));
      return;
    }

    const newDeck = [...gameState.deck];
    const drawnCard = newDeck.pop()!;
    
    setGameState(prev => {
      const newHand = player === 'player' 
        ? [...prev.playerHand, drawnCard] 
        : [...prev.aiHand, drawnCard];
      
      return {
        ...prev,
        deck: newDeck,
        playerHand: player === 'player' ? newHand : prev.playerHand,
        aiHand: player === 'ai' ? newHand : prev.aiHand,
        currentTurn: player === 'player' ? 'ai' : 'player',
        lastAction: `${player === 'player' ? '你' : 'AI'} 摸了一张牌。`
      };
    });
  };

  const playCard = (card: Card, player: 'player' | 'ai') => {
    if (card.rank === Rank.EIGHT) {
      if (player === 'player') {
        setPendingEightCard(card);
        setGameState(prev => ({ ...prev, status: 'suit_selection' }));
      } else {
        // AI logic for 8: pick the suit it has most of
        const suitCounts: Record<string, number> = {};
        gameState.aiHand.forEach(c => {
          if (c.id !== card.id) {
            suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
          }
        });
        const bestSuit = (Object.keys(suitCounts).sort((a, b) => suitCounts[b] - suitCounts[a])[0] as Suit) || Suit.HEARTS;
        executePlay(card, player, bestSuit);
      }
    } else {
      executePlay(card, player, card.suit);
    }
  };

  const executePlay = (card: Card, player: 'player' | 'ai', newSuit: Suit) => {
    setGameState(prev => {
      const newHand = player === 'player' 
        ? prev.playerHand.filter(c => c.id !== card.id)
        : prev.aiHand.filter(c => c.id !== card.id);
      
      const newDiscardPile = [...prev.discardPile, card];
      
      if (newHand.length === 0) {
        return {
          ...prev,
          playerHand: player === 'player' ? [] : prev.playerHand,
          aiHand: player === 'ai' ? [] : prev.aiHand,
          discardPile: newDiscardPile,
          status: 'game_over',
          winner: player,
          lastAction: `${player === 'player' ? '你' : 'AI'} 出完了所有的牌！`
        };
      }

      return {
        ...prev,
        playerHand: player === 'player' ? newHand : prev.playerHand,
        aiHand: player === 'ai' ? newHand : prev.aiHand,
        discardPile: newDiscardPile,
        currentSuit: newSuit,
        currentTurn: player === 'player' ? 'ai' : 'player',
        status: 'playing',
        lastAction: `${player === 'player' ? '你' : 'AI'} 打出了 ${card.rank}${getSuitSymbol(card.suit)}${card.rank === Rank.EIGHT ? `，并将花色改为 ${getSuitSymbol(newSuit)}` : ''}`
      };
    });
  };

  // AI Turn Logic
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentTurn === 'ai') {
      const timer = setTimeout(() => {
        const playableCards = gameState.aiHand.filter(isCardPlayable);
        if (playableCards.length > 0) {
          // AI plays a card (prefers non-8 if possible, or just random for now)
          const cardToPlay = playableCards.find(c => c.rank !== Rank.EIGHT) || playableCards[0];
          playCard(cardToPlay, 'ai');
        } else {
          drawCard('ai');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.status, gameState.currentTurn, gameState.aiHand, isCardPlayable]);

  const handleSuitSelect = (suit: Suit) => {
    if (pendingEightCard) {
      executePlay(pendingEightCard, 'player', suit);
      setPendingEightCard(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 bg-slate-950 overflow-hidden relative">
      {/* Hogwarts Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1610466024868-910c6e7e8929?auto=format&fit=crop&w=1920&q=80" 
          alt="Hogwarts Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header / Info */}
      <div className="w-full max-w-6xl flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
            <Info size={24} className="text-white/80" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Zucker Crazy Tens</h1>
            <p className="text-xs text-white/60 uppercase tracking-widest">Classic Edition</p>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-white/40 font-bold">当前花色</span>
            <span className={`text-2xl font-bold ${gameState.currentSuit ? getSuitColor(gameState.currentSuit) : 'text-white'}`}>
              {gameState.currentSuit ? getSuitSymbol(gameState.currentSuit) : '-'}
            </span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-white/40 font-bold">牌堆剩余</span>
            <span className="text-2xl font-mono font-bold">{gameState.deck.length}</span>
          </div>
        </div>
      </div>

      {/* AI Hand */}
      <div className="w-full flex flex-col items-center gap-4 z-10">
        <div className="flex items-center gap-2 text-white/60 bg-black/20 px-4 py-1 rounded-full text-sm">
          <Cpu size={16} />
          <span>AI 对手 ({gameState.aiHand.length} 张)</span>
          {gameState.currentTurn === 'ai' && (
            <motion.span 
              animate={{ opacity: [0.4, 1, 0.4] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 bg-blue-400 rounded-full ml-2"
            />
          )}
        </div>
        <div className="w-full max-w-full overflow-x-auto flex justify-start sm:justify-center px-12 -space-x-12 sm:-space-x-16 h-36 sm:h-48 scrollbar-hide">
          <AnimatePresence>
            {gameState.aiHand.map((card, idx) => (
              <PlayingCard 
                key={card.id} 
                card={card} 
                isFaceUp={false} 
                className="hover:z-50 transition-all flex-shrink-0"
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Center Area: Deck & Discard */}
      <div className="flex items-center gap-8 sm:gap-16 z-10 my-8">
        {/* Draw Pile */}
        <div className="flex flex-col items-center gap-2">
          <div 
            onClick={() => gameState.currentTurn === 'player' && gameState.status === 'playing' && drawCard('player')}
            className={`
              relative w-20 h-28 sm:w-24 sm:h-36 rounded-lg border-4 border-white/20 cursor-pointer transition-all
              ${gameState.currentTurn === 'player' && gameState.status === 'playing' ? 'hover:scale-105 active:scale-95 ring-4 ring-white/30' : 'opacity-50 grayscale'}
              bg-blue-900 shadow-2xl
            `}
          >
            <div className="absolute inset-0 flex items-center justify-center text-white/10 text-4xl">
              ?
            </div>
            {/* Stack effect */}
            <div className="absolute -top-1 -left-1 w-full h-full bg-blue-800 rounded-lg -z-10 border-2 border-white/10" />
            <div className="absolute -top-2 -left-2 w-full h-full bg-blue-700 rounded-lg -z-20 border-2 border-white/10" />
          </div>
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">摸牌堆</span>
        </div>

        {/* Discard Pile */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-20 h-28 sm:w-24 sm:h-36">
            <AnimatePresence mode="popLayout">
              {gameState.discardPile.slice(-1).map((card) => (
                <PlayingCard 
                  key={card.id} 
                  card={card} 
                  className="absolute inset-0 shadow-2xl"
                />
              ))}
            </AnimatePresence>
            {/* Previous cards in pile (visual only) */}
            {gameState.discardPile.length > 1 && (
              <div className="absolute inset-0 bg-white rounded-lg -z-10 rotate-3 opacity-50" />
            )}
          </div>
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">弃牌堆</span>
        </div>
      </div>

      {/* Status Message */}
      <div className="z-10 mb-4">
        <motion.div 
          key={gameState.lastAction}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-sm font-medium flex items-center gap-2"
        >
          <ChevronRight size={14} className="text-blue-400" />
          {gameState.lastAction}
        </motion.div>
      </div>

      {/* Player Hand */}
      <div className="w-full flex flex-col items-center gap-4 z-10">
        <div className="w-full max-w-full overflow-x-auto flex justify-start sm:justify-center px-12 -space-x-12 sm:-space-x-16 h-36 sm:h-48 mb-4 scrollbar-hide">
          <AnimatePresence>
            {gameState.playerHand.map((card) => (
              <PlayingCard 
                key={card.id} 
                card={card} 
                isPlayable={gameState.currentTurn === 'player' && gameState.status === 'playing' && isCardPlayable(card)}
                onClick={() => playCard(card, 'player')}
                className="hover:z-50 flex-shrink-0"
              />
            ))}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2 text-white/80 bg-white/10 px-6 py-2 rounded-full text-sm font-bold border border-white/20">
          <User size={18} />
          <span>你的手牌 ({gameState.playerHand.length} 张)</span>
          {gameState.currentTurn === 'player' && gameState.status === 'playing' && (
            <motion.span 
              animate={{ opacity: [0.4, 1, 0.4] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 bg-green-400 rounded-full ml-2"
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {gameState.status === 'suit_selection' && (
        <SuitPicker onSelect={handleSuitSelect} />
      )}

      {gameState.status === 'game_over' && (
        <GameOverModal winner={gameState.winner} onRestart={initGame} />
      )}

      {/* Footer / Controls */}
      <div className="fixed bottom-4 right-4 z-20">
        <button 
          onClick={initGame}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/20 transition-all group"
          title="重新开始"
        >
          <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>
    </div>
  );
}
