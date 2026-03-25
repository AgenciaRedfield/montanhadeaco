import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardLoreModal } from "@/components/CardLoreModal";
import { CardView } from "@/components/CardView";
import { cards } from "@/data/cards";
import { GameLayout } from "@/features/game/GameLayout";
import { FORGE_COST } from "@/services/progressionService";
import { useGameStore } from "@/store/gameStore";
import type { GameCard } from "@/types/game";
import { createRuntimeCard } from "@/utils/gameHelpers";

/* ── COMPONENTE DO PACOTE DE CARTAS (BOOSTER) ── */
const BoosterPack = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05, rotate: [0, -2, 2, -2, 0] }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className="group relative h-[24rem] w-[16rem] cursor-pointer disabled:cursor-not-allowed"
    >
      {/* Corpo do Pacote */}
      <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] border-4 border-brass-700 bg-[linear-gradient(145deg,#2a1a10,#1a110a)] shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_0_40px_rgba(216,138,99,0.1)]">
        {/* Detalhes Industriais */}
        <div className="absolute inset-x-0 top-0 h-8 bg-brass-800/40 p-1">
          <div className="h-full border-b border-dashed border-brass-500/30" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-brass-800/40 p-1">
          <div className="h-full border-t border-dashed border-brass-500/30" />
        </div>
        
        {/* Logo/Icone Central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 text-5xl group-hover:animate-pulse">⚙️</div>
          <h3 className="font-display text-2xl uppercase tracking-[0.2em] text-brass-50">Pack de Colecao</h3>
          <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-copper-200/60">Contem 3 Unidades</p>
        </div>

        {/* Brilho de Hover */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(216,138,99,0.15),transparent_70%)] opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* Rebites/Parafusos */}
      <div className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-brass-600 shadow-sm" />
      <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-brass-600 shadow-sm" />
      <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-brass-600 shadow-sm" />
      <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-brass-600 shadow-sm" />
      
      {disabled && <div className="absolute inset-0 bg-black/40 backdrop-grayscale" />}
    </motion.button>
  );
};

