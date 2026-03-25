import { motion } from "framer-motion";
import type { GameCard } from "@/types/game";

interface CardViewProps {
  card: GameCard;
  compact?: boolean;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  /** Carta está sendo destacada como alvo válido */
  targetHighlight?: boolean;
  /** Carta acabou de receber dano (flash) */
  damagedFlash?: boolean;
  onInspect?: (card: GameCard) => void;
  onClick?: () => void;
  onHoverChange?: (card: GameCard | null) => void;
}

/* ── Gradiente do fundo da carta por raridade ── */
const rarityFrame = {
  common:    "from-stone-700/90 via-smoke-900 to-black",
  uncommon:  "from-emerald-900/80 via-smoke-900 to-black",
  rare:      "from-sky-900/80 via-smoke-900 to-black",
  epic:      "from-purple-900/85 via-smoke-900 to-black",
  legendary: "from-amber-700/75 via-copper-800 to-black",
  mythic:    "from-rose-700/70 via-purple-900 to-black",
} as const;

/* ── Cor da borda exterior por raridade ── */
const rarityEdge = {
  common:    "border-stone-500/40",
  uncommon:  "border-emerald-400/45",
  rare:      "border-sky-400/50",
  epic:      "border-purple-400/55",
  legendary: "border-amber-300/65",
  mythic:    "border-rose-300/70",
} as const;

/* ── Glow externo por raridade (usado via shadow) ── */
const rarityGlow = {
  common:    "",
  uncommon:  "shadow-[0_0_18px_rgba(52,211,153,0.18)]",
  rare:      "shadow-[0_0_22px_rgba(56,189,248,0.22)]",
  epic:      "shadow-[0_0_26px_rgba(168,85,247,0.28)]",
  legendary: "shadow-[0_0_32px_rgba(251,191,36,0.32)]",
  mythic:    "shadow-[0_0_40px_rgba(251,113,133,0.38)]",
} as const;

/* ── Label e cor do badge de raridade ── */
const rarityBadge = {
  common:    { label: "C",  color: "text-stone-300/70" },
  uncommon:  { label: "U",  color: "text-emerald-300" },
  rare:      { label: "R",  color: "text-sky-300" },
  epic:      { label: "E",  color: "text-purple-300" },
  legendary: { label: "L★", color: "text-amber-300" },
  mythic:    { label: "M✦", color: "text-rose-300" },
} as const;

/* ── Ícone de classe ── */
const classIcon = {
  tank:     "🛡",
  assassin: "⚔",
  support:  "💙",
  engineer: "⚙",
} as const;

