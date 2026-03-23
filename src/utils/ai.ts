import type { PlayerId, RuntimeCard } from "@/types/card";
import type { CombatTarget, GameState } from "@/types/game";
import { canDirectAttack, canUnitAttack, lethalAgainstPlayer } from "@/utils/combat";

export type AIAction =
  | { type: "play"; cardId: string }
  | { type: "attack"; attackerId: string; target: CombatTarget }
  | { type: "endTurn" };

const scoreCard = (state: GameState, card: RuntimeCard) => {
  let score = card.currentAttack + card.currentDefense + (card.energyCost * 0.6);
  if (state.enemy.structuralIntegrity <= 12 && ["healAlly", "repair", "healAll", "shield", "reduceDamage"].includes(card.ability)) score += 5;
  if (["steamBurst", "consumeOverpressure", "deathExplosion"].includes(card.ability)) score += 3;
  if (state.enemy.overpressure > 0 && ["overpressureGrowth", "consumeOverpressure"].includes(card.ability)) score += 4;
  return score;
};

export const chooseEnemyPlaySequence = (state: GameState): AIAction[] => {
  const actions: AIAction[] = [];
  const sorted = [...state.enemy.hand].sort((a, b) => scoreCard(state, b) - scoreCard(state, a));
  let remainingSteam = state.enemy.steamPressure;
  let overpressureBudget = Math.max(0, 2 - state.enemy.overpressure);
  let boardCount = state.enemy.board.length;

  for (const card of sorted) {
    if (boardCount >= 5) break;
    const deficit = Math.max(0, card.energyCost - remainingSteam);
    if (deficit > overpressureBudget) continue;
    remainingSteam = Math.max(0, remainingSteam - card.energyCost);
    overpressureBudget -= deficit;
    boardCount += 1;
    actions.push({ type: "play", cardId: card.instanceId });
  }

  return actions;
};

const chooseAttackTarget = (state: GameState, attacker: RuntimeCard): CombatTarget => {
  const taunts = state.player.board.filter((unit) => unit.statusEffects.some((status) => status.key === "taunt" && status.value > 0));
  const targets = taunts.length > 0 ? taunts : state.player.board;
  const lethalOnPlayer = attacker.currentAttack >= state.player.structuralIntegrity;

  if ((lethalOnPlayer || lethalAgainstPlayer(state.enemy.board.filter(canUnitAttack), state.player)) && canDirectAttack(state.player.board)) {
    return { type: "player", id: state.player.id, owner: "player" };
  }

  if (targets.length === 0 && canDirectAttack(state.player.board)) {
    return { type: "player", id: state.player.id, owner: "player" };
  }

  const bestTrade = [...targets].sort((a, b) => (a.currentDefense - attacker.currentAttack) - (b.currentDefense - attacker.currentAttack))[0];
  return { type: "card", id: bestTrade.instanceId, owner: "player" };
};

export const chooseEnemyAttackSequence = (state: GameState): AIAction[] => {
  return [...state.enemy.board]
    .filter(canUnitAttack)
    .sort((a, b) => b.currentAttack - a.currentAttack)
    .map((attacker) => ({
      type: "attack" as const,
      attackerId: attacker.instanceId,
      target: chooseAttackTarget(state, attacker),
    }));
};

export const buildEnemyPlan = (state: GameState): AIAction[] => {
  return [...chooseEnemyPlaySequence(state), ...chooseEnemyAttackSequence(state), { type: "endTurn" }];
};