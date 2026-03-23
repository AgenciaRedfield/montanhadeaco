import { motion } from "framer-motion";

interface OverpressureGaugeProps {
  value: number;
  threshold?: number;
}

export const OverpressureGauge = ({ value, threshold = 5 }: OverpressureGaugeProps) => {
  const ratio = Math.min(100, (value / Math.max(threshold, 1)) * 100);
  const isDanger = value >= threshold;

  return (
    <div className="rounded-[1.5rem] border border-copper-500/20 bg-black/30 p-4 shadow-insetPanel">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.35em] text-copper-200/70">Overpressure</p>
        <p className={`font-semibold ${isDanger ? "text-red-300" : "text-copper-100"}`}>{value}</p>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full border border-copper-300/15 bg-smoke-900/85">
        <motion.div animate={{ width: `${ratio}%` }} className={`h-full rounded-full bg-gradient-to-r ${isDanger ? "from-red-700 via-copper-500 to-amber-300" : "from-copper-800 via-copper-500 to-brass-300"}`} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-brass-100/60">
        {isDanger ? "A caldeira esta instavel e pode romper a estrutura." : "Excesso de pressao pode alimentar cartas de engenharia."}
      </p>
    </div>
  );
};