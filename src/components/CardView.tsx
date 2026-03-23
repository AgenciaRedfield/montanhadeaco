import { motion } from "framer-motion";
import type { GameCard } from "@/types/game";

interface CardViewProps {
  card: GameCard;
  compact?: boolean;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const rarityGlow = {
  common: "from-stone-700/80 to-smoke-900/90",
  uncommon: "from-brass-700/85 to-smoke-900/90",
  rare: "from-copper-700/85 to-smoke-900/90",
  epic: "from-copper-500/90 to-brass-900/95",
  legendary: "from-brass-400/85 to-copper-700/95",
  mythic: "from-amber-200/90 to-copper-600/95",
} as const;

const abilityLabel = {
  criticalStrike: "Critical",
  steamBurst: "Steam Burst",
  repair: "Repair",
  shield: "Shield",
  overclock: "Overclock",
} as const;

export const CardView = ({ card, compact = false, selectable = false, selected = false, disabled = false, onClick }: CardViewProps) => {
  const height = compact ? "h-44 w-32" : "h-56 w-40";

  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: compact ? -6 : -10, rotate: compact ? 0 : -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={onClick}
      className={`${height} relative overflow-hidden rounded-[1.75rem] border text-left transition ${
        selected
          ? "border-brass-200 shadow-[0_0_0_2px_rgba(246,231,177,0.6),0_0_30px_rgba(187,131,48,0.35)]"
          : "border-brass-700/50"
      } ${disabled ? "cursor-not-allowed opacity-60" : selectable ? "cursor-pointer" : "cursor-default"} bg-gradient-to-br ${rarityGlow[card.rarity]} shadow-copper`}
    >
      <div className="absolute inset-0 bg-steel-grid bg-[size:24px_24px] opacity-15" />
      <div className="absolute -left-10 top-4 h-24 w-24 rounded-full bg-copper-400/20 blur-2xl" />
      <div className="absolute bottom-0 right-0 h-32 w-24 bg-gradient-to-tl from-brass-100/10 to-transparent" />

      <div className="relative flex h-full flex-col p-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-lg leading-none text-brass-50">{card.name}</p>
            <p className="text-[10px] uppercase tracking-[0.35em] text-brass-200/70">{card.class}</p>
          </div>
          <div className="rounded-full border border-brass-100/20 bg-black/25 px-2 py-1 text-xs font-semibold text-brass-100">{card.energyCost}</div>
        </div>

        <div className="relative mb-3 flex-1 overflow-hidden rounded-2xl border border-brass-100/10 bg-black/20">
          {card.image ? (
            <img src={card.image} alt={card.name} className="h-full w-full object-cover opacity-85 mix-blend-screen" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-copper-700/30 to-brass-900/20">
              <span className="font-display text-4xl text-brass-100/80">{(card.value ?? card.name).slice(0, 2)}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2">
            <p className="text-[10px] uppercase tracking-[0.28em] text-brass-100/75">{abilityLabel[card.ability as keyof typeof abilityLabel] ?? card.ability}</p>
            <p className="line-clamp-2 text-[11px] leading-tight text-brass-50/85">{card.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-brass-50">
          <div className="rounded-xl border border-copper-400/30 bg-copper-950/35 px-2 py-1">
            <span className="block text-[10px] uppercase tracking-[0.25em] text-copper-300/80">ATK</span>
            <span>{card.attack}</span>
          </div>
          <div className="rounded-xl border border-brass-300/25 bg-black/30 px-2 py-1">
            <span className="block text-[10px] uppercase tracking-[0.25em] text-brass-100/80">DEF</span>
            <span>{card.currentDefense}</span>
          </div>
          <div className="rounded-xl border border-sky-200/15 bg-sky-950/20 px-2 py-1">
            <span className="block text-[10px] uppercase tracking-[0.25em] text-sky-200/70">SHD</span>
            <span>{card.shield}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
