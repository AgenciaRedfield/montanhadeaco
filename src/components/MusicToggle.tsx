import { useGameStore } from "@/store/gameStore";

export const MusicToggle = () => {
  const enabled = useGameStore((state) => state.settings.musicEnabled);
  const toggleMusic = useGameStore((state) => state.toggleMusic);
  const unlockMusic = useGameStore((state) => state.unlockMusic);

  return (
    <button
      type="button"
      onClick={() => {
        unlockMusic();
        toggleMusic();
      }}
      className="rounded-full border border-brass-100/12 bg-black/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-brass-50 backdrop-blur-xl"
    >
      {enabled ? "Musica On" : "Musica Off"}
    </button>
  );
};