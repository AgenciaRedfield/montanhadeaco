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
    <section className="rounded-[2rem] border border-brass-700/30 bg-black/25 p-4 shadow-insetPanel backdrop-blur-xl">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.36em] text-brass-100/52">Mao do Comandante</p>
          <h3 className="font-display text-2xl text-brass-50">Cartas Disponiveis</h3>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-brass-100/55">{cards.length} em reserva</p>
      </div>
      <div className="flex min-h-[16rem] items-end gap-2 overflow-x-auto overflow-y-hidden px-3 pb-3 pt-8">
        {cards.map((card, index) => {
          const offset = Math.min(index * 3, 24);
          const rotate = (index - cards.length / 2) * 1.5;
          return (
            <motion.div key={card.instanceId} initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0, rotate }} whileHover={{ y: -18, rotate: 0, zIndex: 40 }} transition={{ type: "spring", stiffness: 130, damping: 18, delay: index * 0.03 }} style={{ marginLeft: index === 0 ? 0 : -offset, zIndex: index + 1 }} className="origin-bottom">
              <CardView card={card} disabled={disabled} selectable={!disabled} onClick={() => onPlay(card)} onHoverChange={onCardHover} />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};