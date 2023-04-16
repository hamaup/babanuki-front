import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Table, Modal } from 'react-bootstrap';
import CONTRACT_ADDRESS from './config/contract-address';
import CONTRACT_ABI from './config/BabanukiNFT.json';
import Web3 from 'web3';
import Card from './components/Card';
import Message from './components/Message';
const App = () => {
  const [playerData, setPlayerData] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [turnPlayer, setTurnPlayer] = useState(0);
  const [isHumanPlayer, setIsHumanPlayer] = useState(false);
  const [showRankings, setShowRankings] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const [eventQueue, setEventQueue] = useState([]);
  const [drawnCardInfo, setDrawnCardInfo] = useState(null);



  // ユーザーがMetaMaskを持っているか確認します。
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
        hand: playerHands[index]
      };
    });
    console.log(` newPlayerData: ${JSON.stringify(newPlayerData)}`);
    setPlayerData(newPlayerData);
    setGameStarted(true);
    setShowRankings(false);
    setTurnPlayer(0)
    executeNextPlayer();

  };
  const onGameOver = (event) => {
    const winnerAddress = event.returnValues.winner;
    console.log("onGameOver" + JSON.stringify(event.returnValues));

    const updatedPlayerData = playerData.map((player) => {
      if (player.address === winnerAddress) {
        return { ...player, won: true };
      } else {
        return { ...player, won: false };
      }
    });

    setPlayerData(updatedPlayerData);
    console.log("onGameOver updatedPlayerData" + JSON.stringify(updatedPlayerData));

    setShowRankings(true);
    renderRankings();
  };
  const onNpcTurn = async (event) => {
    //console.log("onNpcTurn" + JSON.stringify(event.returnValues))
  };
  const onHandleNFTAwarded = async (event) => {
    console.log("event.onHandleNFTAwarded" + JSON.stringify(event.returnValues));
    if (event.returnValues.recipient === currentAccount) {
      alert("NFTを受け取りました!");
    }
  };
  const onCardDrawn = (event) => {
    console.log("onCardDrawn" + JSON.stringify(event.returnValues))
    const updatedPlayerData = playerData.map((player, index) => {
      return {
        ...player,
        hand: event.returnValues[`player${index + 1}Hand`],
      };
    });
    if (updatedPlayerData.length > 0) {
      setPlayerData(updatedPlayerData);
    }
    handleNextTurn();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (eventQueue.length > 0) {
        const nextEvent = eventQueue.shift();
        onCardDrawn(nextEvent);
        setEventQueue([...eventQueue]);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [eventQueue]);

  const drawCard = async (cardIndex, nextPlayerIndex) => {
    console.log("drawCard")
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
      return;
    }
  };

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
    console.log("executeNextPlayer")
    const currentPlayer = playerData[turnPlayer];
    const message = currentPlayer.name === "Player"
      ? "あなたが引く番です。"
      : "ばばぬきが引く番です。";

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
    console.log("cardIndex;" + cardIndex)
    setIsHumanPlayer(false);
    await drawCard(cardIndex, nextPlayerIndex);
  };


  useEffect(() => {
    if (gameStarted && turnPlayer !== null) {
      executeNextPlayer();
    }
  }, [turnPlayer, gameStarted]);

  function convertToCardsArray(hand) {
    const suit = hand.charAt(0);
    const rank = hand.substring(1);
    const card = { suit: suit, rank: rank }
    return card;
  }
  const startGame = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      const numberOfPlayers = await contractInstance.methods.getNumberOfPlayers().call();
      if (numberOfPlayers <= 4) {
        await contractInstance.methods.joinGame().send({ from: currentAccount }).then(function (receipt) {
          console.log("Players have joined the game:", receipt);
        }).catch(function (error) {
          console.error("Failed to join the game:", error);
        });
      }
    } catch (error) {
      console.error("Error executing smart contract function:", error);
    }
    try {
      const web3 = new Web3(window.ethereum);
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      await contractInstance.methods.startGame().send({ from: currentAccount }).then(function (receipt) {
        console.log("Game started:", receipt);
      }).catch(function (error) {
        console.error("Failed to start the game:", error);
      });

    } catch (error) {
      console.error(error);
    }
  };


  const fetchMetadata = async (uri) => {
    const response = await fetch(uri);
    const metadata = await response.json();
    return metadata;
  };

  const fetchUserNFTs = async () => {
    const web3 = new Web3(window.ethereum);
    const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);

    const balance = await contractInstance.methods.balanceOf(currentAccount).call();
    console.log(`Recipient's balance: ${balance.toString()}`);
    const userNFTsIds = [];
    if (balance > 0) {
      const maxTokenId = await contractInstance.methods.maxTokenId().call();
      for (let i = 0; i <= maxTokenId; i++) {
        const owner = await contractInstance.methods.ownerOf(i).call();
        if (owner.toLowerCase() === currentAccount.toLowerCase()) {
          userNFTsIds.push(i);
        }
      }
    } else {
      console.log("No tokens found for recipient.");
    }

    console.log(`Recipient's tokenIds: ${JSON.stringify(userNFTsIds)}`);

    const nftURIsPromises = userNFTsIds.map((tokenId) => contractInstance.methods.tokenURI(tokenId).call());
    const nftURIs = await Promise.all(nftURIsPromises);

    const metadataPromises = nftURIs.map((uri) => fetchMetadata(uri));
    const metadataArray = await Promise.all(metadataPromises);

    const userNFTs = metadataArray.map((metadata, index) => ({
      id: userNFTsIds[index],
      uri: nftURIs[index],
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
    }));

    setUserNFTs(userNFTs);
  };

  const onResetGame = async () => {
    try {

      setPlayerData([])
      setGameStarted(false);
      setTurnPlayer(0);
      setIsHumanPlayer(false);
      setGameOver(false);
      setShowRankings(false)
      const web3 = new Web3(window.ethereum);
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      await contractInstance.methods.resetGame().send({ from: currentAccount });
    } catch (error) {
      console.error("Error executing smart contract function:", error);
    }
  };


  const isCurrentUserFirstPlace = () => {
    const sortedPlayerData = [...playerData].sort((a, b) => a.ranking - b.ranking);
    const firstPlacePlayer = sortedPlayerData[0];
    console.log("firstPlacePlayer.address " + firstPlacePlayer.address)
    return firstPlacePlayer.address.toLowerCase() === currentAccount.toLowerCase();
  };

  const handleClaimNFT = async () => {

    const tokenURI =
      "https://api.jsonstorage.net/v1/json/2f4d94b8-3879-47f7-a56f-89b6df6543a9/4a77d887-f692-431d-a50d-0fcf5db0acad";
    const web3 = new Web3(window.ethereum);
    const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
    try {
      const tx = await contractInstance.methods.claimNFT(tokenURI).send({ from: currentAccount });
      console.log("NFT claimed successfully:", tx);
      fetchUserNFTs();
    } catch (error) {
      console.error("Error claiming NFT:", error);
    }
  };

  const renderClaimedNFT = () => {
    return (
      <div>
        <h1>Your NFTs</h1>
        <ul>
          {userNFTs.map((nft) => (
            <div key={nft.id}>
              <h2>{nft.name}</h2>
              <p>{nft.description}</p>
              <img src={nft.image} alt={nft.name} />
            </div>
          ))}
        </ul>
      </div>
    );
  };

  const renderClaimNFTButton = () => {
    if (isCurrentUserFirstPlace()) {
      return (
        <Button onClick={handleClaimNFT} className="mt-3">
          Claim NFT
        </Button>
      );
    }
    return null;
  };

  // Render the player hands based on the playerData state
  const renderPlayerHand = (player) => {
    const isHumanPlayer = player.name === "Player";
    return (
      <div>
        <h2>{player.name}</h2>
        {player.hand.map((card, index) => {
          if (parseInt(card) === 0) {
            return null;
          }
          const convertedCard = convertToCardsArray(card);
          return (
            <>
              <Card
                key={index}
                card={convertedCard}
                faceDown={!isHumanPlayer}
                onClick={!isHumanPlayer ? () => onCardClick(index) : null}
              />
              <span>{convertedCard.rank}</span>
            </>
          );
        })}
      </div>
    );
  };


  const renderRankings = () => {
    const humanPlayer = playerData.find((player) => player.name === "Player");

    return (
      <Modal show={showRankings} onHide={() => setShowRankings(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {playerData.map((player) => (
            <p key={player.name}>
              {player.won ? "勝ち: " : "負け: "}
              {player.name}
            </p>
          ))}
          {humanPlayer.won && renderClaimNFTButton()}
        </Modal.Body>
      </Modal>
    );
  };

  const renderStartButton = () => {
    return (
      <Container>
        <Row>
          <Col>
            <Button onClick={startGame}>
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
    <div>
      <Container>
        <Row>
          <Col>
            <button
              className="cta-button connect-wallet-button"
              onClick={connectWalletAction}
            >
              Connect Wallet To Get Started
            </button>
            {renderStartButton()}
            {renderResetButton()}
          </Col>
        </Row>
        {gameStarted && !showRankings && (
          <Row>
            <Message message={drawnCardInfo?.message} />
            {playerData.map((player) => (
              <Col key={player.id}>{renderPlayerHand(player)}</Col>
            ))}
          </Row>
        )}
        {showRankings && renderRankings()}
        {showRankings && renderClaimedNFT()}
      </Container>
    </div>
  )
};

export default App;