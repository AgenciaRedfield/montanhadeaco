import { cards as cardPool } from "@/data/cards";
import type { Card, PlayerId, RuntimeCard, StatusEffect } from "@/types/card";
import type { BattleState, GameState, PlayerState, UIState } from "@/types/game";

export const MAX_HAND_SIZE = 10;
export const MAX_BOARD_SIZE = 5;
export const MAX_STEAM_PRESSURE = 10;
export const STARTING_STRUCTURAL_INTEGRITY = 30;
export const STARTING_HAND_SIZE = 5;
export const OVERPRESSURE_DANGER_THRESHOLD = 5;

const createInstanceId = (ownerId: PlayerId, cardId: string, index: number) => `${ownerId}-${cardId}-${index}-${crypto.randomUUID()}`;

export const createRuntimeCard = (card: Card, ownerId: PlayerId, index: number): RuntimeCard => ({
  ...card,
  instanceId: createInstanceId(ownerId, card.id, index),
  baseId: card.id,
  ownerId,
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

export const createDeck = (ownerId: PlayerId): RuntimeCard[] => {
  const ordered = cardPool.map((card, index) => createRuntimeCard(card, ownerId, index));
  return shuffleCards(ordered, ownerId === "player" ? 1 : 2);
};

export const createPlayerState = (id: PlayerId, name: string): PlayerState => ({
  id,
  name,
  structuralIntegrity: STARTING_STRUCTURAL_INTEGRITY,
  maxStructuralIntegrity: STARTING_STRUCTURAL_INTEGRITY,
  steamPressure: 1,
  maxSteamPressure: 1,
  overpressure: 0,
  shield: 0,
  deck: createDeck(id),
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
});

export const initialUiState = (): UIState => ({
  screen: "menu",
  busy: false,
  status: "Os pistoes aguardam seu comando.",
});

export const createInitialGameState = (): GameState => ({
  phase: "idle",
  turnNumber: 1,
  activePlayer: "player",
  player: createPlayerState("player", "Comandante da Forja"),
  enemy: createPlayerState("enemy", "Automato Soberano"),
  battle: initialBattleState(),
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

export const getStatusValue = (card: RuntimeCard, key: StatusEffect["key"]) =>
  card.statusEffects.filter((status) => status.key === key).reduce((total, status) => total + status.value, 0);

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