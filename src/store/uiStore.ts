import { create } from "zustand";
import type { GameScreen } from "@/types/game";

interface UiStore {
  screen: GameScreen;
  busy: boolean;
  status: string;
  setScreen: (screen: GameScreen) => void;
  setBusy: (busy: boolean) => void;
  setStatus: (status: string) => void;
  reset: () => void;
}

const initialState = {
  screen: "menu" as GameScreen,
  busy: false,
  status: "Boilers await ignition.",
};

export const useUiStore = create<UiStore>((set) => ({
  ...initialState,
  setScreen: (screen) => set({ screen }),
  setBusy: (busy) => set({ busy }),
  setStatus: (status) => set({ status }),
  reset: () => set(initialState),
}));
