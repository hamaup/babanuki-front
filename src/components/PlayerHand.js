import React from "react";
import Card from "./Card";
import "./PlayerHand.css";

const PlayerHand = ({ cards, onCardSelected }) => {
  const handleCardClick = (index) => {
    if (onCardSelected) {
      onCardSelected(index);
    }
  };

  return (
    <div className="player-hand">
      {cards.map((card, index) => (
        <Card
          key={index}
          rank={card.rank}
          suit={card.suit}
          isPlayer
          isFaceDown={false}
          onClick={() => handleCardClick(index)}
        />
      ))}
    </div>
  );
};

export default PlayerHand;
