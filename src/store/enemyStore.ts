import { useGameStore } from "@/store/gameStore";
import type { PlayerState } from "@/types/game";

export const useEnemyStore = <T = PlayerState>(selector?: (state: PlayerState) => T) => {
  if (selector) {
    return useGameStore((state) => selector(state.enemy));
  }
  return useGameStore((state) => state.enemy) as T;
};