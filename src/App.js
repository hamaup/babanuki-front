import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Web3 from 'web3';
import CONTRACT_ADDRESS from './config/contract-address';
import CONTRACT_ABI from './config/BabanukiNFT.json';
import Navbar from './components/Navbar';
import Home from "./components/Home";
import Profile from "./components/Profile";
import Game from "./components/Game";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerData, setPlayerData] = useState([]);
  const [turnPlayer, setTurnPlayer] = useState(0);
  const [isHumanPlayer, setIsHumanPlayer] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showRankings, setShowRankings] = useState(false);
  const [eventQueue, setEventQueue] = useState([]);
  const [drawnCardInfo, setDrawnCardInfo] = useState(null);
  const [winner, setWinner] = useState(null);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
        } else {
          console.log("No authorized account found");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const startGame = async () => {
    setPlayerData([])
    setGameOver(false);
    setShowRankings(false);
    setWinner(null)
    setEventQueue([]);
    setDrawnCardInfo(null);
    const web3 = new Web3(window.ethereum);
    const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
    const checkGameStarted = await contractInstance.methods.gameStarted().call();

    if (checkGameStarted) {

      try {
        await contractInstance.methods.resetGame().send({ from: currentAccount });
      } catch (error) {
        console.error(error);
      }
    }
    try {
      const numberOfPlayers = await contractInstance.methods.getNumberOfPlayers().call();
      if (numberOfPlayers <= 4) {
        await contractInstance.methods.joinGame().send({ from: currentAccount }).then(function (receipt) {
          console.log("Players have joined the game:", receipt);
        }).catch(function (error) {
          console.error("Failed to join the game:", error);
        });
      }
      await contractInstance.methods.startGame().send({ from: currentAccount }).then(function (receipt) {
        console.log("Game started:", receipt);
      }).catch(function (error) {
        console.error("Failed to start the game:", error);
      });
      const message = "ゲーム開始";
      setDrawnCardInfo((prevState) => ({
        ...prevState,
        message,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const onGameStarted = (event) => {
    const playerAddresses = [
      event.returnValues.player1,
      event.returnValues.player2
    ];
    const playerHands = [
      event.returnValues.player1Hand,
      event.returnValues.player2Hand
    ];
    const newPlayerData = playerAddresses.map((address, index) => {
      const playerName = index === 0 ? "Player" : `NPC`;
      return {
        id: index,
        name: playerName,
        address: address,
        hand: playerHands[index],
        won: false
      };
    });
    setPlayerData(newPlayerData);
    setGameStarted(true);
    setTurnPlayer(0)
    setIsHumanPlayer(true);
    executeNextPlayer();

  };

  const onGameOver = (event) => {
    const winner = event.returnValues.winner;
    setWinner(winner);
  };

  useEffect(() => {
    if (winner && playerData.length > 0) {
      setTimeout(() => {
        setShowRankings(true);
      }, 6000);
    }
  }, [winner, playerData]);


  const onNpcTurn = async (event) => {
    //console.log("onNpcTurn" + JSON.stringify(event.returnValues))
  };

  const onHandleNFTAwarded = async (event) => {
    if (event.returnValues.recipient === currentAccount) {
      alert("NFTを受け取りました!");
    }
  };
  const onCardDrawn = (event) => {
    const updatedPlayerData = playerData.map((player, index) => {
      return {
        ...player,
        hand: event.returnValues[`player${index + 1}Hand`],
        discarded: event.returnValues[`player${index + 1}Discarded`],
      };
    });
    if (updatedPlayerData.length > 0) {
      setPlayerData(updatedPlayerData);
    }
    handleNextTurn();
  };

  useEffect(() => {
    const web3 = new Web3(window.ethereum);
    const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
    const gameStartedEvent = contractInstance.events.GameStarted({}).on("data", onGameStarted);
    const gameOverEvent = contractInstance.events.GameOver({}).on("data", onGameOver);
    const NFTAwardedEvent = contractInstance.events.NFTAwarded({}).on("data", onHandleNFTAwarded);
    const cardDrawnEvent = contractInstance.events.CardDrawn({}).on("data", (event) => {
      setEventQueue((prevQueue) => [...prevQueue, event]);
    });
    const npcTurnEvent = contractInstance.events.NpcTurn({}).on("data", onNpcTurn);

    return () => {
      gameStartedEvent.unsubscribe();
      gameOverEvent.unsubscribe();
      npcTurnEvent.unsubscribe();
      NFTAwardedEvent.unsubscribe();
      cardDrawnEvent.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (eventQueue.length > 0) {
        const nextEvent = eventQueue.shift();
        onCardDrawn(nextEvent);
        setEventQueue([...eventQueue]);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [eventQueue]);

  const drawCard = async (cardIndex, nextPlayerIndex) => {
    const web3 = new Web3(window.ethereum);
    const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);

    const player = playerData[turnPlayer];
    const nextPlayer = playerData[nextPlayerIndex];
    if (player.hasEmptyHand) {
      console.error(`${player.name}はもう手札がありません`);
      return;
    }
    if (nextPlayer.hasEmptyHand) {
      return;
    }
    try {
      await contractInstance.methods.drawCard(turnPlayer, nextPlayerIndex, cardIndex).send({ from: currentAccount });
    } catch (error) {
      setIsHumanPlayer(true);
      return;
    }
  };

  const handleNextTurn = () => {
    if (gameOver) {
      return;
    }
    setTurnPlayer((prevTurnPlayer) => (prevTurnPlayer + 1) % playerData.length);
  };

  const executeNextPlayer = async () => {
    console.log("currentAccount: ", currentAccount);
    if (playerData.length === 0) {
      return;
    }
    const currentPlayer = playerData[turnPlayer];
    const message = currentPlayer.name === "Player"
      ? "あなたが引く番です。"
      : "相手が引く番です。";

    setDrawnCardInfo((prevState) => ({
      ...prevState,
      message,
    }));
    if (currentPlayer.name === "Player") {
      if (currentPlayer.hasEmptyHand) {
        handleNextTurn();
        return;
      }
      setIsHumanPlayer(true);
    }
  };

  const onCardClick = async (cardIndex) => {
    if (!isHumanPlayer) {
      return;
    }
    let nextPlayerIndex = turnPlayer + 1;
    setIsHumanPlayer(false);
    await drawCard(cardIndex, nextPlayerIndex);
  };

  useEffect(() => {
    if (gameStarted && turnPlayer !== null) {
      executeNextPlayer();
    }
  }, [turnPlayer, gameStarted]);

  return (
    <div>
      <Navbar currentAccount={currentAccount} />
      <Router>
        <Routes>

          <Route
            path="/"
            element={
              gameStarted ? (
                <Game
                  gameStarted={gameStarted}
                  startGame={startGame}
                  playerData={playerData}
                  showRankings={showRankings}
                  drawnCardInfo={drawnCardInfo}
                  onCardClick={onCardClick}
                  setShowRankings={setShowRankings}
                  currentAccount={currentAccount}
                  winner={winner}
                  setDrawnCardInfo={setDrawnCardInfo}
                />
              ) : (
                <Home
                  currentAccount={currentAccount}
                  connectWalletAction={connectWalletAction}
                  startGame={startGame}
                />
              )
            }
          />
          <Route path="/" element={<Home currentAccount={currentAccount} connectWalletAction={connectWalletAction} startGame={startGame} />} />
          <Route path="/profile" element={<Profile currentAccount={currentAccount} />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;