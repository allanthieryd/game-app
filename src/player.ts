import { Card } from "./types";

export const playCard = (deck: Card[]) => {
  if (deck.length === 0) return { playedCard: null, updatedDeck: deck };

  const [playedCard, ...updatedDeck] = deck; // Récupérer la première carte et mettre à jour le paquet
  return { playedCard, updatedDeck };
};
