import { motion } from "framer-motion";

interface VictoryModalProps {
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const VictoryModal = ({ onPlayAgain, onBackToMenu }: VictoryModalProps) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-md">
      <motion.div initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} className="w-full max-w-2xl rounded-[2.5rem] border border-brass-300/20 bg-[radial-gradient(circle_at_top,rgba(235,203,113,0.18),rgba(8,9,13,0.96)_65%)] p-10 text-center shadow-[0_20px_80px_rgba(187,131,48,0.28)]">
        <p className="text-[11px] uppercase tracking-[0.45em] text-brass-100/55">Resultado da Forja</p>
        <h2 className="mt-4 font-display text-6xl text-brass-50">Vitoria</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-brass-100/72">A Montanha de Aco responde ao seu comando. O metal canta, e a pressao se curva diante da sua estrategia.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={onPlayAgain} className="rounded-[1.2rem] border border-brass-100/20 bg-[linear-gradient(135deg,#d88a63_0%,#ebcb71_48%,#8d4326_100%)] px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-smoke-900">Jogar Novamente</button>
          <button type="button" onClick={onBackToMenu} className="rounded-[1.2rem] border border-brass-100/15 bg-white/5 px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-brass-50">Voltar ao Menu</button>
        </div>
      </motion.div>
    </motion.div>
  );
};