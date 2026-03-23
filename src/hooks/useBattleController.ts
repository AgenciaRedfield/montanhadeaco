import { useGameStore } from "@/store/gameStore";
import type { CombatTarget } from "@/types/game";

const toTurn = (activePlayer: "player" | "enemy", phase: string) => {
  if (phase === "idle") return "idle" as const;
  if (phase === "enemyTurn" || activePlayer === "enemy") return "enemy" as const;
  if (phase === "endPhase" || phase === "startTurn" || phase === "drawPhase" || phase === "resourcePhase") return "resolving" as const;
  return "player" as const;
};

export const useBattleController = () => {
  const selectedAttackerId = useGameStore((state) => state.battle.selectedAttackerId);
  const activePlayer = useGameStore((state) => state.activePlayer);
  const phase = useGameStore((state) => state.phase);
  const selectAttacker = useGameStore((state) => state.selectAttacker);
  const attack = useGameStore((state) => state.attack);
  const playerBoard = useGameStore((state) => state.player.board);
  const turn = toTurn(activePlayer, phase);

  const onSelectAttacker = (cardId: string) => {
    if (turn !== "player") return;
    const card = playerBoard.find((entry) => entry.instanceId === cardId || entry.id === cardId);
    if (!card || card.hasActed || !card.canAttack) return;
    selectAttacker(card.instanceId === selectedAttackerId ? null : card.instanceId);
  };

  const onTarget = (target: CombatTarget) => {
    if (!selectedAttackerId || turn !== "player") return;
    attack(selectedAttackerId, target);
    selectAttacker(null);
  };

  return {
    selectedAttackerId,
    turn,
    onSelectAttacker,
    onTarget,
  };
};