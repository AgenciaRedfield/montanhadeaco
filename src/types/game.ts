import type { CardClass, CardRarity, PlayerId, RuntimeCard } from "@/types/card";

export type Side = PlayerId;
export type GameCard = RuntimeCard;
export type AbilityType = string;
export type ApiCard = {
  code: string;
  image: string;
  images: {
    svg: string;
    png: string;
  };
  suit: "HEARTS" | "SPADES" | "CLUBS" | "DIAMONDS";
  value: "ACE" | "KING" | "QUEEN" | "JACK" | string;
};
export type { CardClass, CardRarity };
export type GameScreen = "menu" | "dashboard" | "forge" | "deck-builder" | "battle" | "victory" | "defeat" | "admin";
export type GamePhase = "idle" | "startTurn" | "drawPhase" | "resourcePhase" | "mainPhase" | "attackPhase" | "endPhase" | "enemyTurn" | "finished";
export type TurnPhase = "idle" | "player" | "enemy" | "resolving";
export type TargetType = "player" | "card";

export type CombatTarget = {
  type: TargetType;
  id: string;
  owner: PlayerId;
};

export type PendingStructuralDamage = {
  amount: number;
  source: string;
};

export type PlayerState = {
  id: PlayerId;
  name: string;
  structuralIntegrity: number;
  maxStructuralIntegrity: number;
  steamPressure: number;
  maxSteamPressure: number;
  overpressure: number;
  shield: number;
  deck: RuntimeCard[];
  hand: RuntimeCard[];
  board: RuntimeCard[];
  graveyard: RuntimeCard[];
  pendingStructuralDamage: PendingStructuralDamage[];
};

export type BattleState = {
  selectedAttackerId: string | null;
  selectedHandCardId: string | null;
  logs: string[];
  winner: PlayerId | null;
  resultRecorded: boolean;
};

export type ProgressProfile = {
  commanderName: string;
  rank: string;
  level: number;
  forgeCredits: number;
  battlesPlayed: number;
  victories: number;
  unlockedCards: string[];
  selectedDeck: string[];
  lastPlayedAt: string | null;
  cloudEnabled: boolean;
  syncStatus: "idle" | "saving" | "synced" | "local-only" | "error";
};

export type SettingsState = {
  musicEnabled: boolean;
  musicUnlocked: boolean;
  musicVolume: number;
};

export type AuthState = {
  userId: string | null;
  email: string | null;
  initialized: boolean;
  magicLinkSentTo: string | null;
};

export type UIState = {
  screen: GameScreen;
  busy: boolean;
  status: string;
  forgeResults: string[];
};

export type GameState = {
  phase: GamePhase;
  turnNumber: number;
  activePlayer: PlayerId;
  player: PlayerState;
  enemy: PlayerState;
  battle: BattleState;
  profile: ProgressProfile;
  settings: SettingsState;
  auth: AuthState;
  hydrated: boolean;
  ui: UIState;
};
