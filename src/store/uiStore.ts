import { useGameStore } from "@/store/gameStore";
import type { GameScreen } from "@/types/game";

type UiView = {
  screen: GameScreen;
  busy: boolean;
  status: string;
  setScreen: (screen: GameScreen) => void;
  setBusy: (busy: boolean) => void;
  setStatus: (status: string) => void;
  reset: () => void;
};

export const useUiStore = <T = UiView>(selector?: (state: UiView) => T) => {
  return useGameStore((state) => {
    const uiState: UiView = {
      screen: state.ui.screen,
      busy: state.ui.busy,
      status: state.ui.status,
      setScreen: (screen) => useGameStore.getState().setScreen(screen),
      setBusy: (busy) => useGameStore.getState().setBusy(busy),
      setStatus: (status) => useGameStore.getState().setStatus(status),
      reset: () => useGameStore.getState().resetGame(),
    };
    return selector ? selector(uiState) : (uiState as T);
  });
};