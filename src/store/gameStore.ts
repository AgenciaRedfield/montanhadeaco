import { create } from "zustand";
import { buildEnemyPlan } from "@/utils/ai";
import { canDirectAttack, canUnitAttack, estimateAttackDamage, getTauntUnits } from "@/utils/combat";
import {
  addOverpressure,
  buffUnitAttack,
  damageUnit,
  dealDamageToPlayer,
  gainSteam,
  healPlayerBy,
  healUnitBy,
  onAttackResolvers,
  onDeathResolvers,
  onPlayResolvers,
  passiveTickResolvers,
  resolveOverpressurePenalty,
  resolvePendingStructuralDamage,
} from "@/utils/abilityResolvers";
import {
  clonePlayer,
  createInitialGameState,
  findCard,
  MAX_BOARD_SIZE,
  MAX_HAND_SIZE,
  MAX_STEAM_PRESSURE,
  pushLog,
  removeCardFromZone,
  tickStatuses,
  upsertStatus,
} from "@/utils/gameHelpers";
import type { PlayerId, RuntimeCard } from "@/types/card";
import type { CombatTarget, GamePhase, GameState, PlayerState } from "@/types/game";

type GameStore = GameState & {
  startGame: () => void;
  resetGame: () => void;
  startTurn: (playerId: PlayerId) => void;
  drawCard: (playerId: PlayerId) => void;
  refillSteamPressure: (playerId: PlayerId) => void;
  increaseMaxSteamPressure: (playerId: PlayerId) => void;
  playCard: (playerId: PlayerId, cardId: string) => void;
  summonToBoard: (playerId: PlayerId, card: RuntimeCard) => void;
  attack: (attackerId: string, target: CombatTarget) => void;
  attackUnit: (attackerId: string, targetId: string) => void;
  attackPlayer: (attackerId: string, targetPlayerId: PlayerId) => void;
  applyDamageToUnit: (unitId: string, amount: number) => void;
  applyDamageToPlayer: (playerId: PlayerId, amount: number) => void;
  healUnit: (unitId: string, amount: number) => void;
  healPlayer: (playerId: PlayerId, amount: number) => void;
  applyShield: (unitId: string, amount: number) => void;
  destroyUnit: (unitId: string) => void;
  moveToGraveyard: (playerId: PlayerId, card: RuntimeCard) => void;
  endTurn: () => void;
  runEnemyTurn: () => void;
  selectAttacker: (cardId: string | null) => void;
  selectHandCard: (cardId: string | null) => void;
  setScreen: (screen: GameState["ui"]["screen"]) => void;
  setStatus: (status: string) => void;
  setBusy: (busy: boolean) => void;
};

const getActor = (state: GameState, playerId: PlayerId): PlayerState => (playerId === "player" ? state.player : state.enemy);
const getOpponentId = (playerId: PlayerId): PlayerId => (playerId === "player" ? "enemy" : "player");
const setActor = (state: GameState, playerId: PlayerId, next: PlayerState) => {
  if (playerId === "player") {
    state.player = next;
  } else {
    state.enemy = next;
  }
};

const mutateActor = (state: GameState, playerId: PlayerId, updater: (player: PlayerState) => PlayerState) => {
  setActor(state, playerId, updater(getActor(state, playerId)));
};

const resolveWinner = (state: GameState) => {
  if (state.player.structuralIntegrity <= 0) {
    state.battle.winner = "enemy";
    state.phase = "finished";
    state.ui.screen = "defeat";
    state.ui.status = "A Montanha de Aço entra em colapso.";
  } else if (state.enemy.structuralIntegrity <= 0) {
    state.battle.winner = "player";
    state.phase = "finished";
    state.ui.screen = "victory";
    state.ui.status = "A forja suprema responde ao seu comando.";
  }
};

const log = (state: GameState, entry: string) => {
  state.battle.logs = pushLog(state.battle.logs, entry);
};

const refreshBoardForTurn = (state: GameState, playerId: PlayerId) => {
  mutateActor(state, playerId, (actor) => ({
    ...actor,
    board: actor.board.map((card) => {
      const ticked = tickStatuses(card);
      return {
        ...ticked,
        currentAttack: Math.max(0, ticked.attack + ticked.statusEffects.filter((status) => status.key === "bonusAttack").reduce((total, status) => total + status.value, 0)),
        canAttack: true,
        hasActed: false,
        summonSickness: false,
      };
    }),
  }));
};

