import React from 'react';
import Player from './Player';

const PlayerList = ({ players, onSelectCard }) => {
  const renderPlayers = () => {
    return players.map((player, index) => {
      return (
        <Player
          key={index}
          name={player.name}
          hand={player.hand}
          isComputer={player.isComputer}
          onSelectCard={index === 0 ? onSelectCard : null}
        />
      );
    });
  };

  return <div className="player-list">{renderPlayers()}</div>;
};

export default PlayerList;
