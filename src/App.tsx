import { useState, useEffect } from "react";
import axios from "axios";
import { Card, Deck } from "./types";
import { playCard as playerPlayCard } from "./player";
import { playCard as botPlayCard } from "./bot";

function App() {
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [botDeck, setBotDeck] = useState<Card[]>([]);
  const [middle, setMiddle] = useState<Card[]>([]);
  const [isBattleInProgress, setIsBattleInProgress] = useState<boolean>(false);
  const [canPlay, setCanPlay] = useState<boolean>(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const { data } = await axios.get<Deck>(
          "https://deckofcardsapi.com/api/deck/new/draw/?count=52"
        );

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

  const handleRejouer = () => {
    window.location.reload();
  };

  const getCardValue = (value: string): number => {
    const values: { [key: string]: number } = {
      ACE: 14,
      KING: 13,
      QUEEN: 12,
      JACK: 11,
    };
    return values[value] || parseInt(value);
  };

  const handleTurn = () => {
  // Si aucune carte n'est sélectionnée et qu'il y a des cartes dans le paquet du joueur, on sélectionne la première
  if (!selectedCard && playerDeck.length > 0) {
    setSelectedCard(playerDeck[0]);
    return; // On sort de la fonction immédiatement pour éviter que le reste du code soit exécuté avant la mise à jour
  }

  // Si une carte est sélectionnée et que le tour peut continuer
  if (isBattleInProgress || !canPlay || !selectedCard) {
    return;
  }

  const playerCard = selectedCard;
  const updatedPlayerDeck = playerDeck.filter(card => card !== selectedCard);

  // Mettre à jour le paquet du joueur en enlevant la carte jouée
  setPlayerDeck(updatedPlayerDeck);

  // Mettre à jour le tableau du milieu avec la carte jouée
  setMiddle([playerCard]);

  // Réinitialiser selectedCard pour que l'image de la carte jouée disparaisse
  setSelectedCard(null);
  // Carte du bot
  setTimeout(() => {
    const { playedCard: botCard, updatedDeck: updatedBotDeck } = botPlayCard(botDeck);

    if (botCard) {
      setMiddle((prevMiddle) => [...prevMiddle, botCard]);
      setBotDeck(updatedBotDeck);

      const playerValue = getCardValue(playerCard.value);
      const botValue = getCardValue(botCard.value);

      setTimeout(() => {
        let newPlayerDeck = [...updatedPlayerDeck];
        let newBotDeck = [...updatedBotDeck];

        if (playerValue > botValue) {
          newPlayerDeck = [...newPlayerDeck, playerCard, botCard];
          console.log("Joueur gagne ce tour !");
        } else if (playerValue < botValue) {
          newBotDeck = [...newBotDeck, playerCard, botCard];
          console.log("Bot gagne ce tour !");
        } else {
          console.log("Égalité, bataille !");
          setIsBattleInProgress(true);
          setCanPlay(false);
          handleBattle(playerCard, botCard, newPlayerDeck, newBotDeck);
          return;
        }

        setPlayerDeck(newPlayerDeck);
        setBotDeck(newBotDeck);
        setMiddle([]);
        console.log(`Scores après le tour : Joueur: ${newPlayerDeck.length}, Bot: ${newBotDeck.length}`);
      }, 1000);
    }
  }, 500);
};

  const handleBattle = async (
    playerCard: Card,
    botCard: Card,
    playerDeck: Card[],
    botDeck: Card[]
  ) => {
    let playerCardsInMiddle: Card[] = [playerCard];
    let botCardsInMiddle: Card[] = [botCard];
    let newPlayerDeck = [...playerDeck];
    let newBotDeck = [...botDeck];

    setMiddle([...playerCardsInMiddle, ...botCardsInMiddle]);

    let battle = true;
    setIsBattleInProgress(true);
    setCanPlay(false); // Désactiver le bouton jouer

    while (battle) {
      if (newPlayerDeck.length === 0 || newBotDeck.length === 0) {
        console.log("Fin de la partie, il n'y a plus de cartes.");
        battle = false;
        break;
      }

      const { playedCard: playerBurnedCard, updatedDeck: updatedPlayerDeck } =
        playerPlayCard(newPlayerDeck);
      const { playedCard: botBurnedCard, updatedDeck: updatedBotDeck } =
        botPlayCard(newBotDeck);

      if (playerBurnedCard) {
        playerBurnedCard.isBurned = true; // Marque la carte comme brûlée
        playerCardsInMiddle.push(playerBurnedCard);
      }
      if (botBurnedCard) {
        botBurnedCard.isBurned = true; // Marque la carte comme brûlée
        botCardsInMiddle.push(botBurnedCard);
      }

      setMiddle([...playerCardsInMiddle, ...botCardsInMiddle]);

      await new Promise((resolve) => setTimeout(resolve, 800)); // Délai pour la visualisation

      const playerValue = playerBurnedCard
        ? getCardValue(playerBurnedCard.value)
        : 0;
      const botValue = botBurnedCard ? getCardValue(botBurnedCard.value) : 0;

      if (playerValue > botValue) {
        newPlayerDeck = [
          ...updatedPlayerDeck,
          ...playerCardsInMiddle,
          ...botCardsInMiddle,
        ];
        battle = false;
      } else if (playerValue < botValue) {
        newBotDeck = [
          ...updatedBotDeck,
          ...playerCardsInMiddle,
          ...botCardsInMiddle,
        ];
        battle = false;
      } else {
        console.log("Égalité, prochaine manche !");
        newPlayerDeck = updatedPlayerDeck;
        newBotDeck = updatedBotDeck;
      }
    }

    setPlayerDeck(newPlayerDeck);
    setBotDeck(newBotDeck);

    setIsBattleInProgress(false);
    setCanPlay(true);
  };

  const handleCardSelection = (card: Card) => {
    setSelectedCard(card);

    // Remplacer la carte en haut par celle sélectionnée
    const updatedPlayerDeck = playerDeck.filter((playerCard) => playerCard !== card);
    setPlayerDeck(updatedPlayerDeck);
    setMiddle([card, ...middle]); // La carte sélectionnée va dans le "middle" pour afficher en haut
  };

  return (
    <main className="p-6">
      <h1 className="text-center text-4xl font-bold mb-6">Bataille</h1>

      <div className="flex flex-wrap justify-center text-center text-md">
        <button className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-md" onClick={handleRejouer}>
          <p>REJOUER</p>
        </button>
      </div>
      <div className="flex flex-wrap justify-center text-center text-xl mt-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-md" onClick={handleTurn} disabled={isBattleInProgress}>
          <p>JOUER</p>
        </button>
      </div>

      <section className="flex gap-4 justify-between">
        <div>
          <h2 className="sm:text-lg text-sm font-semibold mb-4 text-center">
            Paquet du joueur ({playerDeck.length})
          </h2>
          <div className="flex justify-center">
          {playerDeck.length > 0 && (
            <div
              className="sm:w-32 h-auto w-24 rounded-md shadow-xl cursor-pointer"
              onClick={handleTurn}
            >
              <img
                src={selectedCard?.image || playerDeck[0].image || "https://deckofcardsapi.com/static/img/back.png"}
                alt={`${playerDeck[0].value} of ${playerDeck[0].suit}`}
                className="w-full h-auto"
              />
            </div>
          )}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap justify-center gap-4 mt-5 mr-6">
            {middle.map((card, index) => (
              <div key={index} className="sm:w-32 h-auto w-24 rounded-md shadow-xl">
                <img
                  src={card.isBurned ? "https://deckofcardsapi.com/static/img/back.png" : card.image}
                  alt={`${card.value} of ${card.suit}`}
                  className="w-full h-auto"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="sm:text-lg text-sm font-semibold mb-4 text-center">
            Paquet du bot ({botDeck.length})
          </h2>
          <div className="flex justify-center">
            {botDeck.length > 0 && (
              <div className="sm:w-32 h-auto w-24 rounded-md shadow-xl">
                <img
                  src="https://deckofcardsapi.com/static/img/back.png"
                  alt={`${botDeck[0]?.value} of ${botDeck[0]?.suit}`}
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="flex gap-6 mt-10 flex-wrap">
        {playerDeck.slice(0, 5).map((card, index) => (
          <div
            key={index}
            className="w-24 h-auto cursor-pointer"
            onClick={() => handleCardSelection(card)}
            style={{
              zIndex: 5 - index,
            }}
          >
            <img
              src={card.image}
              alt={`${card.value} of ${card.suit}`}
              className="w-full h-auto"
            />
          </div>
        ))}
      </section>
    </main>
  );
}

export default App;
