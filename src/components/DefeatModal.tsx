import { motion } from "framer-motion";

interface DefeatModalProps {
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const DefeatModal = ({ onPlayAgain, onBackToMenu }: DefeatModalProps) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 p-6 backdrop-blur-md">
      <motion.div initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} className="w-full max-w-2xl rounded-[2.5rem] border border-red-400/15 bg-[radial-gradient(circle_at_top,rgba(127,29,29,0.2),rgba(8,9,13,0.96)_65%)] p-10 text-center shadow-[0_20px_80px_rgba(127,29,29,0.25)]">
        <p className="text-[11px] uppercase tracking-[0.45em] text-red-100/50">Resultado da Forja</p>
        <h2 className="mt-4 font-display text-6xl text-brass-50">Derrota</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-brass-100/72">O casco cedeu, os rebites falharam e o vapor fugiu da fornalha. Reacenda as caldeiras e tente outra vez.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={onPlayAgain} className="rounded-[1.2rem] border border-copper-200/20 bg-[linear-gradient(135deg,#be653d_0%,#d88a63_45%,#6b2413_100%)] px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-brass-50">Tentar Novamente</button>
          <button type="button" onClick={onBackToMenu} className="rounded-[1.2rem] border border-brass-100/15 bg-white/5 px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-brass-50">Voltar ao Menu</button>
        </div>
      </motion.div>
    </motion.div>
  );
};