import React from 'react';
import { Button, Container, Row, Col, Table, Modal } from 'react-bootstrap';
import Card from './Card';
import Message from './Message';

const Game = ({
  gameStarted,
  playerData,
  gameOver,
  showRankings,
  renderPlayerHand,
  renderClaimNFTButton,
  onResetGame,
  renderRankings,
  drawnCardInfo
}) => {
  return (
    <div>
      <Container>
        {gameStarted && !showRankings && (
          <Row>
            <Message message={drawnCardInfo?.message} />
            {playerData.map((player) => (
              <Col key={player.id}>{renderPlayerHand(player)}</Col>
            ))}
          </Row>
        )}
        <Row>
          <Col>
            {gameOver && (
              <Button onClick={onResetGame} className="mt-3">
                Reset Game
              </Button>
            )}
            {renderClaimNFTButton()}
          </Col>
        </Row>
      </Container>

      {showRankings && (
        { renderRankings }
      )}
    </div>
  );
};

export default Game;