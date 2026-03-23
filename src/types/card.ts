export type PlayerId = "player" | "enemy";
export type CardClass = "tank" | "assassin" | "support" | "engineer";
export type CardRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
export type StatusKey = "shield" | "taunt" | "dodge" | "stun" | "bonusAttack" | "bonusDefense" | "damageReduction" | "passiveDamage";

export type StatusEffect = {
  key: StatusKey;
  value: number;
  duration: number | null;
  source?: string;
};

export type Card = {
  id: string;
  name: string;
  class: CardClass;
  rarity: CardRarity;
  attack: number;
  defense: number;
  energyCost: number;
  ability: string;
  description: string;
  image?: string;
};

export type RuntimeCard = Card & {
  instanceId: string;
  baseId: string;
  ownerId: PlayerId;
  owner?: PlayerId;
  currentAttack: number;
  currentDefense: number;
  maxDefense: number;
  shield: number;
  statusEffects: StatusEffect[];
  canAttack: boolean;
  hasActed: boolean;
  summonSickness: boolean;
  attackCount: number;
  code?: string;
  suit?: string;
  value?: string;
};
