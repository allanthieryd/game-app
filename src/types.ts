export interface Card {
  code: string; // Exemple: "AS" pour Ace of Spades
  image: string; // URL de l'image de la carte
  images: {
    svg: string; // URL de l'image en SVG
    png: string; // URL de l'image en PNG
  };
  value: string; // Exemple: "ACE", "2", "3", ..., "KING"
  suit: string; // Exemple: "SPADES", "HEARTS", "DIAMONDS", "CLUBS"
  flipped: boolean; // Indique si la carte est retournée (true) ou non (false)
}

export interface Deck {
  success: boolean; // Indique si la requête est réussie
  deck_id: string; // ID unique du deck
  remaining: number; // Nombre de cartes restantes dans le deck
  cards: Card[]; // Tableau des cartes tirées
}
