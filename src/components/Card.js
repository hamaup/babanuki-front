import React from 'react';
import './Card.css';

const Card = ({ card, faceDown, onClick }) => {
  const cardClass = 'card';
  const imageSource = faceDown ? '/images/cards/card_back.png' : `/images/cards/card_${card.value}_${card.suit}.png`;
  return (
    <div className={cardClass} onClick={onClick}>
      <div className="card-content">
        <img src={imageSource} alt={`${card.value} of ${card.suit}`} />
      </div>
    </div>
  );
};

export default Card;
