import type { PlayerId, RuntimeCard, StatusEffect } from "@/types/card";
import type { GameState } from "@/types/game";
import { findCard, getStatusValue, MAX_STEAM_PRESSURE, OVERPRESSURE_DANGER_THRESHOLD, pushLog, upsertStatus } from "@/utils/gameHelpers";

export type MutationContext = {
  state: GameState;
  actorId: PlayerId;
  opponentId: PlayerId;
  sourceCard?: RuntimeCard;
};

const getActor = (state: GameState, playerId: PlayerId) => (playerId === "player" ? state.player : state.enemy);
const setActor = (state: GameState, playerId: PlayerId, updater: (player: GameState["player"]) => GameState["player"]) => {
  if (playerId === "player") {
    state.player = updater(state.player);
  } else {
    state.enemy = updater(state.enemy);
  }
};

const log = (state: GameState, entry: string) => {
  state.battle.logs = pushLog(state.battle.logs, entry);
};

export const addStatusToUnit = (state: GameState, ownerId: PlayerId, unitId: string, status: StatusEffect) => {
  setActor(state, ownerId, (actor) => ({
    ...actor,
    board: actor.board.map((card) => (card.instanceId === unitId ? upsertStatus(card, status) : card)),
  }));
};

export const modifyUnit = (state: GameState, ownerId: PlayerId, unitId: string, updater: (card: RuntimeCard) => RuntimeCard) => {
  setActor(state, ownerId, (actor) => ({
    ...actor,
    board: actor.board.map((card) => (card.instanceId === unitId ? updater(card) : card)),
  }));
};

export const dealDamageToPlayer = (state: GameState, playerId: PlayerId, amount: number, reason: string) => {
  if (amount <= 0) return;
  setActor(state, playerId, (actor) => {
    const absorbed = Math.min(actor.shield, amount);
    const finalDamage = Math.max(0, amount - absorbed);
    return {
      ...actor,
      shield: Math.max(0, actor.shield - amount),
      structuralIntegrity: Math.max(0, actor.structuralIntegrity - finalDamage),
    };
  });
  log(state, `${getActor(state, playerId).name} sofre ${amount} de dano estrutural por ${reason}.`);
};

export const healPlayerBy = (state: GameState, playerId: PlayerId, amount: number, reason: string) => {
  if (amount <= 0) return;
  setActor(state, playerId, (actor) => ({ ...actor, structuralIntegrity: Math.min(actor.maxStructuralIntegrity, actor.structuralIntegrity + amount) }));
  log(state, `${getActor(state, playerId).name} recupera ${amount} de Integridade Estrutural por ${reason}.`);
};

export const damageUnit = (state: GameState, ownerId: PlayerId, unitId: string, amount: number, reason: string) => {
  const owner = getActor(state, ownerId);
  const unit = findCard(owner.board, unitId);
  if (!unit) return;

  if (getStatusValue(unit, "dodge") > 0) {
    modifyUnit(state, ownerId, unitId, (card) => ({
      ...card,
      statusEffects: card.statusEffects.filter((status) => status.key !== "dodge"),
    }));
    log(state, `${unit.name} evita o ataque com esquiva.`);
    return;
  }

  const reduction = getStatusValue(unit, "damageReduction");
  const mitigated = Math.max(0, amount - reduction);
  const absorbed = Math.min(unit.shield, mitigated);
  const finalDamage = Math.max(0, mitigated - absorbed);

  modifyUnit(state, ownerId, unitId, (card) => ({
    ...card,
    currentDefense: card.currentDefense - finalDamage,
    shield: Math.max(0, card.shield - absorbed),
    statusEffects: card.statusEffects
      .map((status) => (status.key === "shield" ? { ...status, value: Math.max(0, status.value - absorbed) } : status))
      .filter((status) => status.key !== "shield" || status.value > 0),
  }));

  log(state, `${unit.name} sofre ${finalDamage} de dano por ${reason}.`);
};

export const healUnitBy = (state: GameState, ownerId: PlayerId, unitId: string, amount: number, reason: string) => {
  modifyUnit(state, ownerId, unitId, (card) => ({ ...card, currentDefense: Math.min(card.maxDefense, card.currentDefense + amount) }));
  const unit = findCard(getActor(state, ownerId).board, unitId);
  if (unit) log(state, `${unit.name} recupera ${amount} de defesa por ${reason}.`);
};

export const buffUnitAttack = (state: GameState, ownerId: PlayerId, unitId: string, amount: number, duration: number | null, reason: string) => {
  addStatusToUnit(state, ownerId, unitId, { key: "bonusAttack", value: amount, duration, source: reason });
  const unit = findCard(getActor(state, ownerId).board, unitId);
  if (unit) log(state, `${unit.name} recebe +${amount} de ataque.`);
};

