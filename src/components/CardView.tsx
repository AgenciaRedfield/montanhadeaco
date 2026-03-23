import { motion } from "framer-motion";
import type { GameCard } from "@/types/game";

interface CardViewProps {
  card: GameCard;
  compact?: boolean;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onHoverChange?: (card: GameCard | null) => void;
}

const rarityFrame = {
  common: "from-stone-700/90 via-smoke-900 to-black",
  uncommon: "from-brass-800/90 via-smoke-900 to-black",
  rare: "from-copper-800/90 via-smoke-900 to-black",
  epic: "from-copper-700/95 via-brass-900 to-black",
  legendary: "from-brass-500/90 via-copper-800 to-black",
  mythic: "from-amber-200/90 via-copper-700 to-black",
} as const;

const rarityEdge = {
  common: "border-stone-500/35",
  uncommon: "border-brass-500/35",
  rare: "border-copper-500/35",
  epic: "border-copper-300/40",
  legendary: "border-brass-200/45",
  mythic: "border-amber-100/50",
} as const;

export const CardView = ({ card, compact = false, selectable = false, selected = false, disabled = false, onClick, onHoverChange }: CardViewProps) => {
  const size = compact ? "h-[11rem] w-[7.3rem] sm:h-[12.5rem] sm:w-[8.6rem]" : "h-[14.4rem] w-[8.8rem] sm:h-[16.5rem] sm:w-[10.4rem]";

  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: compact ? -5 : -10, rotate: compact ? 0 : -1, scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.985 }}
      onHoverStart={() => onHoverChange?.(card)}
      onHoverEnd={() => onHoverChange?.(null)}
      onFocus={() => onHoverChange?.(card)}
      onBlur={() => onHoverChange?.(null)}
      onClick={onClick}
      className={`${size} group relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.45rem] border bg-gradient-to-br ${rarityFrame[card.rarity]} ${rarityEdge[card.rarity]} text-left shadow-[0_12px_30px_rgba(0,0,0,0.42)] transition ${selected ? "ring-2 ring-brass-100/70" : ""} ${disabled ? "cursor-not-allowed opacity-50" : selectable ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="absolute inset-[4px] rounded-[1.05rem] sm:rounded-[1.2rem] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_18%,rgba(0,0,0,0.3)_100%)]" />
      <div className="absolute inset-0 bg-steel-grid bg-[size:20px_20px] opacity-[0.06]" />
      <div className="absolute -top-4 left-4 h-10 w-12 rounded-b-[1.4rem] border-x border-b border-brass-100/12 bg-black/25" />
      <div className="absolute left-3 right-3 top-3 flex justify-between text-[7px] sm:text-[8px] uppercase tracking-[0.24em] sm:tracking-[0.28em] text-brass-100/50">
        <span>{card.class}</span>
        <span>{card.rarity}</span>
      </div>
      <div className="absolute left-3 top-7 z-20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-brass-100/18 bg-black/55 font-display text-sm sm:text-base text-brass-50">
        {card.energyCost}
      </div>
      <div className="absolute right-3 top-7 z-20 h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-copper-300/20 bg-copper-600/8 shadow-[0_0_18px_rgba(216,138,99,0.18)]" />

      <div className="relative flex h-full flex-col p-2.5 sm:p-3">
        <div className="pt-10 sm:pt-11">
          <div className="rounded-[0.9rem] sm:rounded-[1rem] border border-brass-100/10 bg-black/38 px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
            <p className="line-clamp-2 font-display text-[0.95rem] sm:text-[1.05rem] leading-none text-brass-50">{card.name}</p>
          </div>
        </div>

        <div className="relative mt-2 flex-1 overflow-hidden rounded-[1rem] sm:rounded-[1.15rem] border border-brass-100/10 bg-[radial-gradient(circle_at_top,rgba(216,138,99,0.18),transparent_40%),linear-gradient(180deg,rgba(22,16,9,0.7),rgba(5,6,8,0.95))]">
          {card.image ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(235,203,113,0.08),transparent_65%)]" />
              <img src={card.image} alt={card.name} className="relative z-10 h-full w-full object-contain p-2 opacity-95 drop-shadow-[0_16px_22px_rgba(0,0,0,0.5)]" />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <div className="grid grid-cols-3 gap-1.5 opacity-35">
                {Array.from({ length: 9 }, (_, index) => (
                  <span key={index} className="h-2.5 w-2.5 rounded-full border border-copper-300/25 bg-copper-500/10" />
                ))}
              </div>
              <span className="font-display text-3xl sm:text-4xl text-brass-50/80">{(card.value ?? card.name).slice(0, 2)}</span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.28em] sm:tracking-[0.35em] text-brass-100/40">Sigil</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.94)_68%)] p-2">
            <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.22em] sm:tracking-[0.26em] text-copper-200/70">{card.ability}</p>
            <p className="mt-1 line-clamp-2 text-[9px] sm:text-[10px] leading-snug text-brass-50/76">{card.description}</p>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1">
          <div className="rounded-[0.75rem] sm:rounded-[0.85rem] border border-copper-300/20 bg-black/35 px-2 py-1 text-center">
            <p className="text-[7px] sm:text-[8px] uppercase tracking-[0.18em] sm:tracking-[0.22em] text-copper-200/60">ATK</p>
            <p className="text-sm sm:text-base font-semibold text-brass-50">{card.currentAttack ?? card.attack}</p>
          </div>
          <div className="rounded-[0.75rem] sm:rounded-[0.85rem] border border-brass-200/15 bg-black/35 px-2 py-1 text-center">
            <p className="text-[7px] sm:text-[8px] uppercase tracking-[0.18em] sm:tracking-[0.22em] text-brass-100/60">DEF</p>
            <p className="text-sm sm:text-base font-semibold text-brass-50">{card.currentDefense}</p>
          </div>
          <div className="rounded-[0.75rem] sm:rounded-[0.85rem] border border-sky-300/15 bg-black/35 px-2 py-1 text-center">
            <p className="text-[7px] sm:text-[8px] uppercase tracking-[0.18em] sm:tracking-[0.22em] text-sky-100/60">ESC</p>
            <p className="text-sm sm:text-base font-semibold text-brass-50">{card.shield}</p>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
