export type CardClass = "tank" | "assassin" | "support" | "engineer";
export type CardRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type CardEffectContext = {
  self: CardInstance;
  allies: CardInstance[];
  enemies: CardInstance[];
  player: CombatActor;
  enemy: CombatActor;
  overpressure: number;
  turn: number;
  flags: Record<string, boolean | number>;
  dealDamage: (target: CardInstance | CombatActor, amount: number, source?: CardInstance) => void;
  heal: (target: CardInstance | CombatActor, amount: number) => void;
  addShield: (target: CardInstance | CombatActor, amount: number) => void;
  buffAttack: (target: CardInstance, amount: number) => void;
  buffDefense: (target: CardInstance, amount: number) => void;
  reduceSteamPressure: (target: CombatActor, amount: number) => void;
  gainSteamPressure: (target: CombatActor, amount: number) => void;
  gainOverpressure: (amount: number) => void;
  consumeOverpressure: (amount: number) => number;
  queueDelayedStructuralDamage: (target: CombatActor, amount: number) => void;
};

export type CombatActor = {
  id: string;
  name: string;
  structuralIntegrity: number;
  steamPressure: number;
  shield?: number;
};

export type CardInstance = {
  id: string;
  baseId: string;
  name: string;
  attack: number;
  defense: number;
  currentDefense: number;
  shield?: number;
  flags: Record<string, boolean | number>;
};

export type CardBehavior = (context: CardEffectContext) => void;

export type Card = {
  id: string;
  name: string;
  class: "tank" | "assassin" | "support" | "engineer";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  attack: number;
  defense: number;
  energyCost: number;
  ability: string;
  description: string;
  onPlay?: CardBehavior;
  onAttack?: CardBehavior;
  onDeath?: CardBehavior;
  passive?: CardBehavior;
};

const firstEnemy = (context: CardEffectContext) => context.enemies[0];
const lowestDefenseEnemy = (context: CardEffectContext) => [...context.enemies].sort((a, b) => a.currentDefense - b.currentDefense)[0];
const strongestAlly = (context: CardEffectContext) => [...context.allies].sort((a, b) => b.attack - a.attack)[0];
const weakestAlly = (context: CardEffectContext) => [...context.allies].sort((a, b) => a.currentDefense - b.currentDefense)[0];

const createCard = (card: Card): Card => card;

const dealPassiveDamage = (amount: number): CardBehavior => (context) => {
  const target = lowestDefenseEnemy(context);
  if (!target) return;
  context.dealDamage(target, amount, context.self);
};

const healLowestAlly = (amount: number): CardBehavior => (context) => {
  const target = weakestAlly(context) ?? context.player;
  context.heal(target, amount);
};

const shieldSelf = (amount: number): CardBehavior => (context) => {
  context.addShield(context.self, amount);
};

const reduceIncomingDamage = (amount: number): CardBehavior => (context) => {
  context.addShield(context.self, amount);
};

