import React from 'react';
import Card from './Card';
import './OpponentHand.css';

const OpponentHand = ({ name, cards = [] }) => {
  return (
    <div className="opponent-hand">
      <h3>{name}</h3>
      {cards.map((card, index) => (
        <Card
          key={index}
          suit={card.suit}
          rank={card.rank}
          facedown
        />
      ))}
    </div>
  );
};

export default OpponentHand;
