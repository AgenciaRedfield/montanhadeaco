import { useBattleStore } from "@/store/battleStore";
import { useGameStore } from "@/store/gameStore";
import { usePlayerStore } from "@/store/playerStore";
import type { CombatTarget } from "@/types/game";

export const useBattleController = () => {
  const selectedAttackerId = useBattleStore((state) => state.selectedAttackerId);
  const turn = useBattleStore((state) => state.turn);
  const selectAttacker = useBattleStore((state) => state.selectAttacker);
  const attack = useGameStore((state) => state.attack);
  const playerBoard = usePlayerStore((state) => state.board);

  const onSelectAttacker = (cardId: string) => {
    if (turn !== "player") return;
    const card = playerBoard.find((entry) => entry.id === cardId);
    if (!card || card.hasActed) return;
    selectAttacker(cardId === selectedAttackerId ? null : cardId);
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
