const cardArtModules = import.meta.glob("@/assets/cards/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

import type { Card } from "@/types/card";

const normalizeAssetKey = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

const artLibrary = Object.entries(cardArtModules).reduce<Record<string, string>>((library, [path, image]) => {
  const fileName = path.split("/").pop()?.replace(/\.[^.]+$/, "") ?? path;
  library[normalizeAssetKey(fileName)] = image;
  return library;
}, {});

const getCardArt = (...aliases: string[]) => {
  for (const alias of aliases) {
    const match = artLibrary[normalizeAssetKey(alias)];
    if (match) return match;
  }
  return undefined;
};

export const cards: Card[] = [
  { id: "guardiao-de-ferro", name: "Guardiao de Ferro", class: "tank", rarity: "common", attack: 2, defense: 8, energyCost: 3, ability: "taunt", description: "Atrai ataques inimigos para sua estrutura reforcada.", image: getCardArt("Guardiao de Ferro") },
  { id: "colosso-de-aco", name: "Colosso de Aco", class: "tank", rarity: "legendary", attack: 4, defense: 10, energyCost: 6, ability: "shield", description: "Recebe blindagem extra ao ser mobilizado.", image: getCardArt("Colosso do Nucleo de Aco", "Colosso de Aco") },
  { id: "sentinela-blindada", name: "Sentinela Blindada", class: "tank", rarity: "uncommon", attack: 3, defense: 6, energyCost: 4, ability: "reduceDamage", description: "Amortece impacto com reducao de dano permanente.", image: getCardArt("Sentinela Blindada") },
  { id: "automato-defensor", name: "Automato Defensor", class: "tank", rarity: "common", attack: 2, defense: 5, energyCost: 2, ability: "shield", description: "Entra em campo com escudo de vapor." },
  { id: "torre-mecanica", name: "Torre Mecanica", class: "tank", rarity: "uncommon", attack: 1, defense: 7, energyCost: 3, ability: "passiveDamage", description: "Dispara dano passivo a cada inicio de turno aliado.", image: getCardArt("Torre Mecanica de Defesa", "Torre Mecanica") },
  { id: "assassino-do-veu-de-vapor", name: "Assassino do Veu de Vapor", class: "assassin", rarity: "rare", attack: 6, defense: 2, energyCost: 3, ability: "criticalEntry", description: "Primeiro ataque causa dano critico e evita o primeiro golpe recebido.", image: getCardArt("Assassino do Veu de Vapor") },
  { id: "duelista-aetherblade", name: "Duelista Aetherblade", class: "assassin", rarity: "rare", attack: 5, defense: 3, energyCost: 3, ability: "ignoreDefense", description: "Perfura defesa e aplica dano adicional direto.", image: getCardArt("Duelista Aetherblade") },
  { id: "executor-sombrio", name: "Executor Sombrio", class: "assassin", rarity: "epic", attack: 7, defense: 2, energyCost: 4, ability: "execute", description: "Executa unidades com integridade baixa." },
  { id: "sabotador-mecanico", name: "Sabotador Mecanico", class: "assassin", rarity: "uncommon", attack: 4, defense: 3, energyCost: 3, ability: "steamSabotage", description: "Reduz a Pressao de Vapor inimiga ao entrar.", image: getCardArt("Sabotador de Linhas de Vapor", "Sabotador Mecanico") },
  { id: "lamina-fantasma", name: "Lamina Fantasma", class: "assassin", rarity: "common", attack: 5, defense: 1, energyCost: 2, ability: "dodge", description: "Desvia do primeiro ataque recebido." },
  { id: "medico-do-vapor", name: "Medico do Vapor", class: "support", rarity: "common", attack: 1, defense: 4, energyCost: 2, ability: "healAlly", description: "Restaura a unidade aliada mais danificada." },
  { id: "engenheira-restauradora", name: "Engenheira Restauradora", class: "support", rarity: "uncommon", attack: 2, defense: 5, energyCost: 3, ability: "repair", description: "Repara um aliado e reforca sua estrutura." },
  { id: "curandeira-industrial", name: "Curandeira Industrial", class: "support", rarity: "rare", attack: 1, defense: 6, energyCost: 3, ability: "healAll", description: "Cura toda a linha aliada e parte da estrutura.", image: getCardArt("Curandeira da Caldeira Central", "Curandeira Industrial") },
  { id: "supervisora-de-nucleo", name: "Supervisora de Nucleo", class: "support", rarity: "uncommon", attack: 2, defense: 4, energyCost: 2, ability: "energyBoost", description: "Gera Pressao de Vapor adicional imediatamente." },
  { id: "tecnico-de-campo", name: "Tecnico de Campo", class: "support", rarity: "common", attack: 2, defense: 3, energyCost: 1, ability: "quickRepair", description: "Pequeno reparo rapido com baixo custo." },
  { id: "engenheiro-supremo-da-forja-central", name: "Engenheiro Supremo da Forja Central", class: "engineer", rarity: "legendary", attack: 3, defense: 5, energyCost: 4, ability: "consumeOverpressure", description: "Converte Overpressure em bonus para aliados.", image: getCardArt("Engenheiro Supremo - Forja Central", "Engenheiro Supremo da Forja Central") },
  { id: "torre-de-vapor-mk1", name: "Torre de Vapor Mk.I", class: "engineer", rarity: "common", attack: 3, defense: 3, energyCost: 2, ability: "passiveDamage", description: "Causa dano passivo continuo." },
  { id: "canhao-aether", name: "Canhao Aether", class: "engineer", rarity: "epic", attack: 6, defense: 2, energyCost: 4, ability: "steamBurst", description: "Explosao de vapor causa dano direto e pressao adicional." },
  { id: "automato-overclockado", name: "Automato Overclockado", class: "engineer", rarity: "rare", attack: 5, defense: 4, energyCost: 4, ability: "overpressureGrowth", description: "Escala com Overpressure armazenado." },
  { id: "nucleo-instavel", name: "Nucleo Instavel", class: "engineer", rarity: "legendary", attack: 8, defense: 1, energyCost: 5, ability: "deathExplosion", description: "Explode ao morrer e pune tudo ao redor." },
];

export const startingCards = cards;
