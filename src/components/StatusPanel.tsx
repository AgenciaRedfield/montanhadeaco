import { motion } from "framer-motion";

interface StatusPanelProps {
  name: string;
  structuralIntegrity: number;
  steamPressure: number;
  maxSteamPressure: number;
  shield: number;
  side: "player" | "enemy";
}

export const StatusPanel = ({ name, structuralIntegrity, steamPressure, maxSteamPressure, shield, side }: StatusPanelProps) => {
  const steamCells = Array.from({ length: maxSteamPressure }, (_, index) => index < steamPressure);

  return (
    <motion.div initial={{ opacity: 0, y: side === "player" ? 20 : -20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-brass-700/40 bg-black/35 p-4 shadow-insetPanel backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-display text-3xl text-brass-50">{name}</p>
          <p className="text-xs uppercase tracking-[0.3em] text-brass-200/70">{side === "player" ? "Forge Master" : "Enemy Directive"}</p>
        </div>
        <div className="rounded-full border border-sky-200/15 bg-sky-400/10 px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.28em] text-sky-100/65">Shield</p>
          <p className="text-lg font-semibold text-sky-100">{shield}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-brass-100/70">
          <span>Structural Integrity</span>
          <span>{structuralIntegrity}/30</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-brass-950/70">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-copper-400 via-brass-300 to-amber-200" animate={{ width: `${(structuralIntegrity / 30) * 100}%` }} />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-brass-100/70">
          <span>Steam Pressure</span>
          <span>{steamPressure}/{maxSteamPressure}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {steamCells.map((filled, index) => (
            <span
              key={`${name}-steam-${index}`}
              className={`h-3 w-6 rounded-full border ${filled ? "border-brass-100/40 bg-gradient-to-r from-sky-300 to-brass-200 shadow-[0_0_12px_rgba(245,225,170,0.35)]" : "border-white/10 bg-white/5"}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
