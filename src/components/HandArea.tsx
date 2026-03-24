import { motion } from "framer-motion";
import { CardView } from "@/components/CardView";
import type { GameCard } from "@/types/game";

interface HandAreaProps {
  cards: GameCard[];
  disabled?: boolean;
  battlefield?: boolean;
  onPlay: (card: GameCard) => void;
  onCardHover?: (card: GameCard | null) => void;
}

export const HandArea = ({ cards, disabled = false, battlefield = false, onPlay, onCardHover }: HandAreaProps) => {
  return (
    <section className={battlefield ? "rounded-[1.9rem] border border-[rgba(88,55,32,0.7)] bg-[linear-gradient(180deg,rgba(77,49,29,0.84),rgba(42,26,16,0.96))] p-3.5 shadow-[inset_0_1px_0_rgba(255,220,170,0.08),0_14px_40px_rgba(0,0,0,0.24)]" : "rounded-[1.7rem] border border-brass-700/30 bg-black/22 p-3 sm:p-3.5 shadow-insetPanel backdrop-blur-xl"}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/50">Mao do Comandante</p>
          <h3 className="font-display text-lg sm:text-xl text-brass-50">{battlefield ? "Reserva de Combate" : "Cartas Disponiveis"}</h3>
        </div>
        <p className="text-[10px] uppercase tracking-[0.26em] text-brass-100/50">{cards.length} em reserva</p>
      </div>
      <div className={`flex min-h-[9.6rem] items-end gap-1 overflow-x-auto overflow-y-hidden px-1 pb-2 pt-4 touch-pan-x sm:min-h-[11.5rem] sm:px-2 sm:pt-5 ${battlefield ? "rounded-[1.4rem] border border-black/20 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.24))]" : ""}`}>
        {cards.map((card, index) => {
          const rotate = (index - (cards.length - 1) / 2) * 1.1;
          return (
            <motion.div key={card.instanceId} initial={{ opacity: 0, y: 42 }} animate={{ opacity: 1, y: 0, rotate }} whileHover={{ y: -12, rotate: 0, zIndex: 40 }} transition={{ type: "spring", stiffness: 130, damping: 18, delay: index * 0.025 }} style={{ marginLeft: index === 0 ? 0 : undefined, zIndex: index + 1 }} className="origin-bottom first:ml-0 ml-[-34px] sm:ml-[-52px]">
              <CardView card={card} disabled={disabled} selectable={!disabled} onClick={() => onPlay(card)} onHoverChange={onCardHover} />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
