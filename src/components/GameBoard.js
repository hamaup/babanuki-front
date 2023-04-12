import React from 'react';
import Card from './Card';
import MessageLog from './MessageLog';
import './GameBoard.css';

const GameBoard = ({ players = [],
  setPlayers,
  messages,
  setMessages,
  currentPlayerIndex,
  setCurrentPlayerIndex,
  gameOver,
  setGameOver,
  onCardClick }) => {
  const currentPlayer = players[currentPlayerIndex];
  const renderPlayerCards = (player) => {
    console.log(JSON.stringify(player))
    return player.hand.map((card, index) => (

      < Card
        key={`${player.id}-${card.id}`}
        card={card}
        faceDown={player.type === 'computer'}
        onClick={() => {
          if (player.type === 'computer' && player.id === currentPlayer.targetPlayer.id) {
            console.log("index" + index)
            onCardClick(index);
          }
        }}
      />
    ));
  };

  return (
    <div className="game-board">
      <div className="game-play-area">
        {players.map((player) => (
          <div key={player.id} className="player-cards">
            <h3>{player.name}</h3>
            <div className="cards-container">
              {renderPlayerCards(player)}
            </div>
          </div>
        ))}
      </div>

      <MessageLog />
    </div>
  );
};

export default GameBoard;
