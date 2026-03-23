import { cards as cardPool } from "@/data/cards";
import { DECK_COPY_LIMIT, DECK_SIZE, defaultAuth, defaultProfile, defaultSettings, FORGE_PACK_SIZE, STARTER_DECK_IDS, STARTER_UNLOCK_IDS } from "@/services/progressionService";
import type { Card, CardRarity, PlayerId, RuntimeCard, StatusEffect } from "@/types/card";
import type { BattleState, GameState, PlayerState, UIState } from "@/types/game";

export const MAX_HAND_SIZE = 10;
export const MAX_BOARD_SIZE = 5;
export const MAX_STEAM_PRESSURE = 10;
export const STARTING_STRUCTURAL_INTEGRITY = 30;
export const STARTING_HAND_SIZE = 5;
export const OVERPRESSURE_DANGER_THRESHOLD = 5;

const forgeWeights: Record<CardRarity, number> = {
  common: 6,
  uncommon: 5,
  rare: 3,
  epic: 2,
  legendary: 1,
  mythic: 1,
};

const createInstanceId = (ownerId: PlayerId, cardId: string, index: number) => `${ownerId}-${cardId}-${index}-${crypto.randomUUID()}`;

export const createRuntimeCard = (card: Card, ownerId: PlayerId, index: number): RuntimeCard => ({
  ...card,
  instanceId: createInstanceId(ownerId, card.id, index),
  baseId: card.id,
  ownerId,
  owner: ownerId,
  currentAttack: card.attack,
  currentDefense: card.defense,
  maxDefense: card.defense,
  shield: 0,
  statusEffects: [],
  canAttack: false,
  hasActed: false,
  summonSickness: true,
  attackCount: 0,
});