const buildAbilityContext = (state: GameState, actorId: PlayerId, sourceCard?: RuntimeCard) => ({
  state,
  actorId,
  opponentId: getOpponentId(actorId),
  sourceCard,
});

const destroyDeadUnits = (state: GameState) => {
  (["player", "enemy"] as const).forEach((ownerId) => {
    const actor = getActor(state, ownerId);
    const destroyed = actor.board.filter((card) => card.currentDefense <= 0);
    if (destroyed.length === 0) return;
    destroyed.forEach((card) => {
      const resolver = onDeathResolvers[card.ability];
      if (resolver) resolver(buildAbilityContext(state, ownerId, card));
      mutateActor(state, ownerId, (current) => ({
        ...current,
        board: removeCardFromZone(current.board, card.instanceId),
        graveyard: [...current.graveyard, card],
      }));
      log(state, `${card.name} é removida da Plataforma Industrial.`);
    });
  });
  resolveWinner(state);
};

const drawOneCard = (state: GameState, playerId: PlayerId) => {
  const actor = getActor(state, playerId);
  if (actor.deck.length === 0 || actor.hand.length >= MAX_HAND_SIZE) return;
  const [drawn, ...restDeck] = actor.deck;
  setActor(state, playerId, { ...actor, deck: restDeck, hand: [...actor.hand, drawn] });
  log(state, `${actor.name} compra ${drawn.name}.`);
};

const applyStartTurnPassives = (state: GameState, playerId: PlayerId) => {
  getActor(state, playerId).board.forEach((unit) => {
    const resolver = passiveTickResolvers[unit.ability];
    if (resolver) resolver(buildAbilityContext(state, playerId, unit));
  });
  destroyDeadUnits(state);
};

const paySteamPressure = (state: GameState, playerId: PlayerId, cost: number) => {
  const actor = getActor(state, playerId);
  const deficit = Math.max(0, cost - actor.steamPressure);
  mutateActor(state, playerId, (current) => ({ ...current, steamPressure: Math.max(0, current.steamPressure - cost) }));
  if (deficit > 0) addOverpressure(state, playerId, deficit);
};

const locateUnit = (state: GameState, unitId: string): { ownerId: PlayerId; card: RuntimeCard } | null => {
  const playerCard = findCard(state.player.board, unitId);
  if (playerCard) return { ownerId: "player", card: playerCard };
  const enemyCard = findCard(state.enemy.board, unitId);
  if (enemyCard) return { ownerId: "enemy", card: enemyCard };
  return null;
};

