import { motion } from "framer-motion";
import { CardView } from "@/components/CardView";
import type { GameCard } from "@/types/game";

interface HandAreaProps {
  cards: GameCard[];
  disabled?: boolean;
  onPlay: (card: GameCard) => void;
  onCardHover?: (card: GameCard | null) => void;
}

export const HandArea = ({ cards, disabled = false, onPlay, onCardHover }: HandAreaProps) => {
  return (
    <section className="rounded-[1.7rem] border border-brass-700/30 bg-black/22 p-3 sm:p-3.5 shadow-insetPanel backdrop-blur-xl">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/50">Mao do Comandante</p>
          <h3 className="font-display text-lg sm:text-xl text-brass-50">Cartas Disponiveis</h3>
        </div>
        <p className="text-[10px] uppercase tracking-[0.26em] text-brass-100/50">{cards.length} em reserva</p>
      </div>
      <div className="flex min-h-[9.6rem] sm:min-h-[11.5rem] items-end gap-1 overflow-x-auto overflow-y-hidden px-1 sm:px-2 pb-2 pt-4 sm:pt-5 touch-pan-x">
        {cards.map((card, index) => {
          const overlap = Math.min(index * 6, 34);
          const overlapDesktop = Math.min(index * 8, 52);
          const rotate = (index - (cards.length - 1) / 2) * 1.1;
          return (
            <motion.div key={card.instanceId} initial={{ opacity: 0, y: 42 }} animate={{ opacity: 1, y: 0, rotate }} whileHover={{ y: -12, rotate: 0, zIndex: 40 }} transition={{ type: "spring", stiffness: 130, damping: 18, delay: index * 0.025 }} style={{ marginLeft: index === 0 ? 0 : undefined, zIndex: index + 1 }} className="origin-bottom first:ml-0 ml-[-34px] sm:ml-[-52px]" data-mobile-overlap={overlap} data-desktop-overlap={overlapDesktop}>
              <CardView card={card} disabled={disabled} selectable={!disabled} onClick={() => onPlay(card)} onHoverChange={onCardHover} />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
