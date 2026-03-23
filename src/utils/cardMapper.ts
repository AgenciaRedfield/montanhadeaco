import { abilityDescriptions, faceName, rarityFromValue, suitDisplay, suitToClass } from "@/data/cardMappings";
import type { AbilityType, ApiCard, CardRarity, GameCard, Side } from "@/types/game";

const rarityStats: Record<CardRarity, { attack: number; defense: number; cost: number }> = {
  common: { attack: 2, defense: 3, cost: 1 },
  uncommon: { attack: 3, defense: 4, cost: 2 },
  rare: { attack: 4, defense: 5, cost: 3 },
  epic: { attack: 5, defense: 6, cost: 4 },
  legendary: { attack: 6, defense: 8, cost: 5 },
  mythic: { attack: 7, defense: 9, cost: 6 },
};

const classModifiers = {
  support: { attack: -1, defense: 1, cost: 0 },
  assassin: { attack: 2, defense: -1, cost: 0 },
  tank: { attack: 0, defense: 2, cost: 1 },
  engineer: { attack: 1, defense: 0, cost: 0 },
} as const;

const getAbility = (card: ApiCard): AbilityType => {
  if (card.suit === "HEARTS") return "repair";
  if (card.suit === "SPADES") return "criticalStrike";
  if (card.suit === "CLUBS") return "shield";
  if (card.value === "ACE" || card.value === "KING") return "overclock";
  return "steamBurst";
};

export const mapApiCardToGameCard = (card: ApiCard, owner: Side): GameCard => {
  const rarity = rarityFromValue(card.value);
  const cardClass = suitToClass[card.suit];
  const ability = getAbility(card);
  const classBuff = classModifiers[cardClass];
  const base = rarityStats[rarity];
  const displayValue = faceName[card.value] ?? card.value;
  const displaySuit = suitDisplay[card.suit];
  const attack = Math.max(1, base.attack + classBuff.attack);
  const defense = Math.max(1, base.defense + classBuff.defense);

  return {
    id: card.code,
    instanceId: `${owner}-${card.code}-${crypto.randomUUID()}`,
    baseId: card.code,
    ownerId: owner,
    owner,
    code: card.code,
    name: `${displayValue} of ${displaySuit}`,
    suit: card.suit,
    value: card.value,
    class: cardClass,
    rarity,
    attack,
    defense,
    currentAttack: attack,
    currentDefense: defense,
    maxDefense: defense,
    energyCost: Math.min(8, Math.max(1, base.cost + classBuff.cost)),
    ability,
    description: abilityDescriptions[ability],
    image: card.images.png,
    shield: 0,
    statusEffects: [],
    canAttack: false,
    hasActed: false,
    summonSickness: true,
    attackCount: 0,
  };
};

const fallbackSuits: ApiCard["suit"][] = ["HEARTS", "SPADES", "CLUBS", "DIAMONDS"];
const fallbackValues = ["ACE", "KING", "QUEEN", "JACK", "10", "9", "8", "7", "6", "5", "4", "3", "2"];

export const buildFallbackDeck = (): ApiCard[] => {
  return fallbackSuits.flatMap((suit) =>
    fallbackValues.map((value, index) => ({
      code: `${suit[0]}${value[0]}${index}`,
      image: "",
      images: { png: "", svg: "" },
      suit,
      value,
    })),
  );
};