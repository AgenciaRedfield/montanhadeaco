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

const stableUiView: UiView = {
  screen: "menu",
  busy: false,
  status: "",
  setScreen: (screen) => useGameStore.getState().setScreen(screen),
  setBusy: (busy) => useGameStore.getState().setBusy(busy),
  setStatus: (status) => useGameStore.getState().setStatus(status),
  reset: () => useGameStore.getState().resetGame(),
};

export const useUiStore = <T = UiView>(selector?: (state: UiView) => T) => {
  return useGameStore((state) => {
    stableUiView.screen = state.ui.screen;
    stableUiView.busy = state.ui.busy;
    stableUiView.status = state.ui.status;
    return selector ? selector(stableUiView) : (stableUiView as T);
  });
};