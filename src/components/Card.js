// Card.js
import React from 'react';
import './Card.css';

const Card = ({ card, faceDown, onClick }) => {
  const cardClass = 'card';
  const imageSource = faceDown ? '/images/cards/card_back.png' : `/images/cards/${card.suit}${String(card.rank).padStart(2, '0')}.png`;
  return (
    <div className={cardClass} onClick={onClick}>
      <div className="card-content">
        <img src={imageSource} alt={`${card.rank} of ${card.suit}`} />
      </div>
    </div>
  );
};

export default Card;
