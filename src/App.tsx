import { useState, useEffect } from "react";
import axios from "axios";
import { Card, Deck } from "./types";
import { playCard as playerPlayCard } from "./player";
import { playCard as botPlayCard } from "./bot";

function App() {
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [botDeck, setBotDeck] = useState<Card[]>([]);
  const [middle, setMiddle] = useState<Card[]>([]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const { data } = await axios.get<Deck>(
          "https://deckofcardsapi.com/api/deck/new/draw/?count=52"
        );

        /*const { shuffle } = await axios.get<Deck>(
          "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
        );*/

        const processedCards: Card[] = data.cards.map((card) => ({
          ...card,
          flipped: true,
        }));

        // Création de 2 paquets de 26 cartes
        setPlayerDeck(processedCards.slice(0, 26));
        setBotDeck(processedCards.slice(26, 52));
      } catch (error) {
        console.error("Erreur lors du chargement des cartes :", error);
      }
    };

    fetchCards();
  }, []);

  const handlePlayerTurn = () => {
    const { playedCard, updatedDeck } = playerPlayCard(playerDeck);
    if (playedCard) {
      setPlayerDeck(updatedDeck);
      setMiddle((prevMiddle) => [...prevMiddle, { ...playedCard, flipped: false }]);

      // Tour de l'ordinateur
      setTimeout(() => {
        const { playedCard: botCard, updatedDeck: botUpdatedDeck } = botPlayCard(botDeck);
        if (botCard) {
          setBotDeck(botUpdatedDeck);
          setMiddle((prevMiddle) => [...prevMiddle, { ...botCard, flipped: false }]);
        }
      }, 1000); // Délai de 1 seconde pour simuler le tour de l'ordinateur
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-center text-4xl font-bold mb-6">Bataille</h1>

      <div  className="flex flex-wrap justify-center text-center text-xl mb-5">
        <button className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-md">
          <p>REJOUER</p>
        </button>
      </div>

      <section className="flex gap-4 justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-4 text-center">Paquet du joueur</h2>
          <div className="flex flex-wrap justify-center">
            {playerDeck.length > 0 && (
              <div
                className="w-32 h-auto rounded-md shadow-xl cursor-pointer"
                onClick={handlePlayerTurn}
              >
                <img
                  src="https://deckofcardsapi.com/static/img/back.png"
                  alt="Dos de la carte"
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap justify-center gap-4 sm:ml-10">
            {middle.map((card, index) => (
              <div key={index} className="w-32 h-auto rounded-md shadow-xl">
                <img
                  src={card.image}
                  alt={`${card.value} of ${card.suit}`}
                  className="w-full h-auto"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 text-center">Paquet de l'ordinateur</h2>
          <div className="flex justify-center">
            {botDeck.length > 0 && (
              <div className="w-32 h-auto rounded-md shadow-xl">
                <img
                  src="https://deckofcardsapi.com/static/img/back.png"
                  alt="Dos de la carte"
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
