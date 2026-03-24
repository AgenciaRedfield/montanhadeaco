import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { TurnPhase } from "@/types/game";
import { useGameStore } from "@/store/gameStore";

type FlashTone = "summon" | "attack" | "direct" | "destroy" | "turn" | "victory";

type Flash = {
  id: number;
  tone: FlashTone;
};

const toneStyles: Record<FlashTone, { glow: string; ring: string }> = {
  summon: { glow: "from-cyan-300/25 via-sky-300/15 to-transparent", ring: "border-cyan-200/35" },
  attack: { glow: "from-orange-300/28 via-red-400/18 to-transparent", ring: "border-orange-200/35" },
  direct: { glow: "from-red-300/32 via-rose-500/18 to-transparent", ring: "border-red-200/40" },
  destroy: { glow: "from-zinc-100/18 via-stone-500/14 to-transparent", ring: "border-stone-200/30" },
  turn: { glow: "from-amber-200/24 via-yellow-300/12 to-transparent", ring: "border-amber-100/30" },
  victory: { glow: "from-emerald-200/24 via-amber-200/16 to-transparent", ring: "border-emerald-100/35" },
};

const getAudioContextClass = () => window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

const parseTone = (entry: string | null | undefined): FlashTone | null => {
  if (!entry) return null;
  if (entry.includes("atinge diretamente")) return "direct";
  if (entry.includes("ataca")) return "attack";
  if (entry.includes("mobiliza")) return "summon";
  if (entry.includes("removida")) return "destroy";
  return null;
};

const playTone = (context: AudioContext, tone: FlashTone, volume: number) => {
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  const settings: Record<FlashTone, { type: OscillatorType; frequency: number; frequencyEnd: number; duration: number; gain: number; filter: number }> = {
    summon: { type: "triangle", frequency: 320, frequencyEnd: 520, duration: 0.22, gain: 0.05, filter: 1200 },
    attack: { type: "sawtooth", frequency: 180, frequencyEnd: 110, duration: 0.16, gain: 0.055, filter: 980 },
    direct: { type: "square", frequency: 150, frequencyEnd: 90, duration: 0.22, gain: 0.065, filter: 820 },
    destroy: { type: "triangle", frequency: 210, frequencyEnd: 70, duration: 0.28, gain: 0.045, filter: 540 },
    turn: { type: "sine", frequency: 420, frequencyEnd: 520, duration: 0.16, gain: 0.03, filter: 1500 },
    victory: { type: "triangle", frequency: 420, frequencyEnd: 640, duration: 0.45, gain: 0.05, filter: 1400 },
  };

  const selected = settings[tone];
  oscillator.type = selected.type;
  oscillator.frequency.setValueAtTime(selected.frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(60, selected.frequencyEnd), now + selected.duration);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(selected.filter, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, selected.gain * Math.max(0.2, volume)), now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + selected.duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + selected.duration + 0.03);
};

interface BattleFeedbackProps {
  latestEntry?: string;
  selectedAttackerId: string | null;
  turn: TurnPhase;
  winner: string | null;
}

export const BattleFeedback = ({ latestEntry, selectedAttackerId, turn, winner }: BattleFeedbackProps) => {
  const enabled = useGameStore((state) => state.settings.musicEnabled);
  const unlocked = useGameStore((state) => state.settings.musicUnlocked);
  const volume = useGameStore((state) => state.settings.musicVolume);
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastEntryRef = useRef<string | undefined>(undefined);
  const lastTurnRef = useRef<TurnPhase>(turn);
  const lastWinnerRef = useRef<string | null>(winner);
  const lastSelectionRef = useRef<string | null>(selectedAttackerId);

  const pushFlash = (tone: FlashTone) => {
    const flash = { id: Date.now() + Math.random(), tone };
    setFlashes((current) => [...current, flash]);
    window.setTimeout(() => {
      setFlashes((current) => current.filter((entry) => entry.id !== flash.id));
    }, 520);
  };

  const ensureAudio = () => {
    if (!enabled || !unlocked) return null;
    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }
    void audioContextRef.current.resume();
    return audioContextRef.current;
  };

  useEffect(() => {
    if (selectedAttackerId && lastSelectionRef.current !== selectedAttackerId) {
      pushFlash("turn");
      const context = ensureAudio();
      if (context) playTone(context, "turn", volume * 0.7);
    }
    lastSelectionRef.current = selectedAttackerId;
  }, [selectedAttackerId, volume, enabled, unlocked]);

  useEffect(() => {
    if (turn !== lastTurnRef.current && turn !== "idle") {
      pushFlash("turn");
      const context = ensureAudio();
      if (context) playTone(context, "turn", volume * 0.75);
      lastTurnRef.current = turn;
    }
  }, [turn, volume, enabled, unlocked]);

  useEffect(() => {
    if (winner && winner !== lastWinnerRef.current) {
      pushFlash("victory");
      const context = ensureAudio();
      if (context) playTone(context, "victory", volume);
    }
    lastWinnerRef.current = winner;
  }, [winner, volume, enabled, unlocked]);

  useEffect(() => {
    if (!latestEntry || latestEntry === lastEntryRef.current) return;
    const tone = parseTone(latestEntry);
    if (!tone) {
      lastEntryRef.current = latestEntry;
      return;
    }
    pushFlash(tone);
    const context = ensureAudio();
    if (context) playTone(context, tone, volume);
    lastEntryRef.current = latestEntry;
  }, [latestEntry, volume, enabled, unlocked]);

  useEffect(() => {
    return () => {
      void audioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
      <AnimatePresence>
        {flashes.map((flash) => {
          const style = toneStyles[flash.tone];
          return (
            <motion.div key={flash.id} initial={{ opacity: 0, scale: 0.72 }} animate={{ opacity: 1, scale: 1.08 }} exit={{ opacity: 0, scale: 1.22 }} transition={{ duration: 0.45, ease: "easeOut" }} className="absolute inset-0 flex items-center justify-center">
              <div className={`h-32 w-32 rounded-full border ${style.ring} bg-gradient-to-b ${style.glow} blur-[1px]`} />
              <div className={`absolute h-56 w-56 rounded-full bg-gradient-to-b ${style.glow} blur-2xl`} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
