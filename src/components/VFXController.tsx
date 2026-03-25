import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

type VFXType = "damage" | "heal" | "shield" | "steam" | "shake";

interface VFXEvent {
  id: string;
  type: VFXType;
  value?: string;
  targetName?: string;
  x?: number;
  y?: number;
}

export const VFXController = () => {
  const logs = useGameStore((state) => state.battle.logs);
  const [events, setEvents] = useState<VFXEvent[]>([]);
  const lastLogRef = useRef<string | null>(null);

  useEffect(() => {
    const latest = logs[0];
    if (!latest || latest === lastLogRef.current) return;
    lastLogRef.current = latest;

    const newEvents: VFXEvent[] = [];

    // ── PARSER DE LOGS PARA VFX ──
    
    // Dano Estrutural (Jogador/Inimigo)
    const structuralDamage = latest.match(/(.*) sofre (\d+) de dano estrutural/);
    if (structuralDamage) {
      newEvents.push({
        id: Math.random().toString(),
        type: "damage",
        value: `-${structuralDamage[2]}`,
        targetName: structuralDamage[1],
      });
      newEvents.push({ id: "shake-" + Math.random(), type: "shake" });
    }

    // Dano em Unidade
    const unitDamage = latest.match(/(.*) sofre (\d+) de dano/);
    if (unitDamage && !latest.includes("estrutural")) {
      newEvents.push({
        id: Math.random().toString(),
        type: "damage",
        value: `-${unitDamage[2]}`,
        targetName: unitDamage[1],
      });
    }

    // Cura
    const heal = latest.match(/(.*) recupera (\d+) de/);
    if (heal) {
      newEvents.push({
        id: Math.random().toString(),
        type: "heal",
        value: `+${heal[2]}`,
        targetName: heal[1],
      });
    }

    // Escudo
    const shield = latest.match(/(.*) recebe (\d+) de escudo/);
    if (shield) {
      newEvents.push({
        id: Math.random().toString(),
        type: "shield",
        value: `+${shield[2]}`,
        targetName: shield[1],
      });
    }

    // Mobilização (Vapor)
    if (latest.includes("mobiliza")) {
      newEvents.push({ id: "steam-" + Math.random(), type: "steam" });
    }

    if (newEvents.length > 0) {
      setEvents((prev) => [...prev, ...newEvents]);
      // Limpar eventos após animação
      newEvents.forEach(ev => {
        setTimeout(() => {
          setEvents(current => current.filter(e => e.id !== ev.id));
        }, 2000);
      });
    }
  }, [logs]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <AnimatePresence>
        {events.map((ev) => {
          if (ev.type === "shake") return null; // Shake é tratado no CSS/BattleScreen
          
          if (ev.type === "steam") {
            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 100, scale: 0.5 }}
                animate={{ opacity: [0, 0.6, 0], y: -300, scale: [1, 2, 3], x: Math.random() * 200 - 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 text-5xl opacity-20 filter blur-xl"
              >
                💨
              </motion.div>
            );
          }

          const colors = {
            damage: "text-red-500 shadow-red-900/50",
            heal: "text-emerald-400 shadow-emerald-900/50",
            shield: "text-sky-400 shadow-sky-900/50",
          };

          // Para números flutuantes, vamos espalhar um pouco se não tivermos a posição exata
          // Idealmente as cartas passariam sua posição, mas por enquanto vamos voar do centro
          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], y: -150, scale: [1, 1.5, 1.2], x: Math.random() * 100 - 50 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "backOut" }}
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-5xl font-bold italic ${colors[ev.type as keyof typeof colors]} drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]`}
              style={{ letterSpacing: "-0.05em" }}
            >
              {ev.value}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Hook para detectar tremor de tela
export const useScreenShake = () => {
  const logs = useGameStore((state) => state.battle.logs);
  const [shaking, setShaking] = useState(false);
  const lastLogRef = useRef<string | null>(null);

  useEffect(() => {
    const latest = logs[0];
    if (!latest || latest === lastLogRef.current) return;
    lastLogRef.current = latest;

    if (latest.includes("sofre") && latest.includes("estrutural") || latest.includes("removida") || latest.includes("atinge diretamente")) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 400);
      return () => clearTimeout(timer);
    }
  }, [logs]);

  return shaking;
};
