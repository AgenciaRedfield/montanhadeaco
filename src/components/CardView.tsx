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
  const size = compact ? "h-[15.5rem] w-[10.5rem]" : "h-[20rem] w-[13rem]";

  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: compact ? -6 : -14, rotate: compact ? 0 : -1.2, scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.985 }}
      onHoverStart={() => onHoverChange?.(card)}
      onHoverEnd={() => onHoverChange?.(null)}
      onFocus={() => onHoverChange?.(card)}
      onBlur={() => onHoverChange?.(null)}
      onClick={onClick}
      className={`${size} group relative overflow-hidden rounded-[1.9rem] border bg-gradient-to-br ${rarityFrame[card.rarity]} ${rarityEdge[card.rarity]} text-left shadow-[0_16px_42px_rgba(0,0,0,0.45)] transition ${selected ? "ring-2 ring-brass-100/70" : ""} ${disabled ? "cursor-not-allowed opacity-50" : selectable ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="absolute inset-[6px] rounded-[1.55rem] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_18%,rgba(0,0,0,0.3)_100%)]" />
      <div className="absolute inset-0 bg-steel-grid bg-[size:24px_24px] opacity-[0.06]" />
      <div className="absolute -top-5 left-6 h-12 w-16 rounded-b-[2rem] border-x border-b border-brass-100/12 bg-black/25" />
      <div className="absolute left-3 right-3 top-3 flex justify-between text-[9px] uppercase tracking-[0.32em] text-brass-100/55">
        <span>{card.class}</span>
        <span>{card.rarity}</span>
      </div>
      <div className="absolute left-4 top-8 flex h-12 w-12 items-center justify-center rounded-full border border-brass-100/20 bg-black/40 font-display text-xl text-brass-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        {card.energyCost}
      </div>
      <div className="absolute right-4 top-8 h-12 w-12 rounded-full border border-copper-300/20 bg-copper-600/10 shadow-[0_0_24px_rgba(216,138,99,0.22)]" />

      <div className="relative flex h-full flex-col p-4">
        <div className="pt-16">
          <div className="rounded-[1.4rem] border border-brass-100/10 bg-black/30 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="font-display text-xl leading-none text-brass-50">{card.name}</p>
          </div>
        </div>

        <div className="relative mt-3 flex-1 overflow-hidden rounded-[1.5rem] border border-brass-100/10 bg-[radial-gradient(circle_at_top,rgba(216,138,99,0.18),transparent_40%),linear-gradient(180deg,rgba(22,16,9,0.7),rgba(5,6,8,0.95))]">
          {card.image ? (
            <img src={card.image} alt={card.name} className="h-full w-full object-cover opacity-85 mix-blend-screen" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <div className="grid grid-cols-3 gap-2 opacity-40">
                {Array.from({ length: 9 }, (_, index) => (
                  <span key={index} className="h-3 w-3 rounded-full border border-copper-300/25 bg-copper-500/10" />
                ))}
              </div>
              <span className="font-display text-5xl text-brass-50/80">{(card.value ?? card.name).slice(0, 2)}</span>
              <span className="text-[10px] uppercase tracking-[0.45em] text-brass-100/45">Industrial Sigil</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.92)_65%)] p-3">
            <p className="text-[10px] uppercase tracking-[0.32em] text-copper-200/70">{card.ability}</p>
            <p className="mt-1 text-[11px] leading-snug text-brass-50/78">{card.description}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-[1rem] border border-copper-300/20 bg-black/35 px-2 py-2 text-center">
            <p className="text-[9px] uppercase tracking-[0.28em] text-copper-200/60">ATK</p>
            <p className="text-lg font-semibold text-brass-50">{card.currentAttack ?? card.attack}</p>
          </div>
          <div className="rounded-[1rem] border border-brass-200/15 bg-black/35 px-2 py-2 text-center">
            <p className="text-[9px] uppercase tracking-[0.28em] text-brass-100/60">DEF</p>
            <p className="text-lg font-semibold text-brass-50">{card.currentDefense}</p>
          </div>
          <div className="rounded-[1rem] border border-sky-300/15 bg-black/35 px-2 py-2 text-center">
            <p className="text-[9px] uppercase tracking-[0.28em] text-sky-100/60">ESC</p>
            <p className="text-lg font-semibold text-brass-50">{card.shield}</p>
          </div>
        </div>
      </div>
    </motion.button>
  );
};