import { useState } from "react";
import { motion } from "framer-motion";
import { CardLoreModal } from "@/components/CardLoreModal";
import { CardView } from "@/components/CardView";
import { cards } from "@/data/cards";
import { GameLayout } from "@/features/game/GameLayout";
import { FORGE_COST } from "@/services/progressionService";
import { useGameStore } from "@/store/gameStore";
import type { GameCard } from "@/types/game";
import { createRuntimeCard } from "@/utils/gameHelpers";

export const ForgeScreen = () => {
  const profile = useGameStore((state) => state.profile);
  const status = useGameStore((state) => state.ui.status);
  const forgeResults = useGameStore((state) => state.ui.forgeResults);
  const forgeCard = useGameStore((state) => state.forgeCard);
  const setScreen = useGameStore((state) => state.setScreen);
  const [selectedCard, setSelectedCard] = useState<{ card: GameCard; unlocked: boolean } | null>(null);

  const unlockedIds = new Set(profile.unlockedCards);
  const unlockedCount = profile.unlockedCards.length;
  const lockedCount = Math.max(0, cards.length - unlockedCount);
  const previews = cards.map((card, index) => ({
    preview: createRuntimeCard(card, "player", index),
    unlocked: unlockedIds.has(card.id),
  }));
  const recentRewards = cards
    .filter((card) => forgeResults.includes(card.id))
    .map((card, index) => createRuntimeCard(card, "player", 100 + index));

  return (
    <GameLayout>
      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="grid gap-5 auto-rows-min">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2.2rem] border border-brass-500/18 bg-[radial-gradient(circle_at_top,rgba(216,138,99,0.16),transparent_34%),linear-gradient(145deg,rgba(8,9,13,0.82),rgba(16,18,25,0.94))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <p className="text-[11px] uppercase tracking-[0.52em] text-copper-200/68">Forja de Colecao</p>
            <h1 className="mt-4 font-display text-5xl text-brass-50">Ala da Forja</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-brass-100/72">
              Abra boosters de 3 cartas para expandir sua colecao de batalha. A Forja sempre tenta entregar cartas ainda nao desbloqueadas.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-brass-100/52">Creditos</p>
                <p className="mt-2 text-3xl font-semibold text-brass-50">{profile.forgeCredits}</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-brass-100/52">Desbloqueadas</p>
                <p className="mt-2 text-3xl font-semibold text-brass-50">{unlockedCount}/{cards.length}</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-brass-100/52">Restantes</p>
                <p className="mt-2 text-3xl font-semibold text-brass-50">{lockedCount}</p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => forgeCard()} disabled={profile.forgeCredits < FORGE_COST || lockedCount === 0} className="rounded-[1.25rem] border border-brass-100/20 bg-[linear-gradient(135deg,#d88a63_0%,#ebcb71_48%,#8d4326_100%)] px-6 py-4 text-sm font-semibold uppercase tracking-[0.32em] text-smoke-900 disabled:cursor-not-allowed disabled:opacity-45">
                Abrir Booster ({FORGE_COST})
              </button>
              <button type="button" onClick={() => setScreen("dashboard")} className="rounded-[1.25rem] border border-brass-100/15 bg-white/5 px-6 py-4 text-sm font-semibold uppercase tracking-[0.32em] text-brass-50">
                Voltar ao Dashboard
              </button>
            </div>

            <div className="mt-6 rounded-[1.25rem] border border-copper-400/14 bg-black/26 p-4 text-sm leading-relaxed text-brass-100/72">
              {status}
            </div>
          </motion.div>

          <div className="rounded-[2rem] border border-brass-500/16 bg-black/28 p-5 shadow-copper backdrop-blur-xl">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/48">Camara de Revelacao</p>
                <h2 className="mt-1 font-display text-3xl text-brass-50">Ultimo Booster</h2>
              </div>
              <p className="text-xs uppercase tracking-[0.28em] text-brass-100/46">3 cartas desbloqueadas</p>
            </div>

            {recentRewards.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {recentRewards.map((card) => (
                  <CardView key={card.instanceId} card={card} compact selectable onClick={() => setSelectedCard({ card, unlocked: true })} />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.2rem] border border-brass-100/10 bg-black/30 p-6 text-sm text-brass-100/68">
                Nenhum booster aberto nesta sessao ainda. Acenda a forja e revele novas cartas.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-brass-500/16 bg-black/28 p-5 shadow-copper backdrop-blur-xl">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/48">Colecao Tatica</p>
              <h2 className="mt-1 font-display text-3xl text-brass-50">Cartas da Fundicao</h2>
            </div>
            <p className="text-xs uppercase tracking-[0.28em] text-brass-100/46">Clique em uma carta para ver historia, detalhes e atributos</p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {previews.map(({ preview, unlocked }) => (
              <div key={preview.baseId} className={`relative ${unlocked ? "" : "opacity-55 saturate-0"}`}>
                <CardView card={preview} compact selectable onClick={() => setSelectedCard({ card: preview, unlocked })} />
                <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-[0.9rem] border border-brass-100/10 bg-black/62 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.26em] text-brass-50">
                  {unlocked ? "Desbloqueada" : "Bloqueada"}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedCard ? <CardLoreModal card={selectedCard.card} unlocked={selectedCard.unlocked} onClose={() => setSelectedCard(null)} /> : null}
    </GameLayout>
  );
};
