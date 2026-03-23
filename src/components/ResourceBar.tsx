import { motion } from "framer-motion";

interface ResourceBarProps {
  label: string;
  value: number;
  max: number;
  tone?: "steam" | "integrity";
}

export const ResourceBar = ({ label, value, max, tone = "steam" }: ResourceBarProps) => {
  const width = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  const gradient = tone === "integrity" ? "from-copper-500 via-brass-300 to-amber-100" : "from-sky-400 via-cyan-200 to-brass-100";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-brass-100/65">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full border border-white/8 bg-black/40">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:18px_100%]" />
        <motion.div animate={{ width: `${width}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }} className={`relative h-full rounded-full bg-gradient-to-r ${gradient}`}>
          <div className="absolute inset-0 animate-ember bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.28),transparent_55%)]" />
        </motion.div>
      </div>
    </div>
  );
};