export const cards: Card[] = [
  createCard({
    id: "guardiao-de-ferro",
    name: "Guardião de Ferro",
    class: "tank",
    rarity: "common",
    attack: 2,
    defense: 8,
    energyCost: 3,
    ability: "taunt",
    description: "Entra em combate atraindo os ataques inimigos para sua carcaça reforçada.",
    onPlay: (context) => {
      context.self.flags.taunt = true;
      context.addShield(context.self, 1);
    },
    passive: (context) => {
      context.self.flags.taunt = true;
    },
  }),
  createCard({
    id: "colosso-de-aco",
    name: "Colosso de Aço",
    class: "tank",
    rarity: "legendary",
    attack: 4,
    defense: 10,
    energyCost: 6,
    ability: "shield",
    description: "Converte pressão em placas extras, ganhando uma barreira espessa ao entrar.",
    onPlay: shieldSelf(4),
    passive: shieldSelf(1),
  }),
  createCard({
    id: "sentinela-blindada",
    name: "Sentinela Blindada",
    class: "tank",
    rarity: "uncommon",
    attack: 3,
    defense: 6,
    energyCost: 4,
    ability: "reduce damage",
    description: "Amortece impactos com escudos cinéticos e reduz o dano recebido.",
    onPlay: reduceIncomingDamage(2),
    passive: reduceIncomingDamage(1),
  }),
  createCard({
    id: "automato-defensor",
    name: "Autômato Defensor",
    class: "tank",
    rarity: "common",
    attack: 2,
    defense: 5,
    energyCost: 2,
    ability: "shield",
    description: "Desce para a plataforma industrial já com proteção de vapor comprimido.",
    onPlay: shieldSelf(2),
  }),
  createCard({
    id: "torre-mecanica",
    name: "Torre Mecânica",
    class: "tank",
    rarity: "uncommon",
    attack: 1,
    defense: 7,
    energyCost: 3,
    ability: "passive damage",
    description: "Dispara rajadas automáticas contra a frente inimiga a cada ciclo.",
    passive: dealPassiveDamage(1),
  }),
  createCard({
    id: "assassino-do-veu-de-vapor",
    name: "Assassino do Véu de Vapor",
    class: "assassin",
    rarity: "rare",
    attack: 6,
    defense: 2,
    energyCost: 3,
    ability: "critical strike first hit",
    description: "Seu primeiro golpe sai das sombras com dano ampliado.",
    onAttack: (context) => {
      if (context.self.flags.firstCriticalSpent) return;
      const target = firstEnemy(context);
      if (!target) return;
      context.self.flags.firstCriticalSpent = true;
      context.dealDamage(target, 3, context.self);
    },
  }),
  createCard({
    id: "duelista-aetherblade",
    name: "Duelista Aetherblade",
    class: "assassin",
    rarity: "rare",
    attack: 5,
    defense: 3,
    energyCost: 3,
    ability: "ignore defense",
    description: "Suas lâminas de éter perfuram blindagem e atingem o núcleo interno.",
    onAttack: (context) => {
      context.dealDamage(context.enemy, 2, context.self);
    },
  }),
  createCard({
    id: "executor-sombrio",
    name: "Executor Sombrio",
    class: "assassin",
    rarity: "epic",
    attack: 7,
    defense: 2,
    energyCost: 4,
    ability: "execute low HP",
    description: "Finaliza alvos fragilizados no momento em que sua estrutura vacila.",
    onAttack: (context) => {
      const target = lowestDefenseEnemy(context);
      if (!target || target.currentDefense > 3) return;
      context.dealDamage(target, 99, context.self);
    },
  }),
  createCard({
    id: "sabotador-mecanico",
    name: "Sabotador Mecânico",
    class: "assassin",
    rarity: "uncommon",
    attack: 4,
    defense: 3,
    energyCost: 3,
    ability: "reduce enemy energy",
    description: "Interfere nas válvulas adversárias e rouba pressão útil do próximo turno.",
    onPlay: (context) => {
      context.reduceSteamPressure(context.enemy, 1);
      context.gainOverpressure(1);
    },
  }),
  createCard({
    id: "lamina-fantasma",
    name: "Lâmina Fantasma",
    class: "assassin",
    rarity: "common",
    attack: 5,
    defense: 1,
    energyCost: 2,
    ability: "dodge first attack",
    description: "Evade completamente o primeiro contra-ataque que tentarem desferir.",
    onPlay: (context) => {
      context.self.flags.dodgeFirstAttack = true;
    },
    passive: (context) => {
      if (!context.self.flags.dodgeFirstAttack) return;
      context.addShield(context.self, 999);
      context.self.flags.dodgeFirstAttack = false;
    },
  }),
  createCard({
    id: "medico-do-vapor",
    name: "Médico do Vapor",
    class: "support",
    rarity: "common",
    attack: 1,
    defense: 4,
    energyCost: 2,
    ability: "heal ally",
    description: "Aplica reparos rápidos e devolve integridade a um aliado danificado.",
    onPlay: healLowestAlly(3),
  }),
  createCard({
    id: "engenheira-restauradora",
    name: "Engenheira Restauradora",
    class: "support",
    rarity: "uncommon",
    attack: 2,
    defense: 5,
    energyCost: 3,
    ability: "repair",
    description: "Reforja placas e devolve solidez à sua linha de frente.",
    onPlay: (context) => {
      const target = weakestAlly(context) ?? context.player;
      context.heal(target, 2);
      if ("currentDefense" in target) {
        context.buffDefense(target, 2);
      }
    },
  }),
  createCard({
    id: "curandeira-industrial",
    name: "Curandeira Industrial",
    class: "support",
    rarity: "rare",
    attack: 1,
    defense: 6,
    energyCost: 3,
    ability: "heal all",
    description: "Abre múltiplos canais de manutenção e estabiliza toda a operação.",
    onPlay: (context) => {
      context.heal(context.player, 2);
      context.allies.forEach((ally) => context.heal(ally, 2));
    },
  }),
  createCard({
    id: "supervisora-de-nucleo",
    name: "Supervisora de Núcleo",
    class: "support",
    rarity: "uncommon",
    attack: 2,
    defense: 4,
    energyCost: 2,
    ability: "energy boost",
    description: "Realinha o fluxo da fornalha e injeta mais Pressão de Vapor no turno.",
    onPlay: (context) => {
      context.gainSteamPressure(context.player, 2);
    },
  }),
  createCard({
    id: "tecnico-de-campo",
    name: "Técnico de Campo",
    class: "support",
    rarity: "common",
    attack: 2,
    defense: 3,
    energyCost: 1,
    ability: "quick repair",
    description: "Faz um reparo de emergência e mantém a linha viva por pouco custo.",
    onPlay: healLowestAlly(2),
    onDeath: (context) => {
      context.heal(context.player, 1);
    },
  }),
  createCard({
    id: "engenheiro-supremo-da-forja-central",
    name: "Engenheiro Supremo da Forja Central",
    class: "engineer",
    rarity: "legendary",
    attack: 3,
    defense: 5,
    energyCost: 4,
    ability: "consume Overpressure to buff allies",
    description: "Drena o excesso da caldeira e converte Overpressure em força coletiva.",
    onPlay: (context) => {
      const consumed = context.consumeOverpressure(3);
      if (consumed <= 0) return;
      context.allies.forEach((ally) => {
        context.buffAttack(ally, consumed);
        context.buffDefense(ally, consumed);
      });
    },
  }),
  createCard({
    id: "torre-de-vapor-mk1",
    name: "Torre de Vapor Mk.I",
    class: "engineer",
    rarity: "common",
    attack: 3,
    defense: 3,
    energyCost: 2,
    ability: "passive damage",
    description: "Bombardeia a linha inimiga de forma automática com microexplosões de vapor.",
    passive: dealPassiveDamage(2),
  }),
  createCard({
    id: "canhao-aether",
    name: "Canhão Aether",
    class: "engineer",
    rarity: "epic",
    attack: 6,
    defense: 2,
    energyCost: 4,
    ability: "steam burst",
    description: "Carrega um disparo condensado que explode ao entrar em operação.",
    onPlay: (context) => {
      context.dealDamage(context.enemy, 3, context.self);
    },
    onAttack: (context) => {
      const target = firstEnemy(context);
      if (!target) return;
      context.dealDamage(target, 2, context.self);
    },
  }),
  createCard({
    id: "automato-overclockado",
    name: "Autômato Overclockado",
    class: "engineer",
    rarity: "rare",
    attack: 5,
    defense: 4,
    energyCost: 4,
    ability: "gains power from Overpressure",
    description: "Transforma o excesso de pressão em potência de ataque devastadora.",
    onPlay: (context) => {
      const consumed = context.consumeOverpressure(2);
      if (consumed <= 0) return;
      context.buffAttack(context.self, consumed * 2);
    },
    passive: (context) => {
      if (context.overpressure <= 0) return;
      context.buffAttack(context.self, 1);
    },
  }),
  createCard({
    id: "nucleo-instavel",
    name: "Núcleo Instável",
    class: "engineer",
    rarity: "legendary",
    attack: 8,
    defense: 1,
    energyCost: 5,
    ability: "explode on death",
    description: "Quando é destruído, libera uma onda térmica que castiga toda a frente inimiga.",
    onDeath: (context) => {
      context.enemies.forEach((enemyCard) => context.dealDamage(enemyCard, 3, context.self));
      context.dealDamage(context.enemy, 2, context.self);
      context.queueDelayedStructuralDamage(context.player, 2);
    },
  }),
];

export const startingCards = cards;
