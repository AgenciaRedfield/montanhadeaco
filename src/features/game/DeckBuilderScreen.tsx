import { motion } from "framer-motion";
import { CardView } from "@/components/CardView";
import { DECK_COPY_LIMIT, DECK_SIZE } from "@/services/progressionService";
import { cards } from "@/data/cards";
import { GameLayout } from "@/features/game/GameLayout";
import { useGameStore } from "@/store/gameStore";
import { countDeckCopies, createRuntimeCard } from "@/utils/gameHelpers";

export const DeckBuilderScreen = () => {
  const profile = useGameStore((state) => state.profile);
  const status = useGameStore((state) => state.ui.status);
  const addDeckCard = useGameStore((state) => state.addDeckCard);
  const removeDeckCard = useGameStore((state) => state.removeDeckCard);
  const setScreen = useGameStore((state) => state.setScreen);

  const unlocked = cards.filter((card) => profile.unlockedCards.includes(card.id));
  const deckCards = profile.selectedDeck
    .map((cardId, index) => {
      const card = cards.find((entry) => entry.id === cardId);
      return card ? createRuntimeCard(card, "player", 200 + index) : null;
    })
    .filter((card): card is NonNullable<typeof card> => Boolean(card));

  return (
    <GameLayout>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-brass-500/16 bg-black/28 p-5 shadow-copper backdrop-blur-xl">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/48">Arsenal Liberado</p>
              <h1 className="mt-1 font-display text-4xl text-brass-50">Construtor de Deck</h1>
            </div>
            <button type="button" onClick={() => setScreen("dashboard")} className="rounded-[1rem] border border-brass-100/15 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-brass-50">
              Voltar
            </button>
          </div>

          <div className="mb-5 rounded-[1.2rem] border border-copper-400/14 bg-black/26 p-4 text-sm leading-relaxed text-brass-100/72">
            {status}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {unlocked.map((card, index) => {
              const copies = countDeckCopies(profile.selectedDeck, card.id);
              const preview = createRuntimeCard(card, "player", index);
              const canAdd = profile.selectedDeck.length < DECK_SIZE && copies < DECK_COPY_LIMIT;

              return (
                <div key={card.id} className="relative">
                  <CardView card={preview} compact />
                  <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-2 rounded-[0.8rem] border border-brass-100/10 bg-black/60 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-brass-50">
                    <span>{copies}/{DECK_COPY_LIMIT}</span>
                    <button type="button" onClick={() => addDeckCard(card.id)} disabled={!canAdd} className="rounded-md border border-brass-100/15 bg-white/10 px-2 py-1 disabled:opacity-35">+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 auto-rows-min">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-brass-500/16 bg-[radial-gradient(circle_at_top,rgba(216,138,99,0.14),transparent_38%),linear-gradient(145deg,rgba(8,9,13,0.82),rgba(16,18,25,0.94))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/48">Deck Ativo</p>
            <h2 className="mt-1 font-display text-3xl text-brass-50">Lista de Batalha</h2>
            <p className="mt-3 text-sm text-brass-100/70">Monte seu deck com {DECK_SIZE} cartas. Cada carta pode entrar ate {DECK_COPY_LIMIT} vezes.</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full border border-brass-100/10 bg-black/40">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#d88a63_0%,#ebcb71_100%)]" style={{ width: `${Math.min(100, (profile.selectedDeck.length / DECK_SIZE) * 100)}%` }} />
            </div>
            <p className="mt-3 text-sm font-semibold text-brass-50">{profile.selectedDeck.length}/{DECK_SIZE} cartas</p>
          </motion.div>

          <div className="rounded-[2rem] border border-brass-500/16 bg-black/28 p-5 shadow-copper backdrop-blur-xl">
            <div className="grid gap-2">
              {deckCards.map((card, index) => (
                <div key={`${card.baseId}-${index}`} className="flex items-center justify-between gap-3 rounded-[1rem] border border-brass-100/10 bg-black/35 px-4 py-3 text-sm text-brass-50">
                  <div>
                    <p className="font-semibold">{index + 1}. {card.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-brass-100/52">{card.class} • {card.rarity}</p>
                  </div>
                  <button type="button" onClick={() => removeDeckCard(index)} className="rounded-[0.9rem] border border-brass-100/15 bg-white/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-brass-50">
                    Remover
                  </button>
                </div>
              ))}
              {deckCards.length === 0 ? (
                <div className="rounded-[1rem] border border-brass-100/10 bg-black/30 p-5 text-sm text-brass-100/65">Seu deck esta vazio.</div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </GameLayout>
  );
};
