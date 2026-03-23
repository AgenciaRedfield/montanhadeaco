export type Side = "player" | "enemy";
export type GameScreen = "menu" | "battle" | "victory" | "defeat";
export type TurnPhase = "idle" | "player" | "enemy" | "resolving";
export type CardClass = "support" | "assassin" | "tank" | "engineer";
export type CardRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
export type AbilityType = "criticalStrike" | "steamBurst" | "repair" | "shield" | "overclock";
export type TargetType = "player" | "card";

export interface ApiCard {
  code: string;
  image: string;
  images: {
    svg: string;
    png: string;
  };
  suit: "HEARTS" | "SPADES" | "CLUBS" | "DIAMONDS";
  value: "ACE" | "KING" | "QUEEN" | "JACK" | string;
}

export interface GameCard {
  id: string;
  baseId: string;
  code: string;
  name: string;
  suit: ApiCard["suit"];
  value: ApiCard["value"];
  class: CardClass;
  rarity: CardRarity;
  attack: number;
  defense: number;
  currentDefense: number;
  energyCost: number;
  ability: AbilityType;
  description: string;
  image: string;
  owner: Side;
  hasActed: boolean;
  shield: number;
}

export interface CombatTarget {
  type: TargetType;
  id: string;
  owner: Side;
}

export interface ActorState {
  side: Side;
  name: string;
  structuralIntegrity: number;
  steamPressure: number;
  maxSteamPressure: number;
  shield: number;
  hand: GameCard[];
  board: GameCard[];
  discard: GameCard[];
}
