import { motion } from "framer-motion";
import type { TurnPhase } from "@/types/game";

interface TurnIndicatorProps {
  turn: TurnPhase;
  turnNumber: number;
}

export const TurnIndicator = ({ turn, turnNumber }: TurnIndicatorProps) => {
  const label = turn === "player" ? "Seu Turno" : turn === "enemy" ? "Turno Inimigo" : turn === "resolving" ? "Resolucao" : "Aguardando";

  return (
    <motion.div key={`${turn}-${turnNumber}`} initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative overflow-hidden rounded-[1.6rem] border border-brass-400/20 bg-black/35 px-5 py-4 shadow-copper">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(187,131,48,0.18),transparent_55%)]" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-brass-100/58">Ciclo da Forja</p>
          <p className="font-display text-[2rem] text-brass-50">{label}</p>
        </div>
        <div className="rounded-full border border-brass-200/15 bg-white/5 px-4 py-2.5 text-center">
          <p className="text-[9px] uppercase tracking-[0.28em] text-brass-100/55">Turno</p>
          <p className="text-lg font-semibold text-brass-50">{turnNumber}</p>
        </div>
      </div>
    </motion.div>
  );
};