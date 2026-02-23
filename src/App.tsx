/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  Info, 
  User, 
  Cpu, 
  ChevronRight,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Suit, Rank, Card, GameStatus, GameState } from './types';
import { createDeck, getSuitSymbol, getSuitColor, getSuitBgColor, getSuitName, SUITS } from './constants';

// --- Components ---

interface PlayingCardProps {
  card: Card;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
  backColor?: string;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ 
  card, 
  isFaceUp = true, 
  onClick, 
  isPlayable = false,
  className = "",
  backColor = "bg-gradient-to-b from-red-500 via-orange-500 via-yellow-400 via-green-500 to-blue-500"
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
        ${isFaceUp ? (card.rank === Rank.EIGHT ? 'bg-orange-500' : getSuitBgColor(card.suit)) : `${backColor} border-2 border-white/20`}
        ${isPlayable ? 'ring-4 ring-yellow-400 shadow-xl' : ''}
        ${className}
      `}
    >
      {isFaceUp ? (
        <div className="flex flex-col justify-between h-full p-2 text-black overflow-hidden">
          {card.rank === Rank.EIGHT ? (
            <>
              {/* Top Left Corner */}
              <div className="flex flex-col items-start leading-none">
                <span className="text-lg sm:text-xl font-bold">{card.rank}</span>
                <span className="text-sm sm:text-base">{getSuitSymbol(card.suit)}</span>
              </div>
              
              {/* Middle: Large Shape */}
              <div className="flex justify-center items-center text-4xl sm:text-5xl opacity-40">
                {getSuitSymbol(card.suit)}
              </div>
              
              {/* Bottom Left Corner (as requested) */}
              <div className="flex flex-col items-start leading-none">
                <span className="text-lg sm:text-xl font-bold">{card.rank}</span>
                <span className="text-sm sm:text-base">{getSuitSymbol(card.suit)}</span>
              </div>
            </>
          ) : (
            <>
              {/* Top Left Corner */}
              <div className="flex flex-col items-start leading-none">
                <span className="text-lg sm:text-xl font-bold">{card.rank}</span>
                <span className="text-sm sm:text-base">{getSuitSymbol(card.suit)}</span>
              </div>
              
              {/* Middle: Large Color Name */}
              <div className={`flex justify-center items-center font-black tracking-tighter text-center leading-none ${
                getSuitName(card.suit) === 'YELLOW' 
                  ? 'text-lg sm:text-2xl' 
                  : 'text-2xl sm:text-3xl'
              }`}>
                {getSuitName(card.suit)}
              </div>
              
              {/* Bottom Right Corner */}
              <div className="flex flex-col items-end leading-none rotate-180">
                <span className="text-lg sm:text-xl font-bold">{card.rank}</span>
                <span className="text-sm sm:text-base">{getSuitSymbol(card.suit)}</span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center p-1">
          <div className="w-full h-full border border-white/10 rounded flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent">
             <div className="text-white/20 font-bold text-xl sm:text-2xl">
               8
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
                flex flex-col items-center justify-center p-4 rounded-xl border-2 border-gray-100
                bg-white hover:border-purple-500 hover:bg-purple-50 transition-all group
              `}
            >
              <span className={`text-2xl sm:text-3xl font-black mb-2 ${getSuitColor(suit)} group-hover:scale-110 transition-transform`}>
                {getSuitSymbol(suit)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
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
    lastAction: '欢迎来到 Zucker 疯狂 8 点！'
  });

  const [pendingEightCard, setPendingEightCard] = useState<Card | null>(null);
  const [customBg, setCustomBg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sort cards in rainbow order: Red (Hearts) -> Orange (8s) -> Yellow (Diamonds) -> Green (Clubs) -> Blue (Spades)
  const sortHand = (hand: Card[]) => {
    return [...hand].sort((a, b) => {
      const getSortValue = (card: Card) => {
        if (card.rank === Rank.EIGHT) return 1; // Orange
        switch (card.suit) {
          case Suit.HEARTS: return 0;   // Red
          case Suit.DIAMONDS: return 2; // Yellow
          case Suit.CLUBS: return 3;    // Green
          case Suit.SPADES: return 4;   // Blue
          default: return 5;
        }
      };
      
      const valA = getSortValue(a);
      const valB = getSortValue(b);
      
      if (valA !== valB) return valA - valB;
      
      // Secondary sort by rank
      const ranks = Object.values(Rank);
      return ranks.indexOf(a.rank) - ranks.indexOf(b.rank);
    });
  };

  // Initialize game
  const initGame = useCallback(() => {
    // Create exactly 100 cards total (from 2 decks)
    const fullDeck = createDeck(2, 100);
    const playerHand = sortHand(fullDeck.splice(0, 8));
    const aiHand = fullDeck.splice(0, 8);
    
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
        ? sortHand([...prev.playerHand, drawnCard]) 
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

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomBg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden relative bg-stone-900">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {customBg ? (
          <img 
            src={customBg} 
            alt="Custom Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <img 
            src="https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1920&q=80" 
            alt="Forbidden City Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      </div>

      {/* Header / Info */}
      <div className="w-full max-w-6xl flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">Z</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Crazy 8s</h1>
              <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Zucker Edition</p>
            </div>
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-white transition-all flex items-center gap-2 text-sm font-bold shadow-xl"
            title="上传自定义背景"
          >
            <ImageIcon size={18} />
            <span className="hidden sm:inline">更换背景</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleBgUpload} 
            accept="image/*" 
            className="hidden" 
          />
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
              bg-gradient-to-b from-red-500 via-orange-500 via-yellow-400 via-green-500 to-blue-500 shadow-2xl
            `}
          >
            <div className="absolute inset-0 flex items-center justify-center text-white/40 text-4xl font-bold drop-shadow-md">
              ?
            </div>
            {/* Stack effect */}
            <div className="absolute -top-1 -left-1 w-full h-full bg-blue-600 rounded-lg -z-10 border-2 border-white/10" />
            <div className="absolute -top-2 -left-2 w-full h-full bg-blue-700 rounded-lg -z-20 border-2 border-white/10" />
          </div>
          <span className="text-xs font-bold text-white/80 uppercase tracking-widest drop-shadow-sm">摸牌堆</span>
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
