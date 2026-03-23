import { AnimatePresence, motion } from "framer-motion";
import { CardView } from "@/components/CardView";
import type { GameCard } from "@/types/game";

interface BoardRowProps {
  title: string;
  subtitle: string;
  cards: GameCard[];
  selectedId?: string | null;
  attackMode?: boolean;
  onCardClick?: (card: GameCard) => void;
  onCardHover?: (card: GameCard | null) => void;
}

export const BoardRow = ({ title, subtitle, cards, selectedId, attackMode = false, onCardClick, onCardHover }: BoardRowProps) => {
  return (
    <section className="rounded-[2rem] border border-brass-700/30 bg-black/20 p-4 shadow-insetPanel backdrop-blur-xl">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.36em] text-brass-100/52">{subtitle}</p>
          <h3 className="font-display text-2xl text-brass-50">{title}</h3>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-brass-100/55">{cards.length}/5 unidades</p>
      </div>
      <div className="grid min-h-[12rem] grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <AnimatePresence>
          {cards.map((card, index) => (
            <motion.div key={card.instanceId} layout initial={{ opacity: 0, y: attackMode ? -20 : 20, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.88 }} transition={{ delay: index * 0.04 }}>
              <CardView card={card} compact selected={selectedId === card.instanceId} selectable={!!onCardClick} disabled={!onCardClick} onClick={() => onCardClick?.(card)} onHoverChange={onCardHover} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
};