export const buffUnitDefense = (state: GameState, ownerId: PlayerId, unitId: string, amount: number, duration: number | null, reason: string) => {
  addStatusToUnit(state, ownerId, unitId, { key: "bonusDefense", value: amount, duration, source: reason });
  modifyUnit(state, ownerId, unitId, (card) => ({ ...card, currentDefense: card.currentDefense + amount, maxDefense: card.maxDefense + amount }));
  const unit = findCard(getActor(state, ownerId).board, unitId);
  if (unit) log(state, `${unit.name} recebe +${amount} de defesa.`);
};

export const addShieldToUnit = (state: GameState, ownerId: PlayerId, unitId: string, amount: number, reason: string) => {
  modifyUnit(state, ownerId, unitId, (card) => ({ ...card, shield: card.shield + amount }));
  addStatusToUnit(state, ownerId, unitId, { key: "shield", value: amount, duration: null, source: reason });
  const unit = findCard(getActor(state, ownerId).board, unitId);
  if (unit) log(state, `${unit.name} recebe ${amount} de escudo.`);
};

export const addOverpressure = (state: GameState, playerId: PlayerId, amount: number) => {
  if (amount <= 0) return;
  setActor(state, playerId, (actor) => ({ ...actor, overpressure: actor.overpressure + amount }));
  log(state, `${getActor(state, playerId).name} acumula ${amount} de Overpressure.`);
};

export const consumeOverpressure = (state: GameState, playerId: PlayerId, amount: number) => {
  const actor = getActor(state, playerId);
  const consumed = Math.min(actor.overpressure, amount);
  setActor(state, playerId, (current) => ({ ...current, overpressure: current.overpressure - consumed }));
  if (consumed > 0) log(state, `${actor.name} consome ${consumed} de Overpressure.`);
  return consumed;
};

export const gainSteam = (state: GameState, playerId: PlayerId, amount: number) => {
  if (amount <= 0) return;
  setActor(state, playerId, (actor) => ({ ...actor, steamPressure: Math.min(MAX_STEAM_PRESSURE, actor.steamPressure + amount) }));
};

export const reduceSteam = (state: GameState, playerId: PlayerId, amount: number) => {
  if (amount <= 0) return;
  setActor(state, playerId, (actor) => ({ ...actor, steamPressure: Math.max(0, actor.steamPressure - amount) }));
};

export const queueDelayedStructuralDamage = (state: GameState, playerId: PlayerId, amount: number, source: string) => {
  setActor(state, playerId, (actor) => ({ ...actor, pendingStructuralDamage: [...actor.pendingStructuralDamage, { amount, source }] }));
};

export const resolvePendingStructuralDamage = (state: GameState, playerId: PlayerId) => {
  const actor = getActor(state, playerId);
  if (actor.pendingStructuralDamage.length === 0) return;
  actor.pendingStructuralDamage.forEach((entry) => dealDamageToPlayer(state, playerId, entry.amount, entry.source));
  setActor(state, playerId, (current) => ({ ...current, pendingStructuralDamage: [] }));
};

export const resolveOverpressurePenalty = (state: GameState, playerId: PlayerId) => {
  const actor = getActor(state, playerId);
  if (actor.overpressure < OVERPRESSURE_DANGER_THRESHOLD) return;
  const penalty = Math.floor(actor.overpressure / 2);
  dealDamageToPlayer(state, playerId, penalty, "sobrecarga da caldeira");
  setActor(state, playerId, (current) => ({ ...current, overpressure: Math.max(0, current.overpressure - 2) }));
};

const pickDamagedAlly = (state: GameState, playerId: PlayerId) => [...getActor(state, playerId).board].sort((a, b) => a.currentDefense - b.currentDefense)[0];
const pickEnemyFront = (state: GameState, playerId: PlayerId) => [...getActor(state, playerId === "player" ? "enemy" : "player").board].sort((a, b) => a.currentDefense - b.currentDefense)[0];

