import { buildFallbackDeck, mapApiCardToGameCard } from "@/utils/cardMapper";
import type { ApiCard, GameCard, Side } from "@/types/game";

const API_URL = "https://deckofcardsapi.com/api/deck";
let fallbackCursor = 0;
let fallbackDeck = buildFallbackDeck();

const safeFetch = async <T>(input: string): Promise<T | null> => {
  try {
    const response = await fetch(input);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const drawFromFallback = (count: number, owner: Side): GameCard[] => {
  const cards: GameCard[] = [];

  for (let i = 0; i < count; i += 1) {
    const card = fallbackDeck[fallbackCursor % fallbackDeck.length];
    fallbackCursor += 1;
    cards.push(mapApiCardToGameCard(card, owner));
  }

  return cards;
};

export const createDeck = async (): Promise<{ deckId: string | null; remaining: number }> => {
  const data = await safeFetch<{ deck_id: string; remaining: number }>(`${API_URL}/new/shuffle/?deck_count=1`);
  if (!data) {
    fallbackDeck = buildFallbackDeck().sort(() => Math.random() - 0.5);
    fallbackCursor = 0;
    return { deckId: null, remaining: fallbackDeck.length };
  }

  return { deckId: data.deck_id, remaining: data.remaining };
};

export const drawCards = async (deckId: string | null, count: number, owner: Side): Promise<{ cards: GameCard[]; remaining: number }> => {
  if (!deckId) {
    return {
      cards: drawFromFallback(count, owner),
      remaining: Math.max(0, fallbackDeck.length - fallbackCursor),
    };
  }

  const data = await safeFetch<{ cards: ApiCard[]; remaining: number }>(`${API_URL}/${deckId}/draw/?count=${count}`);

  if (!data) {
    return {
      cards: drawFromFallback(count, owner),
      remaining: Math.max(0, fallbackDeck.length - fallbackCursor),
    };
  }

  return {
    cards: data.cards.map((card) => mapApiCardToGameCard(card, owner)),
    remaining: data.remaining,
  };
};

export const reshuffle = async (deckId: string | null): Promise<boolean> => {
  if (!deckId) {
    fallbackDeck = buildFallbackDeck().sort(() => Math.random() - 0.5);
    fallbackCursor = 0;
    return true;
  }

  const data = await safeFetch<{ shuffled: boolean }>(`${API_URL}/${deckId}/shuffle/`);
  return data?.shuffled ?? false;
};
