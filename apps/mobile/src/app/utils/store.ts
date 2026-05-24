import { type SuggestionCard } from "./api";

let deckCache: SuggestionCard[] | null = null;

export function setDeck(cards: SuggestionCard[]) {
  deckCache = cards;
}

export function getDeck(): SuggestionCard[] | null {
  return deckCache;
}

export function clearDeck() {
  deckCache = null;
}
