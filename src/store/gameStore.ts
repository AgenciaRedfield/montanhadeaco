import { create } from "zustand";
import { createDeck, drawCards, reshuffle } from "@/services/deckApi";
import { useBattleStore } from "@/store/battleStore";
import { useEnemyStore } from "@/store/enemyStore";
import { usePlayerStore } from "@/store/playerStore";
import { useUiStore } from "@/store/uiStore";
import type { CombatTarget, GameCard, Side } from "@/types/game";

interface GameStore {
  deckId: string | null;
  remainingCards: number;
  startGame: () => Promise<void>;
  drawCard: (side: Side, count?: number) => Promise<void>;
  playCard: (side: Side, cardId: string) => void;
  attack: (attackerId: string, target: CombatTarget) => void;
  endTurn: () => Promise<void>;
  enemyTurn: () => Promise<void>;
}

const getActorStore = (side: Side) => (side === "player" ? usePlayerStore : useEnemyStore);
const getOpponentSide = (side: Side): Side => (side === "player" ? "enemy" : "player");

const resolveAbilityOnPlay = (card: GameCard, side: Side) => {
  const actor = getActorStore(side).getState();
  const opponent = getActorStore(getOpponentSide(side)).getState();
  const battle = useBattleStore.getState();

  switch (card.ability) {
    case "repair":
      actor.heal(2);
      battle.pushLog(`${card.name} repairs 2 Structural Integrity.`);
      break;
    case "shield":
      actor.addShield(2);
      battle.pushLog(`${card.name} raises 2 shield.`);
      break;
    case "overclock":
      actor.updateBoardCard(card.id, (current) => ({
        ...current,
        attack: current.attack + 1,
        currentDefense: current.currentDefense + 1,
      }));
      battle.pushLog(`${card.name} enters overclock and gains +1/+1.`);
      break;
    case "steamBurst":
      opponent.takeDamage(2);
      battle.pushLog(`${card.name} vents steam for 2 direct damage.`);
      break;
    default:
      break;
  }
};

const markCardAsActed = (side: Side, cardId: string) => {
  getActorStore(side).getState().updateBoardCard(cardId, (card) => ({ ...card, hasActed: true }));
};

const cleanupDestroyed = () => {
  const player = usePlayerStore.getState();
  const enemy = useEnemyStore.getState();
  const battle = useBattleStore.getState();

  player.board.filter((card) => card.currentDefense <= 0).forEach((card) => {
    player.removeBoardCard(card.id);
    battle.pushLog(`${card.name} collapses into scrap.`);
  });

  enemy.board.filter((card) => card.currentDefense <= 0).forEach((card) => {
    enemy.removeBoardCard(card.id);
    battle.pushLog(`${card.name} is crushed under pressure.`);
  });
};

const updateWinner = () => {
  const player = usePlayerStore.getState();
  const enemy = useEnemyStore.getState();
  const battle = useBattleStore.getState();
  const ui = useUiStore.getState();

  if (player.structuralIntegrity <= 0) {
    battle.setWinner("enemy");
    ui.setScreen("defeat");
    ui.setStatus("The Mountain of Steel falls silent.");
  } else if (enemy.structuralIntegrity <= 0) {
    battle.setWinner("player");
    ui.setScreen("victory");
    ui.setStatus("The furnace answers only to your command.");
  }
};

const damageUnit = (side: Side, cardId: string, amount: number) => {
  getActorStore(side).getState().updateBoardCard(cardId, (card) => {
    const absorbed = Math.min(card.shield, amount);
    const finalDamage = Math.max(0, amount - absorbed);
    return {
      ...card,
      shield: Math.max(0, card.shield - amount),
      currentDefense: card.currentDefense - finalDamage,
    };
  });
};

const abilityAttackModifier = (card: GameCard) => {
  switch (card.ability) {
    case "criticalStrike":
      return Math.random() < 0.4 ? card.attack + 2 : card.attack;
    case "overclock":
      return card.attack + 1;
    default:
      return card.attack;
  }
};

const startTurn = async (side: Side, opening = false) => {
  const battle = useBattleStore.getState();
  const ui = useUiStore.getState();
  const actor = getActorStore(side).getState();

  battle.setTurn(side);
  battle.selectAttacker(null);
  actor.refreshBoard();

  if (!opening) {
    actor.replenishSteam(false);
    await useGameStore.getState().drawCard(side, 1);
  } else {
    actor.replenishSteam(true);
  }

  ui.setStatus(
    side === "player"
      ? "Your Steam Pressure is primed. Command the Industrial Platform."
      : "Enemy gears bite down and pressure rises.",
  );
};

