import React from 'react';
import { Button } from 'react-bootstrap';

const Home = ({ walletConnected, connectWalletAction, startGame, onResetGame }) => {
  return (
    <div>
      {!walletConnected && <Button onClick={connectWalletAction}>Connect Wallet</Button>}
      {walletConnected && (
        <div>
          <Button onClick={startGame} className="ml-3">
            Start Game
          </Button>
          <a href="/profile" className="ml-3">Profile</a>
        </div>
      )}
      <Button onClick={onResetGame} className="ml-3">
        Reset
      </Button>
    </div>
  );
};

export default Home;
