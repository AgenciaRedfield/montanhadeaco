import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";

interface VictoryModalProps {
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const VictoryModal = ({ onPlayAgain, onBackToMenu }: VictoryModalProps) => {
  const profile = useGameStore((state) => state.profile);
  const player = useGameStore((state) => state.player);
  
  // Lógica simples de medalhas baseada no estado final
  const medals = [
    { id: "victory", label: "Vitória Coletada", icon: "🏆", desc: "Missão Finalizada" },
    ...(player.structuralIntegrity >= 25 ? [{ id: "flawless", label: "Indestrutível", icon: "💎", desc: "Terminou com HP Alto" }] : []),
    ...(profile.victories % 5 === 0 ? [{ id: "veteran", label: "Veterano", icon: "🎖️", desc: "Marcos de Conquista" }] : []),
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ y: 40, scale: 0.9, rotateX: 20 }} 
        animate={{ y: 0, scale: 1, rotateX: 0 }} 
        className="w-full max-w-3xl rounded-[3rem] border border-emerald-500/20 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.15),rgba(8,9,13,0.98)_70%)] p-12 text-center shadow-[0_40px_120px_rgba(0,0,0,0.8),0_0_60px_rgba(16,185,129,0.1)]"
      >
        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/10 text-6xl shadow-emerald"
          >
            🏆
          </motion.div>
          
          <p className="mt-8 text-[11px] uppercase tracking-[0.6em] text-emerald-400 font-bold">Relatório de Operação</p>
          <h2 className="mt-4 font-display text-7xl text-brass-50 italic tracking-tighter uppercase">Vitória Épica</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-brass-100/60 uppercase tracking-widest font-medium">
            O comando da Montanha de Aço foi restaurado. As engrenagens giram em sua honra.
          </p>

          <div className="mt-12 w-full grid gap-6 sm:grid-cols-3">
             <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <p className="text-[10px] uppercase tracking-widest text-brass-100/40">Créditos de Forja</p>
                <p className="mt-2 text-3xl font-bold text-emerald-400">+35 🪙</p>
             </div>
             <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <p className="text-[10px] uppercase tracking-widest text-brass-100/40">Exp. Comandante</p>
                <p className="mt-2 text-3xl font-bold text-sky-400">+100 XP</p>
             </div>
             <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <p className="text-[10px] uppercase tracking-widest text-brass-100/40">Nível Atual</p>
                <p className="mt-2 text-3xl font-bold text-brass-50">Lvl {profile.level}</p>
             </div>
          </div>

          <div className="mt-10 w-full space-y-4">
             <p className="text-[10px] uppercase tracking-[0.4em] text-brass-100/30 text-left">Medalhas de Honra</p>
             <div className="flex flex-wrap gap-3">
                {medals.map((m, idx) => (
                  <motion.div 
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="flex items-center gap-3 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2"
                  >
                    <span className="text-xl">{m.icon}</span>
                    <div className="text-left">
                       <p className="text-[9px] font-bold text-brass-50 uppercase leading-none">{m.label}</p>
                       <p className="text-[8px] text-emerald-400/60 uppercase leading-none mt-1">{m.desc}</p>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>

          <div className="mt-14 flex flex-col gap-4 w-full sm:flex-row sm:justify-center">
            <button 
              type="button" 
              onClick={onPlayAgain} 
              className="group relative flex-1 overflow-hidden rounded-[1.5rem] border border-brass-100/30 bg-[linear-gradient(135deg,#d88a63_0%,#ebcb71_48%,#8d4326_100%)] px-8 py-5 text-sm font-bold uppercase tracking-[0.4em] text-smoke-900 shadow-xl transition-all hover:scale-105"
            >
              Iniciar Nova Missão
            </button>
            <button 
              type="button" 
              onClick={onBackToMenu} 
              className="flex-1 rounded-[1.5rem] border border-brass-100/15 bg-white/5 px-8 py-5 text-sm font-bold uppercase tracking-[0.35em] text-brass-100 backdrop-blur-md transition hover:bg-white/10"
            >
              Base de Comando
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};