const executeEnemyActions = async () => {
  const enemy = useEnemyStore.getState();
  const player = usePlayerStore.getState();

  const playable = [...enemy.hand]
    .filter((card) => card.energyCost <= enemy.steamPressure && enemy.board.length < 5)
    .sort((a, b) => {
      const aScore = a.attack + a.defense + (enemy.structuralIntegrity <= 12 && (a.ability === "repair" || a.ability === "shield") ? 4 : 0);
      const bScore = b.attack + b.defense + (enemy.structuralIntegrity <= 12 && (b.ability === "repair" || b.ability === "shield") ? 4 : 0);
      return bScore - aScore;
    });

  for (const card of playable) {
    if (useEnemyStore.getState().steamPressure < card.energyCost || useEnemyStore.getState().board.length >= 5) continue;
    useGameStore.getState().playCard("enemy", card.id);
  }

  const enemyBoard = [...useEnemyStore.getState().board].sort((a, b) => b.attack - a.attack);

  for (const attacker of enemyBoard) {
    const latest = useEnemyStore.getState().board.find((card) => card.id === attacker.id);
    if (!latest || latest.hasActed) continue;

    const currentPlayer = usePlayerStore.getState();
    const refreshedBoard = [...currentPlayer.board].sort((a, b) => a.currentDefense - b.currentDefense);
    const lethal = latest.attack >= currentPlayer.structuralIntegrity + currentPlayer.shield;

    if (lethal || refreshedBoard.length === 0) {
      useGameStore.getState().attack(latest.id, { type: "player", id: "player-core", owner: "player" });
      if (useBattleStore.getState().winner) return;
      continue;
    }

    const target =
      refreshedBoard.find((card) => card.attack >= latest.currentDefense) ??
      refreshedBoard.find((card) => card.currentDefense <= latest.attack) ??
      refreshedBoard[0];

    if (target) {
      useGameStore.getState().attack(latest.id, { type: "card", id: target.id, owner: "player" });
      if (useBattleStore.getState().winner) return;
    }
  }
};

export const useGameStore = create<GameStore>((set, get) => ({
  deckId: null,
  remainingCards: 0,
  startGame: async () => {
    const ui = useUiStore.getState();
    const battle = useBattleStore.getState();
    const player = usePlayerStore.getState();
    const enemy = useEnemyStore.getState();

    ui.setBusy(true);
    ui.setScreen("menu");
    ui.setStatus("Pressurizing the Mountain of Steel...");
    player.reset();
    enemy.reset();
    battle.reset();

    const deck = await createDeck();
    set({ deckId: deck.deckId, remainingCards: deck.remaining });

    const playerDraw = await drawCards(deck.deckId, 5, "player");
    const enemyDraw = await drawCards(deck.deckId, 5, "enemy");

    player.setHand(playerDraw.cards);
    enemy.setHand(enemyDraw.cards);
    set({ remainingCards: Math.min(playerDraw.remaining, enemyDraw.remaining) });

    ui.setScreen("battle");
    ui.setBusy(false);
    battle.pushLog("Valves crack open. Battle begins.");
    await startTurn("player", true);
  },
  drawCard: async (side, count = 1) => {
    const { deckId, remainingCards } = get();
    if (remainingCards <= count) {
      await reshuffle(deckId);
    }

    const actor = getActorStore(side).getState();
    const drawn = await drawCards(deckId, count, side);
    actor.drawToHand(drawn.cards);
    set({ remainingCards: drawn.remaining });
    useBattleStore.getState().pushLog(`${side === "player" ? "Your foundry" : "Enemy boiler"} draws ${count} card(s).`);
  },
  playCard: (side, cardId) => {
    const actorStore = getActorStore(side);
    const actor = actorStore.getState();
    const ui = useUiStore.getState();
    const card = actor.hand.find((item) => item.id === cardId);

    if (!card || card.energyCost > actor.steamPressure || actor.board.length >= 5) return;

    actor.spendSteam(card.energyCost);
    const deployed = actor.deployCard(cardId);
    if (!deployed) return;

    resolveAbilityOnPlay(deployed, side);
    useBattleStore.getState().pushLog(`${side === "player" ? "You deploy" : "Enemy deploys"} ${deployed.name}.`);
    ui.setStatus(side === "player" ? `${deployed.name} locks onto the Industrial Platform.` : `${deployed.name} advances through steam and brass.`);
    cleanupDestroyed();
    updateWinner();
  },
  attack: (attackerId, target) => {
    const attackerSide: Side = target.owner === "player" ? "enemy" : "player";
    const attackerStore = getActorStore(attackerSide).getState();
    const targetStore = getActorStore(target.owner).getState();
    const attacker = attackerStore.board.find((card) => card.id === attackerId);
    if (!attacker || attacker.hasActed) return;

    const attackPower = abilityAttackModifier(attacker);
    const battle = useBattleStore.getState();

    if (target.type === "player") {
      const damage = targetStore.takeDamage(attackPower);
      battle.pushLog(`${attacker.name} cracks the hull for ${damage} direct damage.`);
    } else {
      const defender = targetStore.board.find((card) => card.id === target.id);
      if (!defender) return;

      damageUnit(target.owner, defender.id, attackPower);
      damageUnit(attackerSide, attacker.id, defender.attack);
      battle.pushLog(`${attacker.name} slams into ${defender.name}.`);

      if (attacker.ability === "steamBurst") {
        getActorStore(target.owner).getState().takeDamage(1);
        battle.pushLog(`${attacker.name} releases residual steam for 1 extra core damage.`);
      }
    }

    markCardAsActed(attackerSide, attacker.id);
    cleanupDestroyed();
    updateWinner();
  },
  endTurn: async () => {
    if (useBattleStore.getState().winner) return;
    useBattleStore.getState().setTurn("resolving");
    useUiStore.getState().setStatus("Pressure shifts across the chamber.");
    await get().enemyTurn();
  },
  enemyTurn: async () => {
    if (useBattleStore.getState().winner) return;
    await startTurn("enemy");
    await executeEnemyActions();
    if (useBattleStore.getState().winner) return;
    await startTurn("player");
  },
}));
