import { motion } from "framer-motion";

interface ArenaModeModalProps {
  onChoosePvp: () => void;
  onChooseAi: () => void;
  onClose: () => void;
}

export const ArenaModeModal = ({ onChoosePvp, onChooseAi, onClose }: ArenaModeModalProps) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 p-4 sm:p-6 backdrop-blur-md">
      <motion.div initial={{ y: 18, scale: 0.96 }} animate={{ y: 0, scale: 1 }} className="w-full max-w-3xl rounded-[2.2rem] border border-brass-300/18 bg-[radial-gradient(circle_at_top,rgba(216,138,99,0.2),rgba(8,9,13,0.96)_68%)] p-6 sm:p-8 shadow-[0_20px_80px_rgba(187,131,48,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.45em] text-brass-100/55">Entrada da Arena</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl text-brass-50">Escolha o modo de batalha</h2>
            <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-brass-100/72">
              Defina se deseja enfrentar outro comandante na arena online ou testar sua forja contra a inteligencia mecanica da Montanha de Aco.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-brass-100/12 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-brass-50">
            Fechar
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <button type="button" onClick={onChoosePvp} className="rounded-[1.8rem] border border-brass-100/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.04),rgba(216,138,99,0.08))] p-5 text-left transition hover:border-copper-300/28 hover:bg-[linear-gradient(145deg,rgba(216,138,99,0.12),rgba(235,203,113,0.08))]">
            <p className="text-[10px] uppercase tracking-[0.34em] text-copper-200/68">Arena Online</p>
            <h3 className="mt-3 font-display text-3xl text-brass-50">PvP</h3>
            <p className="mt-3 text-sm leading-relaxed text-brass-100/70">
              Entre na forja competitiva para enfrentar outro jogador conectado e preparar a base das batalhas online da Montanha.
            </p>
          </button>

          <button type="button" onClick={onChooseAi} className="rounded-[1.8rem] border border-brass-100/14 bg-[linear-gradient(135deg,#d88a63_0%,#ebcb71_48%,#8d4326_100%)] p-5 text-left text-smoke-950 shadow-[0_14px_38px_rgba(216,138,99,0.22)] transition hover:scale-[1.01]">
            <p className="text-[10px] uppercase tracking-[0.34em] text-smoke-900/70">Escaramuca Tatica</p>
            <h3 className="mt-3 font-display text-3xl text-smoke-950">Contra IA</h3>
            <p className="mt-3 text-sm leading-relaxed text-smoke-950/82">
              Entre imediatamente na arena e enfrente o Automato Soberano em uma batalha local contra a inteligencia do jogo.
            </p>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
