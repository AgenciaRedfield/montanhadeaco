import { useGameStore } from "@/store/gameStore";
import type { PlayerId } from "@/types/card";
import type { TurnPhase } from "@/types/game";

type BattleView = {
  turn: TurnPhase;
  selectedAttackerId: string | null;
  winner: PlayerId | null;
  log: string[];
  selectAttacker: (cardId: string | null) => void;
  pushLog: (_entry: string) => void;
  setTurn: (_turn: TurnPhase) => void;
  reset: () => void;
};

const stableBattleView: BattleView = {
  turn: "idle",
  selectedAttackerId: null,
  winner: null,
  log: [],
  selectAttacker: (cardId) => useGameStore.getState().selectAttacker(cardId),
  pushLog: () => undefined,
  setTurn: () => undefined,
  reset: () => useGameStore.getState().resetGame(),
};

const toTurnPhase = (activePlayer: "player" | "enemy", phase: string): TurnPhase => {
  if (phase === "idle") return "idle";
  if (phase === "enemyTurn" || activePlayer === "enemy") return "enemy";
  if (phase === "endPhase" || phase === "startTurn" || phase === "drawPhase" || phase === "resourcePhase") return "resolving";
  return "player";
};

export const useBattleStore = <T = BattleView>(selector?: (state: BattleView) => T) => {
  return useGameStore((state) => {
    stableBattleView.turn = toTurnPhase(state.activePlayer, state.phase);
    stableBattleView.selectedAttackerId = state.battle.selectedAttackerId;
    stableBattleView.winner = state.battle.winner;
    stableBattleView.log = state.battle.logs;
    return selector ? selector(stableBattleView) : (stableBattleView as T);
  });
};