const markAttackerActed = (state: GameState, ownerId: PlayerId, unitId: string) => {
  mutateActor(state, ownerId, (actor) => ({
    ...actor,
    board: actor.board.map((card) =>
      card.instanceId === unitId
        ? { ...card, hasActed: true, canAttack: false, attackCount: card.attackCount + 1 }
        : card,
    ),
  }));
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialGameState(),

  startGame: () => {
    const base = createInitialGameState();
    for (let count = 0; count < 5; count += 1) {
      drawOneCard(base, "player");
      drawOneCard(base, "enemy");
    }
    base.ui.screen = "battle";
    base.ui.status = "A batalha pela Montanha de Aço começou.";
    base.phase = "mainPhase";
    set(base);
  },

  resetGame: () => set(createInitialGameState()),

  startTurn: (playerId) => {
    set((current) => {
      const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui } };
      state.activePlayer = playerId;
      state.phase = "startTurn";
      if (playerId === "player") state.turnNumber += current.activePlayer === "enemy" ? 1 : 0;
      resolvePendingStructuralDamage(state, playerId);
      state.phase = "drawPhase";
      drawOneCard(state, playerId);
      state.phase = "resourcePhase";
      mutateActor(state, playerId, (actor) => ({
        ...actor,
        maxSteamPressure: Math.min(MAX_STEAM_PRESSURE, actor.maxSteamPressure + (state.turnNumber === 1 && playerId === "player" && current.phase === "idle" ? 0 : 1)),
      }));
      mutateActor(state, playerId, (actor) => ({ ...actor, steamPressure: actor.maxSteamPressure }));
      refreshBoardForTurn(state, playerId);
      applyStartTurnPassives(state, playerId);
      state.phase = playerId === "enemy" ? "enemyTurn" : "mainPhase";
      state.ui.status = playerId === "player" ? "Sua caldeira está pronta." : "O inimigo ajusta a pressão.";
      resolveWinner(state);
      return state;
    });
  },

  drawCard: (playerId) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui } };
    drawOneCard(state, playerId);
    return state;
  }),

  refillSteamPressure: (playerId) => set((current) => {
    const state = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy) } as GameState;
    mutateActor(state, playerId, (actor) => ({ ...actor, steamPressure: actor.maxSteamPressure }));
    return state;
  }),

  increaseMaxSteamPressure: (playerId) => set((current) => {
    const state = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy) } as GameState;
    mutateActor(state, playerId, (actor) => ({ ...actor, maxSteamPressure: Math.min(MAX_STEAM_PRESSURE, actor.maxSteamPressure + 1) }));
    return state;
  }),

  summonToBoard: (playerId, card) => set((current) => {
    const state = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy) } as GameState;
    mutateActor(state, playerId, (actor) => ({
      ...actor,
      board: [...actor.board, { ...card, canAttack: false, hasActed: false, summonSickness: true }],
    }));
    return state;
  }),

  playCard: (playerId, cardId) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui } };
    const actor = getActor(state, playerId);
    if (state.battle.winner || actor.board.length >= MAX_BOARD_SIZE) return current;
    const card = findCard(actor.hand, cardId);
    if (!card) return current;

    paySteamPressure(state, playerId, card.energyCost);
    mutateActor(state, playerId, (currentActor) => ({
      ...currentActor,
      hand: removeCardFromZone(currentActor.hand, cardId),
      board: [...currentActor.board, { ...card, canAttack: false, hasActed: false, summonSickness: true }],
    }));

    const summoned = findCard(getActor(state, playerId).board, cardId);
    if (summoned) {
      const resolver = onPlayResolvers[summoned.ability];
      if (resolver) resolver(buildAbilityContext(state, playerId, summoned));
      if (summoned.ability === "overpressureGrowth" && getActor(state, playerId).overpressure > 0) {
        buffUnitAttack(state, playerId, summoned.instanceId, getActor(state, playerId).overpressure, null, summoned.name);
      }
    }

    log(state, `${actor.name} mobiliza ${card.name}.`);
    state.ui.status = `${card.name} entra na Plataforma Industrial.`;
    destroyDeadUnits(state);
    resolveWinner(state);
    return state;
  }),

  attack: (attackerId, target) => {
    if (target.type === "player") {
      get().attackPlayer(attackerId, target.owner);
      return;
    }
    get().attackUnit(attackerId, target.id);
  },

  attackUnit: (attackerId, targetId) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui } };
    const attackerRef = locateUnit(state, attackerId);
    const defenderRef = locateUnit(state, targetId);
    if (!attackerRef || !defenderRef) return current;
    if (!canUnitAttack(attackerRef.card)) return current;
    const taunts = getTauntUnits(getActor(state, defenderRef.ownerId).board);
    if (taunts.length > 0 && !taunts.some((unit) => unit.instanceId === targetId)) return current;

    const attackBonus = onAttackResolvers[attackerRef.card.ability]?.({ ...buildAbilityContext(state, attackerRef.ownerId, attackerRef.card), targetUnitId: targetId }) ?? 0;
    const damage = estimateAttackDamage(attackerRef.card) + attackBonus;
    damageUnit(state, defenderRef.ownerId, defenderRef.card.instanceId, damage, attackerRef.card.name);

    const refreshedDefender = findCard(getActor(state, defenderRef.ownerId).board, defenderRef.card.instanceId);
    if (refreshedDefender && refreshedDefender.currentDefense > 0) {
      damageUnit(state, attackerRef.ownerId, attackerRef.card.instanceId, refreshedDefender.currentAttack, refreshedDefender.name);
    }

    markAttackerActed(state, attackerRef.ownerId, attackerRef.card.instanceId);
    log(state, `${attackerRef.card.name} ataca ${defenderRef.card.name}.`);
    destroyDeadUnits(state);
    resolveWinner(state);
    return state;
  }),

  attackPlayer: (attackerId, targetPlayerId) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui } };
    const attackerRef = locateUnit(state, attackerId);
    if (!attackerRef || !canUnitAttack(attackerRef.card)) return current;
    if (!canDirectAttack(getActor(state, targetPlayerId).board)) return current;

    const attackBonus = onAttackResolvers[attackerRef.card.ability]?.({ ...buildAbilityContext(state, attackerRef.ownerId, attackerRef.card), targetPlayerId }) ?? 0;
    dealDamageToPlayer(state, targetPlayerId, estimateAttackDamage(attackerRef.card) + attackBonus, attackerRef.card.name);
    markAttackerActed(state, attackerRef.ownerId, attackerRef.card.instanceId);
    log(state, `${attackerRef.card.name} atinge diretamente ${getActor(state, targetPlayerId).name}.`);
    resolveWinner(state);
    return state;
  }),

  applyDamageToUnit: (unitId, amount) => set((current) => {
    const state = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui } } as GameState;
    const ref = locateUnit(state, unitId);
    if (!ref) return current;
    damageUnit(state, ref.ownerId, unitId, amount, "efeito externo");
    destroyDeadUnits(state);
    return state;
  }),

  applyDamageToPlayer: (playerId, amount) => set((current) => {
    const state = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui } } as GameState;
    dealDamageToPlayer(state, playerId, amount, "efeito externo");
    resolveWinner(state);
    return state;
  }),

  healUnit: (unitId, amount) => set((current) => {
    const state = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle } } as GameState;
    const ref = locateUnit(state, unitId);
    if (!ref) return current;
    healUnitBy(state, ref.ownerId, unitId, amount, "efeito externo");
    return state;
  }),

  healPlayer: (playerId, amount) => set((current) => {
    const state = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle } } as GameState;
    healPlayerBy(state, playerId, amount, "efeito externo");
    return state;
  }),

  applyShield: (unitId, amount) => set((current) => {
    const state = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle } } as GameState;
    const ref = locateUnit(state, unitId);
    if (!ref) return current;
    mutateActor(state, ref.ownerId, (actor) => ({
      ...actor,
      board: actor.board.map((card) => card.instanceId === unitId ? { ...upsertStatus({ ...card, shield: card.shield + amount }, { key: "shield", value: amount, duration: null }), shield: card.shield + amount } : card),
    }));
    return state;
  }),

  destroyUnit: (unitId) => set((current) => {
    const state = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui } } as GameState;
    const ref = locateUnit(state, unitId);
    if (!ref) return current;
    mutateActor(state, ref.ownerId, (actor) => ({ ...actor, board: actor.board.map((card) => card.instanceId === unitId ? { ...card, currentDefense: 0 } : card) }));
    destroyDeadUnits(state);
    return state;
  }),

  moveToGraveyard: (playerId, card) => set((current) => {
    const state = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy) } as GameState;
    mutateActor(state, playerId, (actor) => ({ ...actor, graveyard: [...actor.graveyard, card] }));
    return state;
  }),

  endTurn: () => {
    const current = get();
    if (current.battle.winner || current.activePlayer !== "player") return;
    set((snapshot) => {
      const state: GameState = { ...snapshot, player: clonePlayer(snapshot.player), enemy: clonePlayer(snapshot.enemy), battle: { ...snapshot.battle }, ui: { ...snapshot.ui } };
      state.phase = "endPhase";
      resolveOverpressurePenalty(state, "player");
      state.battle.selectedAttackerId = null;
      state.ui.status = "A pressão muda de lado.";
      return state;
    });
    get().runEnemyTurn();
  },

  runEnemyTurn: () => {
    get().startTurn("enemy");
    const plan = buildEnemyPlan(get());
    plan.forEach((action) => {
      if (get().battle.winner) return;
      if (action.type === "play") get().playCard("enemy", action.cardId);
      if (action.type === "attack") get().attack(action.attackerId, action.target);
    });
    set((snapshot) => {
      const state: GameState = { ...snapshot, player: clonePlayer(snapshot.player), enemy: clonePlayer(snapshot.enemy), battle: { ...snapshot.battle }, ui: { ...snapshot.ui } };
      resolveOverpressurePenalty(state, "enemy");
      return state;
    });
    if (!get().battle.winner) get().startTurn("player");
  },

  selectAttacker: (cardId) => set((state) => ({ battle: { ...state.battle, selectedAttackerId: cardId } })),
  selectHandCard: (cardId) => set((state) => ({ battle: { ...state.battle, selectedHandCardId: cardId } })),
  setScreen: (screen) => set((state) => ({ ui: { ...state.ui, screen } })),
  setStatus: (status) => set((state) => ({ ui: { ...state.ui, status } })),
  setBusy: (busy) => set((state) => ({ ui: { ...state.ui, busy } })),
}));