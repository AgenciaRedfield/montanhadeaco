import type { AbilityType, ApiCard, CardClass, CardRarity } from "@/types/game";

export const suitToClass: Record<ApiCard["suit"], CardClass> = {
  HEARTS: "support",
  SPADES: "assassin",
  CLUBS: "tank",
  DIAMONDS: "engineer",
};

export const suitDisplay: Record<ApiCard["suit"], string> = {
  HEARTS: "Support",
  SPADES: "Assassin",
  CLUBS: "Bulwark",
  DIAMONDS: "Engineer",
};

export const rarityFromValue = (value: ApiCard["value"]): CardRarity => {
  if (["2", "3", "4", "5"].includes(value)) return "common";
  if (["6", "7", "8", "9", "10"].includes(value)) return "uncommon";
  if (value === "JACK") return "rare";
  if (value === "QUEEN") return "epic";
  if (value === "KING") return "legendary";
  return "mythic";
};

export const faceName: Record<string, string> = {
  ACE: "Ace",
  KING: "King",
  QUEEN: "Queen",
  JACK: "Jack",
};

export const abilityDescriptions: Record<AbilityType, string> = {
  criticalStrike: "High-pressure strike with a chance to rupture for bonus damage.",
  steamBurst: "Vents superheated steam into the enemy structure.",
  repair: "Repairs allied plating on deployment.",
  shield: "Converts steel mass into temporary armor.",
  overclock: "Pushes pistons beyond the redline for immediate tempo.",
};
