import { motion } from "framer-motion";
import type { GameCard } from "@/types/game";

interface CardLoreModalProps {
  card: GameCard;
  unlocked?: boolean;
  onClose: () => void;
}

const statCards = (card: GameCard) => [
  { label: "Ataque", value: card.currentAttack ?? card.attack },
  { label: "Defesa", value: card.currentDefense ?? card.defense },
  { label: "Escudo", value: card.shield ?? 0 },
  { label: "Custo", value: card.energyCost },
];

export const CardLoreModal = ({ card, unlocked = true, onClose }: CardLoreModalProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: 24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-brass-300/18 bg-[radial-gradient(circle_at_top,rgba(216,138,99,0.18),rgba(8,9,13,0.97)_62%)] shadow-[0_24px_100px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center justify-between border-b border-white/6 px-5 py-4 sm:px-7">
          <div>
            <p className="text-[10px] uppercase tracking-[0.36em] text-brass-100/50">Arquivo da Fundicao</p>
            <h2 className="mt-1 font-display text-3xl text-brass-50">{card.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-brass-100/14 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-brass-50"
          >
            Fechar
          </button>
        </div>

        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[1.6rem] border border-brass-100/10 bg-[radial-gradient(circle_at_top,rgba(216,138,99,0.16),transparent_35%),linear-gradient(180deg,rgba(22,16,9,0.84),rgba(5,6,8,0.96))] p-4">
              {card.image ? (
                <img
                  src={card.image}
                  alt={card.name}
                  className={`mx-auto h-[18rem] w-full object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.5)] ${unlocked ? "" : "opacity-35 grayscale"}`}
                />
              ) : (
                <div className="flex h-[18rem] items-center justify-center rounded-[1.2rem] border border-dashed border-brass-100/12 bg-black/25 px-6 text-center text-sm text-brass-100/54">
                  Ilustracao em calibracao na Fundicao.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {statCards(card).map((stat) => (
                <div key={stat.label} className="rounded-[1rem] border border-white/6 bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-brass-100/50">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-brass-50">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[1.4rem] border border-white/6 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-copper-200/70">
                {card.class} • {card.rarity} • habilidade {card.ability}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-brass-100/78">{card.description}</p>
            </div>

            <div className="rounded-[1.4rem] border border-white/6 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-brass-100/50">Historia</p>
              <p className="mt-3 text-sm leading-relaxed text-brass-100/78">
                {card.lore ?? "Os arquivos desta unidade ainda estao sendo restaurados pelos escribas da Fundicao."}
              </p>
              {!unlocked ? (
                <p className="mt-3 rounded-[0.9rem] border border-copper-300/14 bg-copper-400/8 px-3 py-2 text-xs uppercase tracking-[0.18em] text-copper-100/74">
                  Carta bloqueada. A ficha completa sera liberada ao desbloquear a unidade.
                </p>
              ) : null}
            </div>

            <div className="rounded-[1.4rem] border border-white/6 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-brass-100/50">Detalhes Taticos</p>
              <div className="mt-3 grid gap-2">
                {(card.details ?? []).map((detail) => (
                  <div key={detail} className="rounded-[0.95rem] border border-brass-100/10 bg-black/20 px-3 py-2 text-sm leading-relaxed text-brass-100/75">
                    {detail}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-white/6 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-brass-100/50">Atributos</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(card.attributes ?? []).map((attribute) => (
                  <span key={attribute} className="rounded-full border border-brass-100/10 bg-black/30 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-brass-50">
                    {attribute}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
