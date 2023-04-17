import React from 'react';
import { Button } from 'react-bootstrap';
import styles from './Home.module.css';

const Home = ({ currentAccount, connectWalletAction, startGame }) => {
  return (
    <div className={styles.homeContainer}>
      <>
        <img src="/images/home.png" alt="Babanuki" className={styles.home_image} />
        {!currentAccount && <Button onClick={connectWalletAction} className={styles.button}>Connect Wallet</Button>}
        {currentAccount && (
          <div>
            <Button onClick={startGame} className={`${styles.button} ml-3`}>
              Start Game
            </Button>
          </div>
        )}
      </>
    </div >
  );
};

export default Home;
