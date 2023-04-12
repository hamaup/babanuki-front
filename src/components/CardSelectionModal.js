import React from "react";
import "./CardSelectionModal.css";

const CardSelectionModal = ({ cards, onCardSelected }) => {
  return (
    <div className="modal-background">
      <div className="modal-content">
        <h2>Select a card:</h2>
        <div className="cards-container">
          {cards.map((card, index) => (
            <div
              key={index}
              className="card"
              onClick={() => onCardSelected(index)}
            >
              <img
                src={`cards/${card.rank}_of_${card.suit}.png`}
                alt={`${card.rank} of ${card.suit}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardSelectionModal;
