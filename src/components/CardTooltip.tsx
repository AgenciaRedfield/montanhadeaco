import { AnimatePresence, motion } from "framer-motion";
import type { GameCard } from "@/types/game";

interface CardTooltipProps {
  card: GameCard | null;
}

export const CardTooltip = ({ card }: CardTooltipProps) => {
  return (
    <AnimatePresence>
      {card ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="rounded-[1.8rem] border border-brass-500/20 bg-black/45 p-4 shadow-copper backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.35em] text-brass-100/55">Detalhes da Carta</p>
          <h3 className="mt-2 font-display text-3xl text-brass-50">{card.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.32em] text-copper-200/70">{card.class} • {card.rarity} • custo {card.energyCost}</p>
          <p className="mt-4 rounded-[1.2rem] border border-white/6 bg-white/[0.03] p-3 text-sm leading-relaxed text-brass-50/78">{card.description}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-copper-300/20 bg-copper-900/20 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.25em] text-copper-200/65">Ataque</p>
              <p className="font-semibold text-brass-50">{card.currentAttack ?? card.attack}</p>
            </div>
            <div className="rounded-2xl border border-brass-300/20 bg-brass-900/15 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.25em] text-brass-100/65">Defesa</p>
              <p className="font-semibold text-brass-50">{card.currentDefense}</p>
            </div>
            <div className="rounded-2xl border border-sky-300/15 bg-sky-950/20 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.25em] text-sky-100/60">Escudo</p>
              <p className="font-semibold text-brass-50">{card.shield}</p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};