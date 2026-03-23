import { create } from "zustand";
import type { ActorState, GameCard } from "@/types/game";

const initialPlayerState: ActorState = {
  side: "player",
  name: "Forge Commander",
  structuralIntegrity: 30,
  steamPressure: 1,
  maxSteamPressure: 1,
  shield: 0,
  hand: [],
  board: [],
  discard: [],
};

interface PlayerStore extends ActorState {
  reset: () => void;
  setHand: (hand: GameCard[]) => void;
  drawToHand: (cards: GameCard[]) => void;
  spendSteam: (amount: number) => void;
  replenishSteam: (opening?: boolean) => void;
  deployCard: (cardId: string) => GameCard | null;
  updateBoardCard: (cardId: string, updater: (card: GameCard) => GameCard) => void;
  removeBoardCard: (cardId: string) => GameCard | null;
  takeDamage: (amount: number) => number;
  heal: (amount: number) => void;
  addShield: (amount: number) => void;
  refreshBoard: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...initialPlayerState,
  reset: () => set(initialPlayerState),
  setHand: (hand) => set({ hand }),
  drawToHand: (cards) => set((state) => ({ hand: [...state.hand, ...cards] })),
  spendSteam: (amount) => set((state) => ({ steamPressure: Math.max(0, state.steamPressure - amount) })),
  replenishSteam: (opening = false) =>
    set((state) => {
      const maxSteamPressure = opening ? state.maxSteamPressure : Math.min(10, state.maxSteamPressure + 1);
      return { maxSteamPressure, steamPressure: maxSteamPressure };
    }),
  deployCard: (cardId) => {
    const card = get().hand.find((item) => item.id === cardId);
    if (!card) return null;

    set((state) => ({
      hand: state.hand.filter((item) => item.id !== cardId),
      board: [...state.board, { ...card, hasActed: false }],
    }));

    return { ...card, hasActed: false };
  },
  updateBoardCard: (cardId, updater) =>
    set((state) => ({ board: state.board.map((card) => (card.id === cardId ? updater(card) : card)) })),
  removeBoardCard: (cardId) => {
    const card = get().board.find((item) => item.id === cardId);
    if (!card) return null;

    set((state) => ({
      board: state.board.filter((item) => item.id !== cardId),
      discard: [...state.discard, card],
    }));

    return card;
  },
  takeDamage: (amount) => {
    const { shield, structuralIntegrity } = get();
    const absorbed = Math.min(shield, amount);
    const finalDamage = Math.max(0, amount - absorbed);

    set({
      shield: Math.max(0, shield - amount),
      structuralIntegrity: Math.max(0, structuralIntegrity - finalDamage),
    });

    return finalDamage;
  },
  heal: (amount) => set((state) => ({ structuralIntegrity: Math.min(30, state.structuralIntegrity + amount) })),
  addShield: (amount) => set((state) => ({ shield: state.shield + amount })),
  refreshBoard: () => set((state) => ({ board: state.board.map((card) => ({ ...card, hasActed: false })) })),
}));
