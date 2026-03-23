import type { Card } from "@/types/card";

export const cards: Card[] = [
  { id: "guardiao-de-ferro", name: "Guardião de Ferro", class: "tank", rarity: "common", attack: 2, defense: 8, energyCost: 3, ability: "taunt", description: "Atrai ataques inimigos para sua estrutura reforçada." },
  { id: "colosso-de-aco", name: "Colosso de Aço", class: "tank", rarity: "legendary", attack: 4, defense: 10, energyCost: 6, ability: "shield", description: "Recebe blindagem extra ao ser mobilizado." },
  { id: "sentinela-blindada", name: "Sentinela Blindada", class: "tank", rarity: "uncommon", attack: 3, defense: 6, energyCost: 4, ability: "reduceDamage", description: "Amortece impacto com redução de dano permanente." },
  { id: "automato-defensor", name: "Autômato Defensor", class: "tank", rarity: "common", attack: 2, defense: 5, energyCost: 2, ability: "shield", description: "Entra em campo com escudo de vapor." },
  { id: "torre-mecanica", name: "Torre Mecânica", class: "tank", rarity: "uncommon", attack: 1, defense: 7, energyCost: 3, ability: "passiveDamage", description: "Dispara dano passivo a cada início de turno aliado." },
  { id: "assassino-do-veu-de-vapor", name: "Assassino do Véu de Vapor", class: "assassin", rarity: "rare", attack: 6, defense: 2, energyCost: 3, ability: "criticalEntry", description: "Primeiro ataque causa dano crítico e evita o primeiro golpe recebido." },
  { id: "duelista-aetherblade", name: "Duelista Aetherblade", class: "assassin", rarity: "rare", attack: 5, defense: 3, energyCost: 3, ability: "ignoreDefense", description: "Perfura defesa e aplica dano adicional direto." },
  { id: "executor-sombrio", name: "Executor Sombrio", class: "assassin", rarity: "epic", attack: 7, defense: 2, energyCost: 4, ability: "execute", description: "Executa unidades com integridade baixa." },
  { id: "sabotador-mecanico", name: "Sabotador Mecânico", class: "assassin", rarity: "uncommon", attack: 4, defense: 3, energyCost: 3, ability: "steamSabotage", description: "Reduz a Pressão de Vapor inimiga ao entrar." },
  { id: "lamina-fantasma", name: "Lâmina Fantasma", class: "assassin", rarity: "common", attack: 5, defense: 1, energyCost: 2, ability: "dodge", description: "Desvia do primeiro ataque recebido." },
  { id: "medico-do-vapor", name: "Médico do Vapor", class: "support", rarity: "common", attack: 1, defense: 4, energyCost: 2, ability: "healAlly", description: "Restaura a unidade aliada mais danificada." },
  { id: "engenheira-restauradora", name: "Engenheira Restauradora", class: "support", rarity: "uncommon", attack: 2, defense: 5, energyCost: 3, ability: "repair", description: "Repara um aliado e reforça sua estrutura." },
  { id: "curandeira-industrial", name: "Curandeira Industrial", class: "support", rarity: "rare", attack: 1, defense: 6, energyCost: 3, ability: "healAll", description: "Cura toda a linha aliada e parte da estrutura." },
  { id: "supervisora-de-nucleo", name: "Supervisora de Núcleo", class: "support", rarity: "uncommon", attack: 2, defense: 4, energyCost: 2, ability: "energyBoost", description: "Gera Pressão de Vapor adicional imediatamente." },
  { id: "tecnico-de-campo", name: "Técnico de Campo", class: "support", rarity: "common", attack: 2, defense: 3, energyCost: 1, ability: "quickRepair", description: "Pequeno reparo rápido com baixo custo." },
  { id: "engenheiro-supremo-da-forja-central", name: "Engenheiro Supremo da Forja Central", class: "engineer", rarity: "legendary", attack: 3, defense: 5, energyCost: 4, ability: "consumeOverpressure", description: "Converte Overpressure em bônus para aliados." },
  { id: "torre-de-vapor-mk1", name: "Torre de Vapor Mk.I", class: "engineer", rarity: "common", attack: 3, defense: 3, energyCost: 2, ability: "passiveDamage", description: "Causa dano passivo contínuo." },
  { id: "canhao-aether", name: "Canhão Aether", class: "engineer", rarity: "epic", attack: 6, defense: 2, energyCost: 4, ability: "steamBurst", description: "Explosão de vapor causa dano direto e pressão adicional." },
  { id: "automato-overclockado", name: "Autômato Overclockado", class: "engineer", rarity: "rare", attack: 5, defense: 4, energyCost: 4, ability: "overpressureGrowth", description: "Escala com Overpressure armazenado." },
  { id: "nucleo-instavel", name: "Núcleo Instável", class: "engineer", rarity: "legendary", attack: 8, defense: 1, energyCost: 5, ability: "deathExplosion", description: "Explode ao morrer e pune tudo ao redor." },
];

export const startingCards = cards;