export const onPlayResolvers: Record<string, (context: MutationContext) => void> = {
  taunt: ({ state, actorId, sourceCard }) => {
    if (!sourceCard) return;
    addStatusToUnit(state, actorId, sourceCard.instanceId, { key: "taunt", value: 1, duration: null, source: sourceCard.name });
  },
  shield: ({ state, actorId, sourceCard }) => {
    if (!sourceCard) return;
    addShieldToUnit(state, actorId, sourceCard.instanceId, 2, sourceCard.name);
  },
  reduceDamage: ({ state, actorId, sourceCard }) => {
    if (!sourceCard) return;
    addStatusToUnit(state, actorId, sourceCard.instanceId, { key: "damageReduction", value: 1, duration: null, source: sourceCard.name });
  },
  passiveDamage: () => undefined,
  criticalEntry: ({ state, actorId, sourceCard }) => {
    if (!sourceCard) return;
    addStatusToUnit(state, actorId, sourceCard.instanceId, { key: "dodge", value: 1, duration: 1, source: sourceCard.name });
  },
  ignoreDefense: () => undefined,
  execute: () => undefined,
  steamSabotage: ({ state, opponentId }) => {
    reduceSteam(state, opponentId, 1);
  },
  dodge: ({ state, actorId, sourceCard }) => {
    if (!sourceCard) return;
    addStatusToUnit(state, actorId, sourceCard.instanceId, { key: "dodge", value: 1, duration: 1, source: sourceCard.name });
  },
  healAlly: ({ state, actorId }) => {
    const target = pickDamagedAlly(state, actorId);
    if (target) {
      healUnitBy(state, actorId, target.instanceId, 3, "Medico do Vapor");
    } else {
      healPlayerBy(state, actorId, 2, "Medico do Vapor");
    }
  },
  repair: ({ state, actorId }) => {
    const target = pickDamagedAlly(state, actorId);
    if (!target) return;
    healUnitBy(state, actorId, target.instanceId, 2, "Engenheira Restauradora");
    buffUnitDefense(state, actorId, target.instanceId, 1, null, "Engenheira Restauradora");
  },
  healAll: ({ state, actorId }) => {
    getActor(state, actorId).board.forEach((unit) => healUnitBy(state, actorId, unit.instanceId, 2, "Curandeira Industrial"));
    healPlayerBy(state, actorId, 2, "Curandeira Industrial");
  },
  energyBoost: ({ state, actorId }) => {
    gainSteam(state, actorId, 2);
  },
  quickRepair: ({ state, actorId }) => {
    const target = pickDamagedAlly(state, actorId);
    if (target) healUnitBy(state, actorId, target.instanceId, 2, "Tecnico de Campo");
  },
  consumeOverpressure: ({ state, actorId }) => {
    const consumed = consumeOverpressure(state, actorId, 3);
    if (consumed <= 0) return;
    getActor(state, actorId).board.forEach((unit) => {
      buffUnitAttack(state, actorId, unit.instanceId, consumed, 2, "Engenheiro Supremo");
      buffUnitDefense(state, actorId, unit.instanceId, consumed, 2, "Engenheiro Supremo");
    });
  },
  steamBurst: ({ state, opponentId }) => {
    dealDamageToPlayer(state, opponentId, 3, "Canhao Aether");
  },
  overpressureGrowth: ({ state, actorId, sourceCard }) => {
    if (!sourceCard) return;
    const bonus = consumeOverpressure(state, actorId, 2);
    if (bonus > 0) buffUnitAttack(state, actorId, sourceCard.instanceId, bonus * 2, null, "Automato Overclockado");
  },
  deathExplosion: () => undefined,
};

export const onAttackResolvers: Record<string, (context: MutationContext & { targetUnitId?: string; targetPlayerId?: PlayerId }) => number> = {
  criticalEntry: ({ state, sourceCard }) => {
    if (!sourceCard || sourceCard.attackCount > 0) return 0;
    log(state, `${sourceCard.name} acerta um golpe critico inicial.`);
    return 3;
  },
  ignoreDefense: ({ state, opponentId }) => {
    dealDamageToPlayer(state, opponentId, 2, "Duelista Aetherblade");
    return 0;
  },
  execute: ({ state, opponentId, targetUnitId }) => {
    if (!targetUnitId) return 0;
    const target = findCard(getActor(state, opponentId).board, targetUnitId);
    if (!target || target.currentDefense > 3) return 0;
    damageUnit(state, opponentId, target.instanceId, 99, "Executor Sombrio");
    return 0;
  },
  steamBurst: ({ state, opponentId, targetUnitId }) => {
    if (targetUnitId) damageUnit(state, opponentId, targetUnitId, 2, "rajada residual de vapor");
    return 0;
  },
};

export const onDeathResolvers: Record<string, (context: MutationContext) => void> = {
  quickRepair: ({ state, actorId }) => {
    healPlayerBy(state, actorId, 1, "Tecnico de Campo");
  },
  deathExplosion: ({ state, opponentId }) => {
    getActor(state, opponentId).board.forEach((unit) => damageUnit(state, opponentId, unit.instanceId, 3, "Nucleo Instavel"));
    dealDamageToPlayer(state, opponentId, 2, "Nucleo Instavel");
  },
};

export const passiveTickResolvers: Record<string, (context: MutationContext) => void> = {
  passiveDamage: ({ state, opponentId, sourceCard }) => {
    if (!sourceCard) return;
    const target = pickEnemyFront(state, sourceCard.ownerId);
    if (!target) {
      dealDamageToPlayer(state, opponentId, 1, sourceCard.name);
      return;
    }
    damageUnit(state, opponentId, target.instanceId, 1, sourceCard.name);
  },
  overpressureGrowth: ({ state, actorId, sourceCard }) => {
    if (!sourceCard) return;
    if (getActor(state, actorId).overpressure > 0) buffUnitAttack(state, actorId, sourceCard.instanceId, 1, 1, sourceCard.name);
  },
};

export const turnStartResolvers: Record<string, (context: MutationContext) => void> = {};