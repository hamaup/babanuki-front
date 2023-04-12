import React from 'react';
import Card from './Card';

const CardModal = ({ show, cards, onSelect, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="card-modal">
      <div className="modal-content">
        <h3>Select a card</h3>
        <div className="card-list">
          {cards.map((card, index) => (
            <div
              key={index}
              className="selectable-card"
              onClick={() => onSelect(card)}
            >
              <Card card={card} />
            </div>
          ))}
        </div>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default CardModal;