export const CardView = ({
  card,
  compact = false,
  selectable = false,
  selected = false,
  disabled = false,
  targetHighlight = false,
  onInspect,
  onClick,
  onHoverChange,
}: CardViewProps) => {
  const size = compact
    ? "h-[11rem] w-[7.3rem] sm:h-[12.5rem] sm:w-[8.6rem]"
    : "h-[14.4rem] w-[8.8rem] sm:h-[16.5rem] sm:w-[10.4rem]";

  const badge = rarityBadge[card.rarity];
  const isSick = card.summonSickness === true;
  const hasActed = card.hasActed === true;

  const handleClick = (e: React.MouseEvent) => {
    if (e.altKey && onInspect) {
      onInspect(card);
      return;
    }
    onClick?.();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onInspect?.(card);
  };

  /* ── Classes do anel externo ── */
  let ringClass = "";
  if (targetHighlight)
    ringClass = "ring-2 ring-red-400/80 shadow-[0_0_28px_rgba(239,68,68,0.55)]";
  else if (selected)
    ringClass = "ring-2 ring-brass-100/80 shadow-[0_0_24px_rgba(235,203,113,0.45)]";
  else if (isSick || hasActed)
    ringClass = "ring-1 ring-white/10";

  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: compact ? -5 : -10, rotate: compact ? 0 : -1, scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.985 }}
      /* Animação de pulsação para alvo */
      animate={targetHighlight ? { scale: [1, 1.035, 1] } : {}}
      transition={targetHighlight ? { repeat: Infinity, duration: 0.85, ease: "easeInOut" } : {}}
      onHoverStart={() => onHoverChange?.(card)}
      onHoverEnd={() => onHoverChange?.(null)}
      onFocus={() => onHoverChange?.(card)}
      onBlur={() => onHoverChange?.(null)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={[
        size,
        "group relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.45rem] border",
        `bg-gradient-to-br ${rarityFrame[card.rarity]}`,
        rarityEdge[card.rarity],
        rarityGlow[card.rarity],
        "text-left transition",
        ringClass,
        (isSick || hasActed) ? "opacity-65 grayscale-[40%]" : "",
        disabled ? "cursor-not-allowed opacity-50" : selectable ? "cursor-pointer" : "cursor-default",
      ].filter(Boolean).join(" ")}
    >
      {/* ── Camada interna de textura ── */}
      <div className="absolute inset-[4px] rounded-[1.05rem] sm:rounded-[1.2rem] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_18%,rgba(0,0,0,0.3)_100%)]" />
      <div className="absolute inset-0 bg-steel-grid bg-[size:20px_20px] opacity-[0.06]" />

      {/* ── Detalhe de topo (entalhe decorativo) ── */}
      <div className="absolute -top-4 left-4 h-10 w-12 rounded-b-[1.4rem] border-x border-b border-brass-100/12 bg-black/25" />

      {/* ── Shimmer de raridade (rare+) ── */}
      {(card.rarity === "rare" || card.rarity === "epic" || card.rarity === "legendary" || card.rarity === "mythic") && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[1.25rem] sm:rounded-[1.45rem] bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.08)_50%,transparent_60%)]"
          animate={{ backgroundPositionX: ["200%", "-200%"] }}
          transition={{ repeat: Infinity, duration: card.rarity === "mythic" ? 1.8 : 3.2, ease: "linear" }}
        />
      )}

      {/* ── Glow animado Legendary / Mythic ── */}
      {card.rarity === "legendary" && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.22),transparent_55%)]"
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        />
      )}
      {card.rarity === "mythic" && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,113,133,0.28),transparent_55%)]"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        />
      )}

      {/* ── Overlay de actedHaze (usou ação neste turno) ── */}
      {hasActed && !isSick && (
        <div className="pointer-events-none absolute inset-0 rounded-[1.25rem] bg-black/35" />
      )}

      {/* ── Badge de SUMMON SICKNESS ── */}
      {isSick && (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-1 rounded-[1.25rem] bg-black/50">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="text-2xl"
          >
            💤
          </motion.div>
          <p className="text-[8px] uppercase tracking-[0.3em] text-brass-100/60">Mobilizando</p>
        </div>
      )}

      {/* ── Overlay vermelho de alvo ── */}
      {targetHighlight && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 rounded-[1.25rem] bg-red-500/12"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 0.85 }}
        />
      )}

      {/* ── Conteúdo da carta ── */}
      <div className="relative flex h-full flex-col p-2.5 sm:p-3">
        {/* Linha topo: classe | raridade */}
        <div className="absolute left-3 right-3 top-3 flex justify-between text-[7px] sm:text-[8px] uppercase tracking-[0.24em] text-brass-100/50">
          <span>{classIcon[card.class] ?? card.class}</span>
          <span className={badge.color}>{badge.label}</span>
        </div>

        {/* Custo de energia */}
        <div className="absolute left-3 top-7 z-20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-brass-100/18 bg-black/55 font-display text-sm sm:text-base text-brass-50">
          {card.energyCost}
        </div>

        {/* Círculo decorativo canto superior direito */}
        <div className="absolute right-3 top-7 z-20 h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-copper-300/20 bg-copper-600/8 shadow-[0_0_18px_rgba(216,138,99,0.18)]" />

        <div className="pt-10 sm:pt-11">
          <div className="rounded-[0.9rem] sm:rounded-[1rem] border border-brass-100/10 bg-black/38 px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
            <p className="line-clamp-2 font-display text-[0.95rem] sm:text-[1.05rem] leading-none text-brass-50">{card.name}</p>
          </div>
        </div>

        {/* Imagem / arte */}
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
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.28em] text-brass-100/40">Sigil</span>
            </div>
          )}

          {/* Rodapé com ability + descrição */}
          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.94)_68%)] p-2">
            <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.22em] text-copper-200/70">{card.ability}</p>
            <p className="mt-1 line-clamp-2 text-[9px] sm:text-[10px] leading-snug text-brass-50/76">{card.description}</p>
          </div>
        </div>

        {/* Stats ATK / DEF / ESC */}
        <div className="mt-2 grid grid-cols-3 gap-1">
          <div className="rounded-[0.75rem] sm:rounded-[0.85rem] border border-copper-300/20 bg-black/35 px-2 py-1 text-center">
            <p className="text-[7px] sm:text-[8px] uppercase tracking-[0.18em] text-copper-200/60">ATK</p>
            <p className={`text-sm sm:text-base font-semibold ${(card.currentAttack ?? card.attack) > card.attack ? "text-emerald-300" : "text-brass-50"}`}>
              {card.currentAttack ?? card.attack}
            </p>
          </div>
          <div className="rounded-[0.75rem] sm:rounded-[0.85rem] border border-brass-200/15 bg-black/35 px-2 py-1 text-center">
            <p className="text-[7px] sm:text-[8px] uppercase tracking-[0.18em] text-brass-100/60">DEF</p>
            <p className={`text-sm sm:text-base font-semibold ${card.currentDefense < card.defense ? "text-red-300" : "text-brass-50"}`}>
              {card.currentDefense}
            </p>
          </div>
          <div className="rounded-[0.75rem] sm:rounded-[0.85rem] border border-sky-300/15 bg-black/35 px-2 py-1 text-center">
            <p className="text-[7px] sm:text-[8px] uppercase tracking-[0.18em] text-sky-100/60">ESC</p>
            <p className="text-sm sm:text-base font-semibold text-brass-50">{card.shield}</p>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
