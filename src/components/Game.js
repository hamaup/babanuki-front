import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Row, Col, Modal } from 'react-bootstrap';
import Web3 from 'web3';
import CONTRACT_ADDRESS from '../config/contract-address';
import CONTRACT_ABI from '../config/BabanukiNFT.json';
import Message from './Message';
import Card from './Card';
import { tokenURIs } from '../config/tokenURIs.js';
import styles from './Game.module.css';

const Game = ({
  gameStarted,
  startGame,
  playerData,
  showRankings,
  drawnCardInfo,
  onCardClick,
  setShowRankings,
  currentAccount,
  winner
}) => {

  function convertToCardsArray(hand) {
    const suit = hand.charAt(0);
    const rank = hand.substring(1);
    const card = { suit: suit, rank: rank }
    return card;
  }

  const handleClaimNFT = async () => {
    const cardsArray = playerData[0].discarded.map(card => convertToCardsArray(card));
    const uniqueRanks = [...new Set(cardsArray.map(card => {
      const rank = parseInt(card.rank);
      return rank < 10 ? `${rank}` : `${rank}`;
    }))];
    const eligibleRanks = [...uniqueRanks];
    const randomIndex = Math.floor(Math.random() * eligibleRanks.length);
    const selectedTokenURI = eligibleRanks[randomIndex];
    const tokenURI = tokenURIs[selectedTokenURI];
    try {
      const web3 = new Web3(window.ethereum);
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      const tx = await contractInstance.methods.claimNFT(tokenURI).send({ from: currentAccount });
      console.log("NFT claimed successfully:", tx);
      alert("NFT claimed successfully")
    } catch (error) {
      console.error("Error claiming NFT:", error);
    }
  };
  const renderPlayerHand = (player) => {
    const isHumanPlayer = player.name === "Player";
    return (
      <div className={styles.playerWrapper}>
        <h2 className={styles.playerName}>{player.name}</h2>
        <div className={styles.playerHand}>
          {player.hand.map((card, index) => {
            if (parseInt(card) === 0) {
              return null;
            }
            const convertedCard = convertToCardsArray(card);
            return (
              <div key={index}>
                <Card
                  card={convertedCard}
                  faceDown={!isHumanPlayer}
                  onClick={!isHumanPlayer ? () => onCardClick(index) : null}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };



  const renderRankings = () => {
    return (
      <Modal show={showRankings} onHide={() => setShowRankings(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {playerData.map((player) => (
            <p key={player.name}>
              {player.address === winner ? "勝ち: " : "負け: "}
              {player.name}
            </p>
          ))}
          {winner.toLowerCase() === currentAccount.toLowerCase() && (
            <>
              <p>この中のNFTどれか1枚GETできます。Claim NFTボタンを押しください。</p>
              <ul>
                {[...new Map(playerData[0].discarded
                  .filter(card => !isNaN(parseInt(card)))
                  .map(card => [card.slice(-2), card]))
                  .values()]
                  .map((card, index) => {
                    const convertedCard = convertToCardsArray(card);
                    const cardKey = `${convertedCard.rank}-${convertedCard.suit}`;
                    return (
                      <Card
                        key={cardKey}
                        card={convertedCard}
                        faceDown={0}
                      />
                    );
                  })
                }
              </ul>
              {renderClaimNFTButton()}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button className="custom-btn" variant="primary" onClick={startGame}>
            Play Again!
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };



  const renderClaimNFTButton = () => {
    return (
      <Button onClick={handleClaimNFT} className="mt-3" className={styles.claimButtonStyle}>
        Claim NFT
      </Button>
    );
  };

  return (
    <div className={styles.gameContainer}>
      <Container>
        {gameStarted && !showRankings && (
          <>
            <Row>
              <Message message={drawnCardInfo?.message} className={styles.message} />
            </Row>
            <span className={styles.span}>NPCのカードを引いてください。</span>
            <Row>
              {playerData
                .filter((player) => player.name !== "Player")
                .map((player) => (
                  <Col key={player.id}>{renderPlayerHand(player)}</Col>
                ))}
            </Row>
            <Row>
              {playerData
                .filter((player) => player.name === "Player")
                .map((player) => (
                  <Col key={player.id}>{renderPlayerHand(player)}</Col>
                ))}
            </Row>
          </>
        )}
        <Row>
          {showRankings && <>{renderRankings()}</>}
        </Row>
      </Container>
    </div>
  );
};

export default Game;