import React from 'react';
import Card from './Card';

const Player = ({ name, hand, isComputer, onSelectCard }) => {
  const renderHand = () => {
    return hand.map((card, index) => {
      return (
        <Card
          key={index}
          suit={card.suit}
          rank={card.rank}
          faceUp={!isComputer}
          onClick={isComputer ? null : () => onSelectCard(index)}
        />
      );
    });
  };

  return (
    <div className="player">
      <h3 className="player-name">{name}</h3>
      <div className="hand">{renderHand()}</div>
    </div>
  );
};

export default Player;
