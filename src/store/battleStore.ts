import { create } from "zustand";
import type { CombatTarget, Side, TurnPhase } from "@/types/game";

interface BattleStore {
  turn: TurnPhase;
  selectedAttackerId: string | null;
  targetHint: CombatTarget | null;
  winner: Side | null;
  log: string[];
  setTurn: (turn: TurnPhase) => void;
  selectAttacker: (cardId: string | null) => void;
  setTargetHint: (target: CombatTarget | null) => void;
  pushLog: (entry: string) => void;
  resetLog: () => void;
  setWinner: (winner: Side | null) => void;
  reset: () => void;
}

const initialState = {
  turn: "idle" as TurnPhase,
  selectedAttackerId: null,
  targetHint: null,
  winner: null as Side | null,
  log: [] as string[],
};

export const useBattleStore = create<BattleStore>((set) => ({
  ...initialState,
  setTurn: (turn) => set({ turn }),
  selectAttacker: (selectedAttackerId) => set({ selectedAttackerId }),
  setTargetHint: (targetHint) => set({ targetHint }),
  pushLog: (entry) => set((state) => ({ log: [entry, ...state.log].slice(0, 12) })),
  resetLog: () => set({ log: [] }),
  setWinner: (winner) => set({ winner }),
  reset: () => set(initialState),
}));
