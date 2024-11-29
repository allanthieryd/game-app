// App.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Deck } from "./types"; // Import des types Card et Deck

function App() {
  const [cards, setCards] = useState<Card[]>([]); // Initialisation de l'état avec un tableau de Card[]

  useEffect(() => {
    const fetchCards = async () => {
      try {
        // Appel API pour récupérer un deck complet de 52 cartes
        const { data } = await axios.get<Deck>(
          "https://deckofcardsapi.com/api/deck/new/draw/?count=52"
        );

        // Ajouter la propriété 'flipped' pour chaque carte
        const processedCards: Card[] = data.cards.map((card) => ({
          ...card,
          flipped: false, // Initialiser flipped à false pour chaque carte
        }));

        setCards(processedCards); // Mettre à jour l'état des cartes
      } catch (error) {
        console.error("Erreur lors du chargement des cartes :", error);
      }
    };

    fetchCards();
  }, []);

  const handleFlip = (cardCode: string) => {
    // Inverser l'état 'flipped' de la carte sélectionnée
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.code === cardCode
          ? { ...card, flipped: !card.flipped }
          : card
      )
    );
  };

  return (
    <main>
      <div className="flex flex-wrap justify-center gap-4 p-6">
        {cards.map((card) => (
          <div
            key={card.code}
            className="w-32 h-auto bg-gray-100 p-4 rounded-md shadow-md"
            onClick={() => handleFlip(card.code)} // Retourner la carte au clic
          >
            <img
              src={card.flipped ? "https://deckofcardsapi.com/static/img/back.png" : card.image}
              alt={card.flipped ? "Back of card" : `${card.value} of ${card.suit}`}
              className="w-full h-auto"
            />
            <p className="text-sm mt-2">
              {card.flipped ? "Back of card" : `${card.value} of ${card.suit}`}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;