export const shuffleCards = <T,>(items: T[], seedOffset = 0): T[] => {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomBase = Math.sin(index + 1 + seedOffset) * 10000;
    const swapIndex = Math.floor((randomBase - Math.floor(randomBase)) * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
};

const buildDeckSource = (collection: Card[], size = DECK_SIZE): Card[] => {
  const safeCollection = collection.length > 0 ? collection : cardPool.filter((card) => STARTER_UNLOCK_IDS.includes(card.id));
  const source: Card[] = [];

  for (let index = 0; index < size; index += 1) {
    source.push(safeCollection[index % safeCollection.length]);
  }

  return source;
};

export const resolveCollectionCards = (unlockedCardIds: string[]): Card[] => {
  const normalizedIds = unlockedCardIds.length > 0 ? unlockedCardIds : STARTER_UNLOCK_IDS;
  const collection = normalizedIds
    .map((cardId) => cardPool.find((card) => card.id === cardId))
    .filter((card): card is Card => Boolean(card));

  return collection.length > 0 ? collection : cardPool.filter((card) => STARTER_UNLOCK_IDS.includes(card.id));
};

export const resolveDeckCards = (deckIds: string[], unlockedCardIds: string[]): Card[] => {
  const collection = resolveCollectionCards(unlockedCardIds);
  const collectionMap = new Map(collection.map((card) => [card.id, card]));
  const fromDeck = deckIds
    .map((cardId) => collectionMap.get(cardId))
    .filter((card): card is Card => Boolean(card));

  if (fromDeck.length >= DECK_SIZE) {
    return fromDeck.slice(0, DECK_SIZE);
  }

  const fallbackIds = STARTER_DECK_IDS.filter((cardId) => collectionMap.has(cardId));
  const filled = [...fromDeck];
  let index = 0;

  while (filled.length < DECK_SIZE && fallbackIds.length > 0) {
    const fallback = collectionMap.get(fallbackIds[index % fallbackIds.length]);
    if (fallback) filled.push(fallback);
    index += 1;
  }

  while (filled.length < DECK_SIZE) {
    filled.push(collection[index % collection.length]);
    index += 1;
  }

  return filled;
};

export const countDeckCopies = (deckIds: string[], cardId: string) => deckIds.filter((entry) => entry === cardId).length;
export const canAddDeckCard = (deckIds: string[], cardId: string) => deckIds.length < DECK_SIZE && countDeckCopies(deckIds, cardId) < DECK_COPY_LIMIT;

export const pickForgeRewards = (lockedCards: Card[], packSize = FORGE_PACK_SIZE): Card[] => {
  if (lockedCards.length === 0) return [];

  const available = [...lockedCards];
  const results: Card[] = [];
  const count = Math.min(packSize, available.length);

  for (let draw = 0; draw < count; draw += 1) {
    const weightedPool = available.flatMap((card) => Array.from({ length: forgeWeights[card.rarity] ?? 1 }, () => card));
    const seed = (Date.now() + draw * 17) % weightedPool.length;
    const reward = weightedPool[seed] ?? available[0];
    results.push(reward);
    const index = available.findIndex((card) => card.id === reward.id);
    if (index >= 0) available.splice(index, 1);
  }

  return results;
};

export const createDeck = (ownerId: PlayerId, collection: Card[] = cardPool): RuntimeCard[] => {
  const ordered = buildDeckSource(collection).map((card, index) => createRuntimeCard(card, ownerId, index));
  return shuffleCards(ordered, ownerId === "player" ? 1 : 2);
};

export const createPlayerState = (id: PlayerId, name: string, collection?: Card[]): PlayerState => ({
  id,
  name,
  structuralIntegrity: STARTING_STRUCTURAL_INTEGRITY,
  maxStructuralIntegrity: STARTING_STRUCTURAL_INTEGRITY,
  steamPressure: 1,
  maxSteamPressure: 1,
  overpressure: 0,
  shield: 0,
  deck: createDeck(id, collection),
  hand: [],
  board: [],
  graveyard: [],
  pendingStructuralDamage: [],
});

export const initialBattleState = (): BattleState => ({
  selectedAttackerId: null,
  selectedHandCardId: null,
  logs: [],
  winner: null,
  resultRecorded: false,
});

export const initialUiState = (): UIState => ({
  screen: "menu",
  busy: false,
  status: "Os pistoes aguardam seu comando.",
  forgeResults: [],
});

export const createInitialGameState = (): GameState => ({
  phase: "idle",
  turnNumber: 1,
  activePlayer: "player",
  player: createPlayerState("player", defaultProfile.commanderName, resolveDeckCards(defaultProfile.selectedDeck, defaultProfile.unlockedCards)),
  enemy: createPlayerState("enemy", "Automato Soberano", cardPool),
  battle: initialBattleState(),
  profile: defaultProfile,
  settings: defaultSettings,
  auth: defaultAuth,
  hydrated: false,
  ui: initialUiState(),
});

export const cloneCard = (card: RuntimeCard): RuntimeCard => ({
  ...card,
  statusEffects: card.statusEffects.map((status) => ({ ...status })),
});

export const clonePlayer = (player: PlayerState): PlayerState => ({
  ...player,
  deck: player.deck.map(cloneCard),
  hand: player.hand.map(cloneCard),
  board: player.board.map(cloneCard),
  graveyard: player.graveyard.map(cloneCard),
  pendingStructuralDamage: player.pendingStructuralDamage.map((item) => ({ ...item })),
});

export const pushLog = (logs: string[], entry: string): string[] => [entry, ...logs].slice(0, 30);
export const findStatus = (card: RuntimeCard, key: StatusEffect["key"]) => card.statusEffects.find((status) => status.key === key);
export const getStatusValue = (card: RuntimeCard, key: StatusEffect["key"]) => card.statusEffects.filter((status) => status.key === key).reduce((total, status) => total + status.value, 0);

export const upsertStatus = (card: RuntimeCard, status: StatusEffect): RuntimeCard => {
  const existing = card.statusEffects.find((item) => item.key === status.key && item.duration === status.duration);
  if (!existing) {
    return { ...card, statusEffects: [...card.statusEffects, status] };
  }
  return {
    ...card,
    statusEffects: card.statusEffects.map((item) => (item === existing ? { ...item, value: item.value + status.value } : item)),
  };
};

export const tickStatuses = (card: RuntimeCard): RuntimeCard => ({
  ...card,
  currentAttack: Math.max(0, card.attack + getStatusValue(card, "bonusAttack")),
  maxDefense: Math.max(1, card.defense + getStatusValue(card, "bonusDefense")),
  statusEffects: card.statusEffects
    .map((status) => (status.duration === null ? status : { ...status, duration: status.duration - 1 }))
    .filter((status) => status.duration === null || status.duration > 0),
});

export const removeCardFromZone = (cards: RuntimeCard[], instanceId: string) => cards.filter((card) => card.instanceId !== instanceId);
export const findCard = (cards: RuntimeCard[], instanceId: string) => cards.find((card) => card.instanceId === instanceId);
