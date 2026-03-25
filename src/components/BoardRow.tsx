import { AnimatePresence, motion } from "framer-motion";
import { CardView } from "@/components/CardView";
import type { GameCard } from "@/types/game";

interface BoardRowProps {
  title: string;
  subtitle: string;
  cards: GameCard[];
  selectedId?: string | null;
  attackMode?: boolean;
  battlefield?: boolean;
  /** Se true, destaca todas as cartas como alvo válido (pulsação vermelha) */
  highlightTargets?: boolean;
  onCardClick?: (card: GameCard) => void;
  onCardHover?: (card: GameCard | null) => void;
  onInspect?: (card: GameCard) => void;
}

export const BoardRow = ({
  title,
  subtitle,
  cards,
  selectedId,
  attackMode = false,
  battlefield = false,
  highlightTargets = false,
  onCardClick,
  onCardHover,
  onInspect,
}: BoardRowProps) => {
  const emptySlots = Math.max(0, 5 - cards.length);

  return (
    <section className={battlefield ? "relative" : "rounded-[1.6rem] border border-brass-700/30 bg-black/18 p-3 sm:p-3.5 shadow-insetPanel backdrop-blur-xl"}>
      <div className={`mb-3 flex items-end justify-between gap-4 ${battlefield ? "px-1" : ""}`}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/50">{subtitle}</p>
          <h3 className="font-display text-lg sm:text-xl text-brass-50">{title}</h3>
        </div>
        <p className="text-[10px] uppercase tracking-[0.26em] text-brass-100/50">{cards.length}/5 unidades</p>
      </div>

      <div className={battlefield ? "overflow-x-auto pb-2" : ""}>
        <div className={battlefield ? "relative mx-auto grid min-w-[38rem] grid-cols-5 gap-3 px-1 pt-3" : "grid min-h-[8.4rem] grid-cols-2 gap-2 sm:min-h-[10rem] sm:gap-3 md:grid-cols-3 xl:grid-cols-5"}>
          {battlefield ? (
            <div className="pointer-events-none absolute left-[3%] right-[3%] top-[4.4rem] h-[3.6rem] rounded-[1.4rem] border border-black/20 bg-[linear-gradient(180deg,rgba(92,60,33,0.9),rgba(48,29,17,0.96))] shadow-[inset_0_2px_0_rgba(255,221,173,0.08),0_10px_24px_rgba(0,0,0,0.24)]" />
          ) : null}

          <AnimatePresence>
            {cards.map((card, index) => (
              <motion.div
                key={card.instanceId}
                layout
                initial={{ opacity: 0, y: attackMode ? -16 : 16, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.88 }}
                transition={{ delay: index * 0.03 }}
                className={battlefield ? "relative z-10 flex justify-center" : undefined}
              >
                {battlefield ? <div className="absolute inset-x-3 top-[3.1rem] h-[7.8rem] rounded-[1.5rem] border border-black/18 bg-[linear-gradient(180deg,rgba(113,77,47,0.22),rgba(57,33,20,0.08))]" /> : null}
                <div className={battlefield ? "origin-center scale-[0.82] sm:scale-[0.9] lg:scale-100" : ""}>
                  <CardView
                    card={card}
                    compact
                    selected={selectedId === card.instanceId}
                    targetHighlight={highlightTargets && !!onCardClick}
                    selectable={!!onCardClick}
                    disabled={!onCardClick}
                    onClick={() => onCardClick?.(card)}
                    onHoverChange={onCardHover}
                    onInspect={onInspect}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {Array.from({ length: emptySlots }, (_, index) => (
            <div key={`slot-${title}-${index}`} className={battlefield ? "relative z-10 flex justify-center" : undefined}>
              {battlefield ? (
                <>
                  <div className="absolute inset-x-3 top-[3.1rem] h-[7.8rem] rounded-[1.5rem] border border-dashed border-black/20 bg-[linear-gradient(180deg,rgba(135,96,63,0.12),rgba(57,33,20,0.02))]" />
                  <div className="relative mt-2 h-[11.2rem] w-[8.4rem] rounded-[1.5rem] border border-dashed border-brass-100/10 bg-black/10" />
                </>
              ) : (
                <div className="min-h-[8rem] rounded-[1.1rem] border border-dashed border-brass-100/10 bg-white/[0.015] sm:min-h-[10rem] sm:rounded-[1.35rem]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
