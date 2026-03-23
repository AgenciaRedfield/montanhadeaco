import { motion } from "framer-motion";

interface ActionLogProps {
  entries: string[];
}

export const ActionLog = ({ entries }: ActionLogProps) => {
  return (
    <div className="rounded-[1.6rem] border border-brass-700/30 bg-black/30 p-3.5 shadow-insetPanel backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/50">Registro da Fundicao</p>
          <p className="font-display text-xl text-brass-50">Acao e Vapor</p>
        </div>
      </div>
      <div className="max-h-[18rem] space-y-2 overflow-y-auto pr-1">
        {entries.map((entry, index) => (
          <motion.div key={`${entry}-${index}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="rounded-[1rem] border border-white/6 bg-white/[0.03] px-3 py-2 text-xs leading-relaxed text-brass-50/82">
            {entry}
          </motion.div>
        ))}
      </div>
    </div>
  );
};