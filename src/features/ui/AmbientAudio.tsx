import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

const getAudioContextClass = () => window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

export const AmbientAudio = () => {
  const enabled = useGameStore((state) => state.settings.musicEnabled);
  const unlocked = useGameStore((state) => state.settings.musicUnlocked);
  const volume = useGameStore((state) => state.settings.musicVolume);
  const unlockMusic = useGameStore((state) => state.unlockMusic);
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const padGainRef = useRef<GainNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const humOscRef = useRef<OscillatorNode | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseFilterRef = useRef<BiquadFilterNode | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const handleFirstGesture = () => {
      if (!enabled) return;
      if (!unlocked) unlockMusic();
      const AudioContextClass = getAudioContextClass();
      if (!AudioContextClass) return;
      if (!contextRef.current) {
        const context = new AudioContextClass();
        const master = context.createGain();
        const humOsc = context.createOscillator();
        const droneOsc = context.createOscillator();
        const humGain = context.createGain();
        const droneGain = context.createGain();
        const lfo = context.createOscillator();
        const lfoGain = context.createGain();
        const humFilter = context.createBiquadFilter();
        const droneFilter = context.createBiquadFilter();
        const noiseFilter = context.createBiquadFilter();
        const noiseGain = context.createGain();
        const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
        const channel = noiseBuffer.getChannelData(0);

        for (let index = 0; index < channel.length; index += 1) {
          channel[index] = (Math.random() * 2 - 1) * 0.26;
        }

        const noiseSource = context.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        humOsc.type = "triangle";
        humOsc.frequency.value = 62;
        droneOsc.type = "sine";
        droneOsc.frequency.value = 94;
        lfo.type = "sine";
        lfo.frequency.value = 0.07;
        lfoGain.gain.value = 10;

        humFilter.type = "lowpass";
        humFilter.frequency.value = 420;
        droneFilter.type = "lowpass";
        droneFilter.frequency.value = 260;
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.value = 860;
        noiseFilter.Q.value = 0.7;

        master.gain.value = 0;
        humGain.gain.value = 0.12;
        droneGain.gain.value = 0.05;
        noiseGain.gain.value = 0.016;

        lfo.connect(lfoGain);
        lfoGain.connect(humOsc.frequency);

        humOsc.connect(humFilter);
        humFilter.connect(humGain);
        humGain.connect(master);

        droneOsc.connect(droneFilter);
        droneFilter.connect(droneGain);
        droneGain.connect(master);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(master);

        master.connect(context.destination);

        humOsc.start();
        droneOsc.start();
        lfo.start();
        noiseSource.start();

        contextRef.current = context;
        masterRef.current = master;
        padGainRef.current = humGain;
        droneGainRef.current = droneGain;
        humOscRef.current = humOsc;
        droneOscRef.current = droneOsc;
        lfoRef.current = lfo;
        lfoGainRef.current = lfoGain;
        noiseSourceRef.current = noiseSource;
        noiseFilterRef.current = noiseFilter;
      }

      void contextRef.current?.resume();
      initializedRef.current = true;
    };

    window.addEventListener("pointerdown", handleFirstGesture, { passive: true });
    window.addEventListener("keydown", handleFirstGesture);

    return () => {
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
    };
  }, [enabled, unlockMusic, unlocked]);

  useEffect(() => {
    const context = contextRef.current;
    const master = masterRef.current;
    if (!context || !master) return;

    void context.resume();
    const targetVolume = enabled ? volume * 0.1 : 0;
    master.gain.setTargetAtTime(targetVolume, context.currentTime, 0.35);
  }, [enabled, volume, unlocked]);

  useEffect(() => {
    return () => {
      try { humOscRef.current?.stop(); } catch {}
      try { droneOscRef.current?.stop(); } catch {}
      try { lfoRef.current?.stop(); } catch {}
      try { noiseSourceRef.current?.stop(); } catch {}
      void contextRef.current?.close();
    };
  }, []);

  return null;
};
