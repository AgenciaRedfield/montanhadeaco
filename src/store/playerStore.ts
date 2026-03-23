import { useGameStore } from "@/store/gameStore";
import type { PlayerState } from "@/types/game";

export const usePlayerStore = <T = PlayerState>(selector?: (state: PlayerState) => T) => {
  if (selector) {
    return useGameStore((state) => selector(state.player));
  }
  return useGameStore((state) => state.player) as T;
};