export const ForgeScreen = () => {
  const profile = useGameStore((state) => state.profile);
  const forgeResults = useGameStore((state) => state.ui.forgeResults);
  const forgeCard = useGameStore((state) => state.forgeCard);
  const setScreen = useGameStore((state) => state.setScreen);
  const setStatus = useGameStore((state) => state.setStatus);

  const [isOpening, setIsOpening] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [selectedCard, setSelectedCard] = useState<{ card: GameCard; unlocked: boolean } | null>(null);

  const unlockedIds = new Set(profile.unlockedCards);
  const unlockedCount = profile.unlockedCards.length;
  const lockedCount = Math.max(0, cards.length - unlockedCount);

  const recentRewards = cards
    .filter((card) => forgeResults.includes(card.id))
    .map((card, index) => createRuntimeCard(card, "player", 100 + index));

  const handleOpenPack = () => {
    if (profile.forgeCredits < FORGE_COST || lockedCount === 0) return;
    setIsOpening(true);
    setRevealedIndices([]);
    forgeCard();
  };

  const handleReveal = (index: number) => {
    if (!revealedIndices.includes(index)) {
      setRevealedIndices([...revealedIndices, index]);
    }
  };

  const allRevealed = revealedIndices.length === 3 && recentRewards.length === 3;

  return (
    <GameLayout>
      <div className="flex flex-col gap-8 pb-10">
        
        {/* ── HEADER ── */}
        <header className="flex items-center justify-between rounded-[2.5rem] border border-brass-500/18 bg-[linear-gradient(145deg,rgba(22,16,9,0.8),rgba(8,9,13,0.95))] p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brass-500/10 text-4xl shadow-[inset_0_0_20px_rgba(216,138,99,0.2)]">🔥</div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.6em] text-copper-300">Modulo Tático</p>
              <h1 className="font-display text-4xl text-brass-50 uppercase tracking-tighter">A Forja de Almas Seculares</h1>
            </div>
          </div>
          <div className="hidden items-center gap-8 sm:flex">
             <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.3em] text-brass-100/50">Creditos Disponiveis</p>
                <p className="font-display text-2xl text-emerald-400">{profile.forgeCredits}</p>
             </div>
             <button onClick={() => setScreen("dashboard")} className="rounded-full border border-white/10 bg-white/5 p-4 text-xl transition hover:bg-white/10">🏠</button>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          
          {/* ── ÁREA DE ABERTURA ── */}
          <div className="relative flex min-h-[42rem] flex-col items-center justify-center overflow-hidden rounded-[3rem] border border-brass-500/10 bg-[radial-gradient(circle_at_center,rgba(42,26,16,0.6),rgba(8,9,13,0.95))] p-10 shadow-inner">
            <AnimatePresence mode="wait">
              {!isOpening ? (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                  className="flex flex-col items-center text-center"
                >
                  <BoosterPack onClick={handleOpenPack} disabled={profile.forgeCredits < FORGE_COST || lockedCount === 0} />
                  <p className="mt-8 max-w-xs text-sm leading-relaxed text-brass-100/60 uppercase tracking-[0.2em]">
                    {lockedCount === 0 ? "Coleção Completa!" : `Custo: ${FORGE_COST} Créditos`}
                  </p>
                  <p className="mt-4 text-[10px] uppercase tracking-widest text-copper-400">Clique para forjar 3 novas unidades</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="opening"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="grid gap-6 sm:grid-cols-3">
                    {[0, 1, 2].map((idx) => {
                      const card = recentRewards[idx];
                      const isRevealed = revealedIndices.includes(idx);
                      
                      return (
                        <motion.div 
                          key={idx}
                          initial={{ y: 50, opacity: 0, scale: 0.5, rotateY: 180 }}
                          animate={{ y: 0, opacity: 1, scale: 1, rotateY: isRevealed ? 0 : 180 }}
                          transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                          className="relative cursor-pointer perspective-1000"
                          onClick={() => handleReveal(idx)}
                        >
                          {isRevealed && card ? (
                            <CardView 
                              card={card} 
                              selectable 
                              onClick={() => setSelectedCard({ card, unlocked: true })} 
                            />
                          ) : (
                            <div className="h-[16.5rem] w-[10.4rem] rounded-[1.45rem] border-4 border-brass-800 bg-[linear-gradient(135deg,#3c2818,#1a110a)] shadow-xl flex items-center justify-center overflow-hidden">
                               <div className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">⚙️</div>
                               {/* Brilho da Raridade Oculto */}
                               {!isRevealed && card && (card.rarity === "legendary" || card.rarity === "mythic") && (
                                 <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent animate-pulse" />
                               )}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {allRevealed && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setIsOpening(false)}
                      className="mt-12 rounded-full border border-brass-100/20 bg-emerald-500/10 px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 hover:bg-emerald-500/20"
                    >
                      Coletar e Voltar
                    </motion.button>
                  )}
                  
                  {!allRevealed && (
                    <p className="mt-10 text-xs uppercase tracking-[0.4em] text-brass-100/40 animate-bounce">
                      Clique nas cartas para revelar
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Partículas de Vapor de Fundo */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
              <div className="absolute top-1/2 left-1/4 h-20 w-20 rounded-full bg-white/20 blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/3 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />
            </div>
          </div>

          {/* ── PAINEL DE PROGRESSO ── */}
          <div className="flex flex-col gap-6">
            <div className="rounded-[2.2rem] border border-brass-500/15 bg-black/40 p-10 shadow-copper">
                <h3 className="font-display text-2xl text-brass-50 uppercase tracking-widest">Status da Coleção</h3>
                <div className="mt-8 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs uppercase tracking-widest text-brass-100/60 font-semibold">
                      <span>Progresso Geral</span>
                      <span>{unlockedCount}/{cards.length}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(unlockedCount / cards.length) * 100}%` }}
                        className="h-full bg-[linear-gradient(90deg,#d88a63,#ebcb71)]" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                       <p className="text-[10px] uppercase tracking-widest text-brass-100/40">Faltam</p>
                       <p className="text-2xl font-bold text-brass-50">{lockedCount}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-right">
                       <p className="text-[10px] uppercase tracking-widest text-brass-100/40">Cartas Totais</p>
                       <p className="text-2xl font-bold text-brass-50">{cards.length}</p>
                    </div>
                  </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-[2.2rem] border border-brass-500/15 bg-black/40 p-6 shadow-copper">
               <h3 className="mb-6 font-display text-xl text-brass-50 uppercase tracking-widest">Biblioteca da Montanha</h3>
               <div className="grid grid-cols-3 gap-3">
                 {cards.slice(0, 9).map((card) => {
                    const unlocked = unlockedIds.has(card.id);
                    return (
                      <div key={card.id} className={`aspect-[3/4] rounded-xl border border-white/5 bg-white/[0.03] transition grayscale ${unlocked ? "grayscale-0 opacity-100" : "opacity-30"}`}>
                        <div className="flex h-full flex-col items-center justify-center p-2 text-center">
                          <span className="text-xl">{unlocked ? "🦾" : "🔒"}</span>
                          <span className="mt-2 text-[8px] uppercase tracking-tighter text-brass-100/60 truncate w-full">{card.name}</span>
                        </div>
                      </div>
                    );
                 })}
               </div>
               <button onClick={() => setScreen("deck-builder")} className="mt-6 w-full rounded-xl border border-brass-100/10 bg-white/5 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-brass-100 hover:bg-white/10">Gerenciar Deck Completo</button>
            </div>
          </div>

        </section>
      </div>

      {selectedCard ? <CardLoreModal card={selectedCard.card} unlocked={selectedCard.unlocked} onClose={() => setSelectedCard(null)} /> : null}
    </GameLayout>
  );
};
