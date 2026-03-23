import type { RuntimeCard } from "@/types/card";
import type { PlayerState } from "@/types/game";
import { getStatusValue } from "@/utils/gameHelpers";

export const getTauntUnits = (board: RuntimeCard[]) => board.filter((card) => getStatusValue(card, "taunt") > 0);

export const canDirectAttack = (board: RuntimeCard[]) => getTauntUnits(board).length === 0;

export const getDamageReduction = (card: RuntimeCard) => getStatusValue(card, "damageReduction");
export const hasDodge = (card: RuntimeCard) => getStatusValue(card, "dodge") > 0;
export const getShield = (card: RuntimeCard) => getStatusValue(card, "shield");
export const isStunned = (card: RuntimeCard) => getStatusValue(card, "stun") > 0;

export const estimateAttackDamage = (attacker: RuntimeCard) => Math.max(0, attacker.currentAttack);

export const canUnitAttack = (card: RuntimeCard) => card.canAttack && !card.hasActed && !card.summonSickness && !isStunned(card) && card.currentDefense > 0;

export const lethalAgainstPlayer = (board: RuntimeCard[], player: PlayerState) => board.reduce((total, unit) => total + unit.currentAttack, 0) >= player.structuralIntegrity;