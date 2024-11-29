export interface Card {
  code: string;
  image: string;
  images: {
    svg: string;
    png: string;
  };
  value: string;
  suit: string;
  flipped: boolean;
  isBurned?: boolean;
}

export interface Deck {
  success: boolean;
  deck_id: string;
  remaining: number;
  cards: Card[];
}
