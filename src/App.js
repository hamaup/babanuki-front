import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Table, Modal } from 'react-bootstrap';
import CONTRACT_ADDRESS from './config/contract-address';
import CONTRACT_ABI from './config/BabanukiNFT.json';
import Web3 from 'web3';

// web3Instance.jsで作成したWeb3インスタンスをインポート
//import web3 from './lib/web3Instance';


const App = () => {
  const [playerData, setPlayerData] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [turnPlayer, setTurnPlayer] = useState(0);
  const [isHumanPlayer, setIsHumanPlayer] = useState(false);
  const [showRankings, setShowRankings] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const accounts = [
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  ];


  const drawCard = async (cardIndex, nextPlayerIndex) => {
    const web3 = new Web3("ws://localhost:8545");
    const senderAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);

    const player = playerData[turnPlayer];
    const nextPlayer = playerData[nextPlayerIndex];
    console.log(`before drawCard updatedPlayerData: ${JSON.stringify(playerData)}`);
    try {
      await contractInstance.methods.drawCard(turnPlayer, nextPlayerIndex, cardIndex).send({ from: senderAddress });
      console.log(`${player.name}が${nextPlayer.name}のカード${nextPlayer.hand[cardIndex]}(${cardIndex})をスマートコントラクトに渡しました`);
    } catch (error) {
      console.error(`${player.name}が${nextPlayer.name}のカード${nextPlayer.hand[cardIndex]}(${cardIndex})をスマートコントラクトに渡せませんでした:`, error);
      return;
    }

  };

  useEffect(() => {
    const web3 = new Web3("ws://localhost:8545");
    const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);

    const onCardDrawn = (event) => {
      const updatedPlayerData = playerData.map((player, index) => {
        return {
          ...player,
          hand: event.returnValues[`player${index + 1}Hand`],
        };
      });
      if (updatedPlayerData.length > 0) {
        setPlayerData(updatedPlayerData);
      }
      console.log(`onCardDrawn updatedPlayerData: ${JSON.stringify(updatedPlayerData)}`);
    };

    const onPlayerFinished = (event) => {
      console.log(`onPlayerFinished`);
      const playerAddress = event.returnValues.playerAddress;
      const hasEmptyHand = event.returnValues.hasEmptyHand;
      const ranking = event.returnValues.ranking;
      console.log(`${event.returnValues.playerAddress} hasEmptyHand:${hasEmptyHand}`);
      const finishedPlayerIndex = playerData.findIndex((player) => player.address === playerAddress);
      if (finishedPlayerIndex !== -1) {
        const updatedPlayerData = [...playerData];
        updatedPlayerData[finishedPlayerIndex].hasEmptyHand = true;
        updatedPlayerData[finishedPlayerIndex].hand = updatedPlayerData[finishedPlayerIndex].hand.map(() => "0");
        updatedPlayerData[finishedPlayerIndex].ranking = ranking;
        setPlayerData(updatedPlayerData);
      }
    };

    const onGameOver = (event) => {
      console.log("game over event: " + JSON.stringify(event));
      const eventData = event.returnValues;

      // スマートコントラクトから受け取ったデータを使ってランキング処理を行う
      const updatedPlayerData = playerData.map((player) => {
        let ranking;
        if (player.address === eventData.player1) {
          ranking = parseInt(eventData.player1Ranking);
        } else if (player.address === eventData.player2) {
          ranking = parseInt(eventData.player2Ranking);
        } else if (player.address === eventData.player3) {
          ranking = parseInt(eventData.player3Ranking);
        } else if (player.address === eventData.player4) {
          ranking = parseInt(eventData.player4Ranking);
        } else {
          ranking = player.ranking;
        }

        return { ...player, ranking };
      });

      setPlayerData(updatedPlayerData);
      setGameOver(true);
      onResetGame();
      setShowRankings(true);
    };


    const cardDrawnEvent = contractInstance.events.CardDrawn({}).on("data", onCardDrawn);
    const playerFinishedEvent = contractInstance.events.PlayerFinished({}).on("data", onPlayerFinished);
    const gameOverEvent = contractInstance.events.GameOver({}).on("data", onGameOver);

    return () => {
      cardDrawnEvent.unsubscribe();
      playerFinishedEvent.unsubscribe();
      gameOverEvent.unsubscribe();
    };
  }, [playerData]);



  const handleNextTurn = () => {
    if (gameOver) {
      return;
    }
    console.log("handleNextTurn");
    setTurnPlayer((prevTurnPlayer) => (prevTurnPlayer + 1) % playerData.length);

  };

  const executeNextPlayer = async () => {
    if (playerData.length === 0) {
      return;
    }
    const currentPlayer = playerData[turnPlayer];
    if (currentPlayer.name === "Player 1") { // Human player
      if (currentPlayer.hasEmptyHand) {
        handleNextTurn();
        return;
      }
      setIsHumanPlayer(true);
      console.log("あなたの番です")
    } else { // NPC

      if (currentPlayer.hasEmptyHand) {
        handleNextTurn();
        return;
      }

      let nextPlayerIndex = turnPlayer;
      do {
        nextPlayerIndex = (nextPlayerIndex + 1) % playerData.length;
        if (turnPlayer === nextPlayerIndex) {
          continue;
        }
      } while (playerData[nextPlayerIndex].hasEmptyHand);


      let cardIndex = Math.floor(Math.random() * playerData[nextPlayerIndex].hand.length);
      let card = playerData[nextPlayerIndex].hand[cardIndex];
      while (card === "0") {
        cardIndex = Math.floor(Math.random() * playerData[nextPlayerIndex].hand.length);
        card = playerData[nextPlayerIndex].hand[cardIndex];
      }
      console.log(`${currentPlayer.name}が${playerData[nextPlayerIndex].name}のカード${card}(${cardIndex})を引きますよ`);

      await drawCard(cardIndex, nextPlayerIndex);
      console.log(`${currentPlayer.name}が${playerData[nextPlayerIndex].name}のカード${card}(${cardIndex})を引きました`);

      await new Promise(resolve => setTimeout(resolve, 5000));
      handleNextTurn();
    }
  };

  const onCardClick = async (cardIndex) => {
    if (!isHumanPlayer) {
      return;
    }
    const currentPlayer = playerData[turnPlayer];
    if (currentPlayer.hasEmptyHand) {
      handleNextTurn();
      return;
    }
    let nextPlayerIndex = turnPlayer;
    do {
      nextPlayerIndex = (nextPlayerIndex + 1) % playerData.length;
      if (turnPlayer === nextPlayerIndex) {
        continue;
      }
    } while (playerData[nextPlayerIndex].hasEmptyHand);

    setIsHumanPlayer(false);
    await drawCard(cardIndex, nextPlayerIndex);
    setTimeout(() => {
      handleNextTurn();
    }, 2000);
  };


  useEffect(() => {
    if (gameStarted && turnPlayer !== null) {
      executeNextPlayer();
    }
  }, [turnPlayer, gameStarted]);



  function convertToCardsArray(hand) {
    let suit = hand.charAt(0);
    let rank = hand.substring(1);
    if (suit === "0") {
      return;
    }
    switch (suit) {
      case "1":
        suit = "Spades";
        break;
      case "2":
        suit = "Hearts";
        break;
      case "3":
        suit = "Clubs";
        break;
      case "4":
        suit = "Diamonds";
        break;
      case "9":
        suit = "Joker";
        rank = "";
        break;
      default:
        throw new Error(`Invalid suit: ${suit}`);
    }

    switch (rank) {
      case "01":
        rank = "Ace";
        break;
      case "11":
        rank = "Jack";
        break;
      case "12":
        rank = "Queen";
        break;
      case "13":
        rank = "King";
        break;
      default:
        rank = parseInt(rank, 10).toString();
    }
    const card = { suit: suit, rank: rank }
    return card;
  }


  const onStartGame = async () => {
    try {
      console.log('onStartGame');
      const web3 = new Web3("ws://localhost:8545");
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      const res = await contractInstance.methods.sayHello().call();
      console.log('Response from smart contract:', res);
    } catch (error) {
      console.error('Error executing smart contract function:', error);
    }
    try {
      const web3 = new Web3("ws://localhost:8545");
      const senderAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      await contractInstance.methods.startGame().send({ from: senderAddress }).then(function (receipt) {
        console.log("Game started:", receipt);
      }).catch(function (error) {
        console.error("Failed to start the game:", error);
      });
      executeNextPlayer();
    } catch (error) {
      if (error.message.includes("Game has already started.")) {
        // Display a user-friendly message, e.g., using an alert or updating the UI
        alert("The game has already started.");
      } else {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const web3 = new Web3("ws://localhost:8545");
    const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);

    const gameStartedSubscription = contractInstance.events.GameStarted({}, (error, event) => {
      if (!error) {
        const playerAddresses = [
          event.returnValues.player1,
          event.returnValues.player2,
          event.returnValues.player3,
          event.returnValues.player4,
        ];

        const playerHands = [
          event.returnValues.player1Hand,
          event.returnValues.player2Hand,
          event.returnValues.player3Hand,
          event.returnValues.player4Hand,
        ];

        const newPlayerData = playerAddresses.map((address, index) => {
          return {
            id: index,
            name: `Player ${index + 1}`,
            address: address,
            hand: playerHands[index],
            hasEmptyHand: false
          };
        });
        setPlayerData(newPlayerData);
        setGameStarted(true);
        setShowRankings(false);
      } else {
        console.error(error);
      }
    });




    return () => {
      gameStartedSubscription.unsubscribe();
    };
  }, [playerData]);




  const onResetGame = async () => {
    try {

      setGameStarted(false);
      setTurnPlayer(0);
      setIsHumanPlayer(false);
      setGameOver(false);

      const senderAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      const web3 = new Web3("ws://localhost:8545");
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      await contractInstance.methods.resetGame().send({ from: senderAddress });
    } catch (error) {
      console.error("Error executing smart contract function:", error);
    }
  };



  const onJoinGame = async () => {
    try {
      const senderAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      const web3 = new Web3("ws://localhost:8545");
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      const numberOfPlayers = await contractInstance.methods.getNumberOfPlayers().call();
      if (numberOfPlayers <= 4) {
        await contractInstance.methods.joinGameBatch(accounts).send({ from: senderAddress }).then(function (receipt) {
          console.log("Players have joined the game:", receipt);
        }).catch(function (error) {
          console.error("Failed to join the game:", error);
        });
      }
    } catch (error) {
      console.error("Error executing smart contract function:", error);
    }
  };


  // Render the player hands based on the playerData state
  const renderPlayerHand = (player) => {
    return (
      <div>
        <h2>{player.name}</h2>
        <Table striped bordered hover>
          <tbody>
            {player.hand.map((card, index) => {
              if (parseInt(card) === 0) {
                return null;
              }
              const convertedCard = convertToCardsArray(card);
              return (
                <tr key={index}>
                  <td
                    onClick={() => onCardClick(index)}
                    style={{
                      cursor: isHumanPlayer && turnPlayer === 1 ? 'pointer' : 'default',
                    }}
                  >
                    {convertedCard.rank} {convertedCard.suit}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  };


  // 順位表コンポーネントを描画する関数
  const renderRankings = () => {
    return (
      <Modal show={showRankings} onHide={() => setShowRankings(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rankings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
              </tr>
            </thead>
            <tbody>
              {playerData
                .sort((a, b) => a.ranking - b.ranking)
                .map((player, index) => (
                  <tr key={index}>
                    <td>{player.ranking}</td>
                    <td>{player.name}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    );
  };


  const renderStartButton = () => {
    return (
      <Container>
        <Row>
          <Col>
            <Button onClick={onStartGame}>
              Start Game
            </Button>
          </Col>
        </Row>
      </Container>
    );
  };
  const renderResetButton = () => {
    return (
      <Button onClick={onResetGame} >
        Reset Game
      </Button>
    );
  };

  const renderJoinButton = () => {
    return (
      <Button onClick={onJoinGame} >
        Join Game
      </Button>
    );
  };
  return (
    <Container>
      <Row>
        <Col>
          {renderJoinButton()}
          {renderStartButton()}
          {renderResetButton()}
        </Col>
      </Row>
      {gameStarted && (
        <Row>
          {playerData.map((player) => (
            <Col key={player.id}>
              {renderPlayerHand(player)}
            </Col>
          ))}
        </Row>
      )}
      {renderRankings()}
    </Container>
  )
};

export default App;