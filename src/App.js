import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Table } from 'react-bootstrap';
import CONTRACT_ADDRESS from './config/contract-address';
import CONTRACT_ABI from './config/BabanukiNFT.json';
import Web3 from 'web3';

// web3Instance.jsで作成したWeb3インスタンスをインポート
//import web3 from './lib/web3Instance';


const App = () => {
  const [playerData, setPlayerData] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [turnPlayer, setTurnPlayer] = useState(0);


  const accounts = [
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  ];



  const onStartGame = async () => {
    try {
      console.log('onStartGame');
      const web3 = new Web3("ws://localhost:8545");
      const senderAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);

      const res = await contractInstance.methods.sayHello().call();
      console.log('Response from smart contract:', res);

      const numberOfPlayers = await contractInstance.methods.getNumberOfPlayers().call();
      if (numberOfPlayers <= 4) {
        await contractInstance.methods.joinGameBatch(accounts).send({ from: senderAddress }).then(function (receipt) {
          console.log("Players have joined the game:", receipt);
        }).catch(function (error) {
          console.error("Failed to join the game:", error);
        });
      }
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
    } catch (error) {
      if (error.message.includes("Game has already started.")) {
        // Display a user-friendly message, e.g., using an alert or updating the UI
        alert("The game has already started.");
      } else {
        console.error(error);
      }
    }
  };


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






  useEffect(() => {
    const web3 = new Web3("ws://localhost:8545");
    const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);


    contractInstance.events.GameStarted({}, (error, event) => {
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
        const filteredPlayerHands = playerHands.map(hand =>
          hand.filter(card => card !== '0')
        );
        const newPlayerData = playerAddresses.map((address, index) => {
          return {
            id: index,
            name: `Player ${index + 1}`,
            hand: filteredPlayerHands[index]
          };
        });
        setPlayerData(newPlayerData);
        setGameStarted(true);
      } else {
        console.error(error);
      }
    });

  }, []);



  const onResetGame = async () => {
    try {
      const senderAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      const web3 = new Web3("ws://localhost:8545");
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      await contractInstance.methods.resetGame().send({ from: senderAddress });
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
          <thead>
            <tr>
              <th>Card Value</th>
              <th>Suit</th>
            </tr>
          </thead>
          <tbody>
            {player.hand.map((card, index) => {
              const convertedCard = convertToCardsArray(card);
              return (
                <tr key={index}>
                  <td>{convertedCard.rank}</td>
                  <td>{convertedCard.suit}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
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


  return (
    <Container>
      <Row>
        <Col>
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
    </Container>
  )
};

export default App;