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
  const emptySlots = Math.max(0, 5 - cards.length);

  return (
    <section className="rounded-[1.6rem] border border-brass-700/30 bg-black/18 p-3.5 shadow-insetPanel backdrop-blur-xl">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/50">{subtitle}</p>
          <h3 className="font-display text-xl text-brass-50">{title}</h3>
        </div>
        <p className="text-[10px] uppercase tracking-[0.26em] text-brass-100/50">{cards.length}/5 unidades</p>
      </div>
      <div className="grid min-h-[10rem] grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <AnimatePresence>
          {cards.map((card, index) => (
            <motion.div key={card.instanceId} layout initial={{ opacity: 0, y: attackMode ? -16 : 16, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.88 }} transition={{ delay: index * 0.03 }}>
              <CardView card={card} compact selected={selectedId === card.instanceId} selectable={!!onCardClick} disabled={!onCardClick} onClick={() => onCardClick?.(card)} onHoverChange={onCardHover} />
            </motion.div>
          ))}
        </AnimatePresence>
        {Array.from({ length: emptySlots }, (_, index) => (
          <div key={`slot-${title}-${index}`} className="rounded-[1.35rem] border border-dashed border-brass-100/10 bg-white/[0.015]" />
        ))}
      </div>
    </section>
  );
};