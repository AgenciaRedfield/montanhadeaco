import { create } from "zustand";
import { cards } from "@/data/cards";
import { getCurrentAuthUser, sendMagicLink as sendMagicLinkRequest, signOutAuth } from "@/services/authService";
import { clearProgressSnapshot, DECK_COPY_LIMIT, DECK_SIZE, defaultAuth, defaultProfile, defaultSettings, FORGE_COST, loadProgressSnapshot, saveProgressSnapshot } from "@/services/progressionService";
import type { PlayerId, RuntimeCard } from "@/types/card";
import type { CombatTarget, GameState, PlayerState, ProgressProfile, SettingsState } from "@/types/game";
import { buildEnemyPlan } from "@/utils/ai";
import {
  addOverpressure,
  buffUnitAttack,
  damageUnit,
  dealDamageToPlayer,
  healPlayerBy,
  healUnitBy,
  onAttackResolvers,
  onDeathResolvers,
  onPlayResolvers,
  passiveTickResolvers,
  resolveOverpressurePenalty,
  resolvePendingStructuralDamage,
} from "@/utils/abilityResolvers";
import { canDirectAttack, canUnitAttack, estimateAttackDamage, getTauntUnits } from "@/utils/combat";
import {
  canAddDeckCard,
  clonePlayer,
  createInitialGameState,
  createPlayerState,
  findCard,
  MAX_BOARD_SIZE,
  MAX_HAND_SIZE,
  MAX_STEAM_PRESSURE,
  pickForgeRewards,
  pushLog,
  removeCardFromZone,
  resolveDeckCards,
  tickStatuses,
  upsertStatus,
} from "@/utils/gameHelpers";

type GameStore = GameState & {
  hydrateProgress: () => Promise<void>;
  handleAuthSession: (userId: string | null, email: string | null) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  signOutCloud: () => Promise<void>;
  syncCloudProgress: () => Promise<void>;
  openDashboard: () => void;
  openForge: () => void;
  openDeckBuilder: () => void;
  startGame: () => void;
  resetGame: () => void;
  resetProgress: () => Promise<void>;
  forgeCard: () => void;
  addDeckCard: (cardId: string) => void;
  removeDeckCard: (index: number) => void;
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
  toggleMusic: () => void;
  unlockMusic: () => void;
  setMusicVolume: (volume: number) => void;
};

const getActor = (state: GameState, playerId: PlayerId): PlayerState => (playerId === "player" ? state.player : state.enemy);
const getOpponentId = (playerId: PlayerId): PlayerId => (playerId === "player" ? "enemy" : "player");
const setActor = (state: GameState, playerId: PlayerId, next: PlayerState) => {
  if (playerId === "player") state.player = next;
  else state.enemy = next;
};
const mutateActor = (state: GameState, playerId: PlayerId, updater: (player: PlayerState) => PlayerState) => setActor(state, playerId, updater(getActor(state, playerId)));
const persistSnapshot = (profile: ProgressProfile, settings: SettingsState, userId?: string | null) => { void saveProgressSnapshot(profile, settings, userId); };

const updateProfileResult = (state: GameState, winner: PlayerId) => {
  if (state.battle.resultRecorded) return;
  state.profile = {
    ...state.profile,
    victories: winner === "player" ? state.profile.victories + 1 : state.profile.victories,
    forgeCredits: state.profile.forgeCredits + (winner === "player" ? 35 : 10),
    level: winner === "player" ? Math.min(99, state.profile.level + 1) : state.profile.level,
    lastPlayedAt: new Date().toISOString(),
    syncStatus: state.auth.userId ? "saving" : "local-only",
    cloudEnabled: Boolean(state.auth.userId),
  };
  state.battle.resultRecorded = true;
  persistSnapshot(state.profile, state.settings, state.auth.userId);
};

