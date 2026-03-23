import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

export const AmbientAudio = () => {
  const enabled = useGameStore((state) => state.settings.musicEnabled);
  const unlocked = useGameStore((state) => state.settings.musicUnlocked);
  const volume = useGameStore((state) => state.settings.musicVolume);
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!unlocked || !enabled) {
      if (gainRef.current && contextRef.current) {
        gainRef.current.gain.setTargetAtTime(0, contextRef.current.currentTime, 0.2);
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!contextRef.current) {
      const context = new AudioContextClass();
      const master = context.createGain();
      const oscillator = context.createOscillator();
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      const filter = context.createBiquadFilter();

      oscillator.type = "sawtooth";
      oscillator.frequency.value = 68;
      lfo.type = "sine";
      lfo.frequency.value = 0.08;
      lfoGain.gain.value = 8;
      filter.type = "lowpass";
      filter.frequency.value = 420;
      master.gain.value = 0;

      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      oscillator.connect(filter);
      filter.connect(master);
      master.connect(context.destination);

      oscillator.start();
      lfo.start();

      contextRef.current = context;
      gainRef.current = master;
      oscRef.current = oscillator;
      lfoRef.current = lfo;
      lfoGainRef.current = lfoGain;
    }

    const context = contextRef.current;
    const gain = gainRef.current;
    if (!context || !gain) return;

    void context.resume();
    gain.gain.setTargetAtTime(volume * 0.08, context.currentTime, 0.25);
  }, [enabled, unlocked, volume]);

  useEffect(() => {
    return () => {
      oscRef.current?.stop();
      lfoRef.current?.stop();
      contextRef.current?.close();
    };
  }, []);

  return null;
};