const resolveWinner = (state: GameState) => {
  if (state.player.structuralIntegrity <= 0) {
    state.battle.winner = "enemy";
    state.phase = "finished";
    state.ui.screen = "defeat";
    state.ui.status = "A Montanha de Aco entra em colapso.";
    updateProfileResult(state, "enemy");
  } else if (state.enemy.structuralIntegrity <= 0) {
    state.battle.winner = "player";
    state.phase = "finished";
    state.ui.screen = "victory";
    state.ui.status = "A forja suprema responde ao seu comando.";
    updateProfileResult(state, "player");
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

const buildAbilityContext = (state: GameState, actorId: PlayerId, sourceCard?: RuntimeCard) => ({ state, actorId, opponentId: getOpponentId(actorId), sourceCard });

const destroyDeadUnits = (state: GameState) => {
  (["player", "enemy"] as const).forEach((ownerId) => {
    const actor = getActor(state, ownerId);
    const destroyed = actor.board.filter((card) => card.currentDefense <= 0);
    if (destroyed.length === 0) return;
    destroyed.forEach((card) => {
      const resolver = onDeathResolvers[card.ability];
      if (resolver) resolver(buildAbilityContext(state, ownerId, card));
      mutateActor(state, ownerId, (current) => ({ ...current, board: removeCardFromZone(current.board, card.instanceId), graveyard: [...current.graveyard, card] }));
      log(state, `${card.name} e removida da Plataforma Industrial.`);
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
    board: actor.board.map((card) => card.instanceId === unitId ? { ...card, hasActed: true, canAttack: false, attackCount: card.attackCount + 1 } : card),
  }));
};

const buildFreshBattleState = (current: GameStore): GameState => {
  const base = createInitialGameState();
  const playerDeck = resolveDeckCards(current.profile.selectedDeck, current.profile.unlockedCards);

  base.player = createPlayerState("player", current.profile.commanderName, playerDeck);
  base.enemy = createPlayerState("enemy", "Automato Soberano", cards);

  for (let count = 0; count < 5; count += 1) {
    drawOneCard(base, "player");
    drawOneCard(base, "enemy");
  }

  return {
    ...base,
    profile: {
      ...current.profile,
      battlesPlayed: current.profile.battlesPlayed + 1,
      lastPlayedAt: new Date().toISOString(),
      syncStatus: current.auth.userId ? "saving" : "local-only",
      cloudEnabled: Boolean(current.auth.userId),
    },
    settings: current.settings,
    auth: current.auth,
    hydrated: true,
    ui: { ...base.ui, screen: "battle", status: "A batalha pela Montanha de Aco comecou.", forgeResults: current.ui.forgeResults },
    phase: "mainPhase",
  };
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialGameState(),

  hydrateProgress: async () => {
    const user = await getCurrentAuthUser();
    const snapshot = await loadProgressSnapshot(user?.id ?? null);
    set((state) => ({
      profile: { ...snapshot.profile, cloudEnabled: Boolean(user), syncStatus: user ? "synced" : "local-only" },
      settings: snapshot.settings,
      auth: {
        userId: user?.id ?? null,
        email: user?.email ?? null,
        initialized: true,
        magicLinkSentTo: state.auth.magicLinkSentTo,
      },
      hydrated: true,
      ui: { ...state.ui, status: user ? "Progresso sincronizado com a fundicao em nuvem." : "A fundicao reconheceu seu progresso local." },
    }));
  },

  handleAuthSession: async (userId, email) => {
    const current = get();
    if (!userId) {
      const localSnapshot = await loadProgressSnapshot(null);
      set(() => ({
        profile: { ...localSnapshot.profile, cloudEnabled: false, syncStatus: "local-only" },
        settings: localSnapshot.settings,
        auth: { ...defaultAuth, initialized: true },
        ui: { ...current.ui, status: "Sessao em nuvem encerrada. Progresso local mantido." },
      }));
      return;
    }

    const snapshot = await loadProgressSnapshot(userId);
    set((state) => ({
      profile: { ...snapshot.profile, cloudEnabled: true, syncStatus: "synced" },
      settings: snapshot.settings,
      auth: { userId, email, initialized: true, magicLinkSentTo: state.auth.magicLinkSentTo },
      hydrated: true,
      ui: { ...state.ui, status: `Sessao conectada para ${email ?? "comandante"}.` },
    }));
  },

  sendMagicLink: async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      set((state) => ({ ui: { ...state.ui, status: "Informe um email para receber o link magico." } }));
      return;
    }

    set((state) => ({ ui: { ...state.ui, busy: true, status: "Enviando sinal da fundicao..." } }));
    const { error } = await sendMagicLinkRequest(normalizedEmail);

    set((state) => ({
      ui: { ...state.ui, busy: false, status: error ? "Falha ao enviar o link magico do Supabase." : `Link magico enviado para ${normalizedEmail}.` },
      auth: { ...state.auth, magicLinkSentTo: error ? state.auth.magicLinkSentTo : normalizedEmail },
    }));
  },

  signOutCloud: async () => {
    await signOutAuth();
    const snapshot = await loadProgressSnapshot(null);
    set((state) => ({
      profile: { ...snapshot.profile, cloudEnabled: false, syncStatus: "local-only" },
      settings: snapshot.settings,
      auth: { ...defaultAuth, initialized: true },
      ui: { ...state.ui, status: "Sessao da nuvem encerrada." },
    }));
  },

  syncCloudProgress: async () => {
    const current = get();
    if (!current.auth.userId) {
      set((state) => ({ ui: { ...state.ui, status: "Conecte sua conta Supabase para sincronizar." } }));
      return;
    }

    const savingProfile: ProgressProfile = { ...current.profile, cloudEnabled: true, syncStatus: "saving" };
    set((state) => ({ profile: savingProfile, ui: { ...state.ui, status: "Sincronizando progresso com a nuvem..." } }));
    await saveProgressSnapshot(savingProfile, current.settings, current.auth.userId);
    set((state) => ({
      profile: { ...state.profile, cloudEnabled: true, syncStatus: "synced" },
      ui: { ...state.ui, status: "Progresso sincronizado com sucesso." },
    }));
  },

  openDashboard: () => set((state) => ({ ui: { ...state.ui, screen: "dashboard", status: "A central da Montanha de Aco esta operante." } })),
  openForge: () => set((state) => ({ ui: { ...state.ui, screen: "forge", status: "A forja principal esta aquecida para um novo booster." } })),
  openDeckBuilder: () => set((state) => ({ ui: { ...state.ui, screen: "deck-builder", status: "A bancada tatica aguarda sua lista de batalha." } })),

  startGame: () => {
    const next = buildFreshBattleState(get());
    persistSnapshot(next.profile, next.settings, next.auth.userId);
    set(next);
  },

  resetGame: () => set((current) => ({
    ...createInitialGameState(),
    profile: current.profile,
    settings: current.settings,
    auth: current.auth,
    hydrated: current.hydrated,
    ui: { ...createInitialGameState().ui, status: "Os pistoes aguardam seu comando." },
  })),

  resetProgress: async () => {
    await clearProgressSnapshot();
    const current = get();
    const preservedMusicUnlocked = current.settings.musicUnlocked;
    const nextSettings = preservedMusicUnlocked ? { ...defaultSettings, musicUnlocked: true } : defaultSettings;
    const nextProfile: ProgressProfile = { ...defaultProfile, cloudEnabled: Boolean(current.auth.userId), syncStatus: current.auth.userId ? "saving" : "local-only" };
    persistSnapshot(nextProfile, nextSettings, current.auth.userId);
    set(() => ({
      ...createInitialGameState(),
      profile: nextProfile,
      settings: nextSettings,
      auth: { ...current.auth, initialized: true },
      hydrated: true,
      ui: { ...createInitialGameState().ui, screen: "menu", status: "A forja voltou ao estado inicial." },
    }));
  },

  forgeCard: () => set((current) => {
    const lockedCards = cards.filter((card) => !current.profile.unlockedCards.includes(card.id));
    if (lockedCards.length === 0) {
      return { ui: { ...current.ui, status: "Sua colecao ja domina toda a Forja. Nenhuma carta resta bloqueada.", forgeResults: [] } };
    }
    if (current.profile.forgeCredits < FORGE_COST) {
      return { ui: { ...current.ui, status: `A Forja exige ${FORGE_COST} creditos para liberar um booster.`, forgeResults: [] } };
    }

    const rewards = pickForgeRewards(lockedCards);
    if (rewards.length === 0) {
      return { ui: { ...current.ui, status: "A Forja falhou em selecionar um booster.", forgeResults: [] } };
    }

    const rewardIds = rewards.map((card) => card.id);
    const rewardNames = rewards.map((card) => card.name).join(", ");
    const nextProfile: ProgressProfile = {
      ...current.profile,
      forgeCredits: current.profile.forgeCredits - FORGE_COST,
      unlockedCards: [...current.profile.unlockedCards, ...rewardIds],
      lastPlayedAt: new Date().toISOString(),
      syncStatus: current.auth.userId ? "saving" : "local-only",
      cloudEnabled: Boolean(current.auth.userId),
    };

    persistSnapshot(nextProfile, current.settings, current.auth.userId);

    return {
      profile: nextProfile,
      ui: { ...current.ui, status: `Booster concluido: ${rewardNames}.`, forgeResults: rewardIds },
    };
  }),

  addDeckCard: (cardId) => set((current) => {
    if (!current.profile.unlockedCards.includes(cardId)) {
      return { ui: { ...current.ui, status: "Essa carta ainda nao foi desbloqueada na Forja." } };
    }
    if (!canAddDeckCard(current.profile.selectedDeck, cardId)) {
      if (current.profile.selectedDeck.length >= DECK_SIZE) {
        return { ui: { ...current.ui, status: `Seu deck ja atingiu ${DECK_SIZE} cartas.` } };
      }
      return { ui: { ...current.ui, status: `Cada carta pode entrar ate ${DECK_COPY_LIMIT} vezes no deck.` } };
    }

    const card = cards.find((entry) => entry.id === cardId);
    const nextProfile: ProgressProfile = {
      ...current.profile,
      selectedDeck: [...current.profile.selectedDeck, cardId],
      syncStatus: current.auth.userId ? "saving" : "local-only",
      cloudEnabled: Boolean(current.auth.userId),
    };
    persistSnapshot(nextProfile, current.settings, current.auth.userId);

    return {
      profile: nextProfile,
      ui: { ...current.ui, status: `${card?.name ?? "Carta"} adicionada ao deck. ${nextProfile.selectedDeck.length}/${DECK_SIZE}.` },
    };
  }),

  removeDeckCard: (index) => set((current) => {
    if (index < 0 || index >= current.profile.selectedDeck.length) return current;
    const removedId = current.profile.selectedDeck[index];
    const nextDeck = current.profile.selectedDeck.filter((_, currentIndex) => currentIndex !== index);
    const card = cards.find((entry) => entry.id === removedId);
    const nextProfile: ProgressProfile = {
      ...current.profile,
      selectedDeck: nextDeck,
      syncStatus: current.auth.userId ? "saving" : "local-only",
      cloudEnabled: Boolean(current.auth.userId),
    };
    persistSnapshot(nextProfile, current.settings, current.auth.userId);

    return {
      profile: nextProfile,
      ui: { ...current.ui, status: `${card?.name ?? "Carta"} removida do deck. ${nextDeck.length}/${DECK_SIZE}.` },
    };
  }),

  startTurn: (playerId) => {
    set((current) => {
      const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui }, profile: { ...current.profile }, settings: { ...current.settings }, auth: { ...current.auth }, hydrated: current.hydrated };
      state.activePlayer = playerId;
      state.phase = "startTurn";
      if (playerId === "player") state.turnNumber += current.activePlayer === "enemy" ? 1 : 0;
      resolvePendingStructuralDamage(state, playerId);
      state.phase = "drawPhase";
      drawOneCard(state, playerId);
      state.phase = "resourcePhase";
      mutateActor(state, playerId, (actor) => ({ ...actor, maxSteamPressure: Math.min(MAX_STEAM_PRESSURE, actor.maxSteamPressure + (state.turnNumber === 1 && playerId === "player" && current.phase === "idle" ? 0 : 1)) }));
      mutateActor(state, playerId, (actor) => ({ ...actor, steamPressure: actor.maxSteamPressure }));
      refreshBoardForTurn(state, playerId);
      applyStartTurnPassives(state, playerId);
      state.phase = playerId === "enemy" ? "enemyTurn" : "mainPhase";
      state.ui.status = playerId === "player" ? "Sua caldeira esta pronta." : "O inimigo ajusta a pressao.";
      resolveWinner(state);
      return state;
    });
  },

  drawCard: (playerId) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui }, profile: { ...current.profile }, settings: { ...current.settings }, auth: { ...current.auth }, hydrated: current.hydrated };
    drawOneCard(state, playerId);
    return state;
  }),

  refillSteamPressure: (playerId) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), profile: { ...current.profile }, settings: { ...current.settings }, battle: { ...current.battle }, ui: { ...current.ui }, auth: { ...current.auth }, hydrated: current.hydrated };
    mutateActor(state, playerId, (actor) => ({ ...actor, steamPressure: actor.maxSteamPressure }));
    return state;
  }),

  increaseMaxSteamPressure: (playerId) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), profile: { ...current.profile }, settings: { ...current.settings }, battle: { ...current.battle }, ui: { ...current.ui }, auth: { ...current.auth }, hydrated: current.hydrated };
    mutateActor(state, playerId, (actor) => ({ ...actor, maxSteamPressure: Math.min(MAX_STEAM_PRESSURE, actor.maxSteamPressure + 1) }));
    return state;
  }),

  summonToBoard: (playerId, card) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), profile: { ...current.profile }, settings: { ...current.settings }, battle: { ...current.battle }, ui: { ...current.ui }, auth: { ...current.auth }, hydrated: current.hydrated };
    mutateActor(state, playerId, (actor) => ({ ...actor, board: [...actor.board, { ...card, canAttack: false, hasActed: false, summonSickness: true }] }));
    return state;
  }),

  playCard: (playerId, cardId) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui }, profile: { ...current.profile }, settings: { ...current.settings }, auth: { ...current.auth }, hydrated: current.hydrated };
    const actor = getActor(state, playerId);
    if (state.battle.winner || actor.board.length >= MAX_BOARD_SIZE) return current;
    const card = findCard(actor.hand, cardId);
    if (!card) return current;

    paySteamPressure(state, playerId, card.energyCost);
    mutateActor(state, playerId, (currentActor) => ({ ...currentActor, hand: removeCardFromZone(currentActor.hand, cardId), board: [...currentActor.board, { ...card, canAttack: false, hasActed: false, summonSickness: true }] }));

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
    return state;
  }),

  attack: (attackerId, target) => {
    if (target.type === "player") get().attackPlayer(attackerId, target.owner);
    else get().attackUnit(attackerId, target.id);
  },

  attackUnit: (attackerId, targetId) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui }, profile: { ...current.profile }, settings: { ...current.settings }, auth: { ...current.auth }, hydrated: current.hydrated };
    const attackerRef = locateUnit(state, attackerId);
    const defenderRef = locateUnit(state, targetId);
    if (!attackerRef || !defenderRef || !canUnitAttack(attackerRef.card)) return current;
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
    return state;
  }),

  attackPlayer: (attackerId, targetPlayerId) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui }, profile: { ...current.profile }, settings: { ...current.settings }, auth: { ...current.auth }, hydrated: current.hydrated };
    const attackerRef = locateUnit(state, attackerId);
    if (!attackerRef || !canUnitAttack(attackerRef.card) || !canDirectAttack(getActor(state, targetPlayerId).board)) return current;

    const attackBonus = onAttackResolvers[attackerRef.card.ability]?.({ ...buildAbilityContext(state, attackerRef.ownerId, attackerRef.card), targetPlayerId }) ?? 0;
    dealDamageToPlayer(state, targetPlayerId, estimateAttackDamage(attackerRef.card) + attackBonus, attackerRef.card.name);
    markAttackerActed(state, attackerRef.ownerId, attackerRef.card.instanceId);
    log(state, `${attackerRef.card.name} atinge diretamente ${getActor(state, targetPlayerId).name}.`);
    resolveWinner(state);
    return state;
  }),

  applyDamageToUnit: (unitId, amount) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui }, profile: { ...current.profile }, settings: { ...current.settings }, auth: { ...current.auth }, hydrated: current.hydrated };
    const ref = locateUnit(state, unitId);
    if (!ref) return current;
    damageUnit(state, ref.ownerId, unitId, amount, "efeito externo");
    destroyDeadUnits(state);
    return state;
  }),

  applyDamageToPlayer: (playerId, amount) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui }, profile: { ...current.profile }, settings: { ...current.settings }, auth: { ...current.auth }, hydrated: current.hydrated };
    dealDamageToPlayer(state, playerId, amount, "efeito externo");
    resolveWinner(state);
    return state;
  }),

  healUnit: (unitId, amount) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, profile: { ...current.profile }, settings: { ...current.settings }, ui: { ...current.ui }, auth: { ...current.auth }, hydrated: current.hydrated };
    const ref = locateUnit(state, unitId);
    if (!ref) return current;
    healUnitBy(state, ref.ownerId, unitId, amount, "efeito externo");
    return state;
  }),

  healPlayer: (playerId, amount) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, profile: { ...current.profile }, settings: { ...current.settings }, ui: { ...current.ui }, auth: { ...current.auth }, hydrated: current.hydrated };
    healPlayerBy(state, playerId, amount, "efeito externo");
    return state;
  }),

  applyShield: (unitId, amount) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, profile: { ...current.profile }, settings: { ...current.settings }, ui: { ...current.ui }, auth: { ...current.auth }, hydrated: current.hydrated };
    const ref = locateUnit(state, unitId);
    if (!ref) return current;
    mutateActor(state, ref.ownerId, (actor) => ({
      ...actor,
      board: actor.board.map((card) => card.instanceId === unitId ? { ...upsertStatus({ ...card, shield: card.shield + amount }, { key: "shield", value: amount, duration: null }), shield: card.shield + amount } : card),
    }));
    return state;
  }),

  destroyUnit: (unitId) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), battle: { ...current.battle }, ui: { ...current.ui }, profile: { ...current.profile }, settings: { ...current.settings }, auth: { ...current.auth }, hydrated: current.hydrated };
    const ref = locateUnit(state, unitId);
    if (!ref) return current;
    mutateActor(state, ref.ownerId, (actor) => ({ ...actor, board: actor.board.map((card) => card.instanceId === unitId ? { ...card, currentDefense: 0 } : card) }));
    destroyDeadUnits(state);
    return state;
  }),

  moveToGraveyard: (playerId, card) => set((current) => {
    const state: GameState = { ...current, player: clonePlayer(current.player), enemy: clonePlayer(current.enemy), profile: { ...current.profile }, settings: { ...current.settings }, battle: { ...current.battle }, ui: { ...current.ui }, auth: { ...current.auth }, hydrated: current.hydrated };
    mutateActor(state, playerId, (actor) => ({ ...actor, graveyard: [...actor.graveyard, card] }));
    return state;
  }),

  endTurn: () => {
    const current = get();
    if (current.battle.winner || current.activePlayer !== "player") return;
    set((snapshot) => {
      const state: GameState = { ...snapshot, player: clonePlayer(snapshot.player), enemy: clonePlayer(snapshot.enemy), battle: { ...snapshot.battle }, ui: { ...snapshot.ui }, profile: { ...snapshot.profile }, settings: { ...snapshot.settings }, auth: { ...snapshot.auth }, hydrated: snapshot.hydrated };
      state.phase = "endPhase";
      resolveOverpressurePenalty(state, "player");
      state.battle.selectedAttackerId = null;
      state.ui.status = "A pressao muda de lado.";
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
      const state: GameState = { ...snapshot, player: clonePlayer(snapshot.player), enemy: clonePlayer(snapshot.enemy), battle: { ...snapshot.battle }, ui: { ...snapshot.ui }, profile: { ...snapshot.profile }, settings: { ...snapshot.settings }, auth: { ...snapshot.auth }, hydrated: snapshot.hydrated };
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

  toggleMusic: () => set((state) => {
    const nextSettings = { ...state.settings, musicEnabled: !state.settings.musicEnabled };
    persistSnapshot(state.profile, nextSettings, state.auth.userId);
    return { settings: nextSettings };
  }),

  unlockMusic: () => set((state) => {
    if (state.settings.musicUnlocked) return state;
    const nextSettings = { ...state.settings, musicUnlocked: true };
    persistSnapshot(state.profile, nextSettings, state.auth.userId);
    return { settings: nextSettings };
  }),

  setMusicVolume: (volume) => set((state) => {
    const nextSettings = { ...state.settings, musicVolume: Math.max(0, Math.min(1, volume)) };
    persistSnapshot(state.profile, nextSettings, state.auth.userId);
    return { settings: nextSettings };
  }),
}));
