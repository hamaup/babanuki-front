import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Table, Modal } from 'react-bootstrap';
import CONTRACT_ADDRESS from './config/contract-address';
import CONTRACT_ABI from './config/BabanukiNFT.json';
import Web3 from 'web3';
import Card from './components/Card';
const App = () => {
  const [playerData, setPlayerData] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [turnPlayer, setTurnPlayer] = useState(0);
  const [isHumanPlayer, setIsHumanPlayer] = useState(false);
  const [showRankings, setShowRankings] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const [nextTurn, setNextTurn] = useState([]);
  const [eventQueue, setEventQueue] = useState([]);

  // const processEventQueue = async () => {
  //   if (eventQueue.length > 0) {
  //     const currentEvent = eventQueue[0];
  //     const remainingEvents = eventQueue.slice(1);
  //     setEventQueue(remainingEvents);

  //     // Process the currentEvent here
  //     const updatedPlayerData = playerData.map((player, index) => {
  //       return {
  //         ...player,
  //         hand: currentEvent.returnValues[`player${index + 1}Hand`],
  //       };
  //     });
  //     if (updatedPlayerData.length > 0) {
  //       setPlayerData(updatedPlayerData);
  //     }
  //     console.log(`onCardDrawn updatedPlayerData: ${JSON.stringify(updatedPlayerData)}`);
  //   }
  // };





  // ユーザーがMetaMaskを持っているか確認します。
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
        // accountsにWEBサイトを訪れたユーザーのウォレットアカウントを格納します。
        // （複数持っている場合も加味、よって account's' と変数を定義している）
        const accounts = await ethereum.request({ method: "eth_accounts" });
        // もしアカウントが一つでも存在したら、以下を実行。
        if (accounts.length !== 0) {
          // accountという変数にユーザーの1つ目（=Javascriptでいう0番目）のアドレスを格納
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          // currentAccountにユーザーのアカウントアドレスを格納
          setCurrentAccount(account);
        } else {
          console.log("No authorized account found");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  // connectWallet メソッドを実装します。
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      // ウォレットアドレスに対してアクセスをリクエストしています。
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      // ウォレットアドレスを currentAccount に紐付けます。
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };
  // ページがロードされたときに useEffect()内の関数が呼び出されます。
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const accounts = [
    currentAccount,
    "",
    "",
    "",
  ];




  useEffect(() => {
    const web3 = new Web3('ws://localhost:8545');
    //const web3 = new Web3(window.ethereum);
    const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);


    const onGameStarted = (event) => {
      console.log("onGameStarted.evnt" + JSON.stringify(event.returnValues))
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
      console.log(` newPlayerData: ${JSON.stringify(newPlayerData)}`);
      setPlayerData(newPlayerData);
      setGameStarted(true);
      setShowRankings(false);
      executeNextPlayer();

    };

    const onCardDrawn = (event) => {
      //setEventQueue([...eventQueue, event]);
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
      console.log(`onCardDrawn updatedPlayerData: ${JSON.stringify(updatedPlayerData)}`);
    };

    const onPlayerFinished = (event) => {
      console.log("onPlayerFinished")
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
      //setWaitingForEvent(false);
    };

    const onGameOver = (event) => {
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
      console.log("updatedPlayerData" + JSON.stringify(updatedPlayerData))
      setPlayerData(updatedPlayerData);
      setGameOver(true);
      setShowRankings(true);
    };

    // const onNextTurn = async (event) => {
    //   console.log("event.onNextTurn" + JSON.stringify(event.returnValues));
    //   setNextTurn(event.returnValues);
    // };
    const onHandleNFTAwarded = async (event) => {
      console.log("event.onHandleNFTAwarded" + JSON.stringify(event.returnValues));
      if (event.returnValues.recipient === currentAccount) {
        alert("NFTを受け取りました!");
      }
    };

    //const nextTurnEvent = contractInstance.events.NextTurn({}).on("data", onNextTurn);
    const NFTAwardedEvent = contractInstance.events.NFTAwarded({}).on("data", onHandleNFTAwarded);
    const cardDrawnEvent = contractInstance.events.CardDrawn({}).on("data", onCardDrawn);
    const playerFinishedEvent = contractInstance.events.PlayerFinished({}).on("data", onPlayerFinished);
    const gameOverEvent = contractInstance.events.GameOver({}).on("data", onGameOver);
    const gameStartedEvent = contractInstance.events.GameStarted({}).on("data", onGameStarted);
    // const intervalId = setInterval(() => {
    //   processEventQueue();
    // }, 5000);
    return () => {
      //clearInterval(intervalId);
      gameStartedEvent.unsubscribe();
      cardDrawnEvent.unsubscribe();
      playerFinishedEvent.unsubscribe();
      gameOverEvent.unsubscribe();
      NFTAwardedEvent.unsubscribe();
      //nextTurnEvent.unsubscribe();

    };
  }, [playerData, currentAccount, nextTurn]);

  const drawCard = async (cardIndex, nextPlayerIndex) => {
    console.log("drawCard")
    //setWaitingForEvent(true);
    const web3 = new Web3('ws://localhost:8545');
    //const web3 = new Web3(window.ethereum);
    const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);

    const player = playerData[turnPlayer];
    const nextPlayer = playerData[nextPlayerIndex];
    const senderAddress = player.address;
    if (player.hasEmptyHand) {
      console.error(`${player.name}はもう手札がありません`);
      return;
    }
    console.error(`${player.address}が${nextPlayer.address}からカード(${cardIndex})を引こうとしますよ`);
    if (nextPlayer.hasEmptyHand) { // 手札がないプレイヤーからはカードを引けない
      console.error(`${player.name}が${nextPlayer.name}からカードを引こうとしましたが、${nextPlayer.name}の手札は空でした。`);
      return;
    }
    //console.log(`before drawCard updatedPlayerData: ${JSON.stringify(playerData)}`);
    try {
      await contractInstance.methods.drawCard(turnPlayer, nextPlayerIndex, cardIndex, nextPlayerIndex).send({ from: senderAddress });
      console.log(`${player.name}が${nextPlayer.name}のカード${nextPlayer.hand[cardIndex]}(${cardIndex})をスマートコントラクトに渡しました`);
    } catch (error) {
      console.error(`${player.name}が${nextPlayer.name}のカード${nextPlayer.hand[cardIndex]}(${cardIndex})をスマートコントラクトに渡せませんでした:`, error);
      return;
    }
    //console.log(`after drawCard updatedPlayerData: ${JSON.stringify(playerData)}`);
  };


  const handleNextTurn = () => {
    if (gameOver) {
      return;
    }
    console.log("handleNextTurn");
    setTurnPlayer((prevTurnPlayer) => (prevTurnPlayer + 1) % playerData.length);
    //setNextTurn(0)
  };

  const executeNextPlayer = async () => {
    //console.log("playerData" + JSON.stringify(playerData))
    if (playerData.length === 0) {
      return;
    }
    console.log("executeNextPlayer")
    const currentPlayer = playerData[turnPlayer];
    if (currentPlayer.name === "Player 1") { // Human player
      if (currentPlayer.hasEmptyHand) {
        //handleNextTurn();
        return;
      }
      setIsHumanPlayer(true);
      console.log("あなたの番です")
    } else { // NPC

      //if (currentPlayer.hasEmptyHand) {
      //handleNextTurn();
      //  return;
      //}

      // let nextPlayerIndex = turnPlayer;
      // do {
      //   nextPlayerIndex = (nextPlayerIndex + 1) % playerData.length;
      // } while (nextPlayerIndex !== turnPlayer && playerData[nextPlayerIndex].hasEmptyHand);

      // let cardIndex = Math.floor(Math.random() * playerData[nextPlayerIndex].hand.length);
      // let card = playerData[nextPlayerIndex].hand[cardIndex];
      // while (card === "0") {
      //   cardIndex = Math.floor(Math.random() * playerData[nextPlayerIndex].hand.length);
      //   card = playerData[nextPlayerIndex].hand[cardIndex];
      // }
      //console.log(`${currentPlayer.name}が${playerData[nextPlayerIndex].name}のカード${card}(${cardIndex})を引きますよ`);

      //await drawCard(cardIndex, nextPlayerIndex);
      //console.log(`${currentPlayer.name}が${playerData[nextPlayerIndex].name}のカード${card}(${cardIndex})を引きました`);

      await new Promise(resolve => setTimeout(resolve, 2000));
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
    } while (nextPlayerIndex !== turnPlayer && playerData[nextPlayerIndex].hasEmptyHand);

    console.log("cardIndex;" + cardIndex)
    setIsHumanPlayer(false);
    await drawCard(cardIndex, 2);
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
    const suit = hand.charAt(0);
    const rank = hand.substring(1);
    const card = { suit: suit, rank: rank }
    return card;
  }


  const startGame = async () => {
    try {
      //const web3 = new Web3(window.ethereum);
      const web3 = new Web3('ws://localhost:8545');
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      const res = await contractInstance.methods.sayHello().call();
      console.log('Response from smart contract:', res);
    } catch (error) {
      console.error('Error executing smart contract function:', error);
    }
    try {
      const web3 = new Web3('ws://localhost:8545');
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      await contractInstance.methods.startGame().send({ from: currentAccount }).then(function (receipt) {
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


  const fetchMetadata = async (uri) => {
    const response = await fetch(uri);
    const metadata = await response.json();
    return metadata;
  };

  const fetchUserNFTs = async () => {
    const web3 = new Web3('ws://localhost:8545');
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

      const web3 = new Web3('ws://localhost:8545');
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      await contractInstance.methods.resetGame().send({ from: currentAccount });
    } catch (error) {
      console.error("Error executing smart contract function:", error);
    }
  };



  const onJoinGame = async () => {
    try {
      const web3 = new Web3('ws://localhost:8545');
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);

      // const web3 = new Web3(window.ethereum);
      // const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      const numberOfPlayers = await contractInstance.methods.getNumberOfPlayers().call();
      if (numberOfPlayers <= 4) {
        await contractInstance.methods.joinGame(currentAccount).send({ from: currentAccount }).then(function (receipt) {
          console.log("Players have joined the game:", receipt);
        }).catch(function (error) {
          console.error("Failed to join the game:", error);
        });
      }
    } catch (error) {
      console.error("Error executing smart contract function:", error);
    }
  };

  const isCurrentUserFirstPlace = () => {
    // playerData をランキング順にソート
    const sortedPlayerData = [...playerData].sort((a, b) => a.ranking - b.ranking);

    // 1位のプレーヤーを取得
    const firstPlacePlayer = sortedPlayerData[0];

    // 1位のプレーヤーのアドレスが現在のユーザーのアドレスと一致するかどうかを確認
    //return firstPlacePlayer.address === currentUserAddress;
    console.log("firstPlacePlayer.address " + firstPlacePlayer.address)
    console.log("currentAccount " + currentAccount)
    return firstPlacePlayer.address.toLowerCase() === currentAccount.toLowerCase();
  };

  const handleClaimNFT = async () => {

    const tokenURI =
      "https://api.jsonstorage.net/v1/json/2f4d94b8-3879-47f7-a56f-89b6df6543a9/4a77d887-f692-431d-a50d-0fcf5db0acad";
    const web3 = new Web3('ws://localhost:8545');
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
    // 人間プレーヤーかどうかを判断するローカル変数
    const isHumanPlayer = player.name === "Player 1";

    return (
      <div>
        <h2>{player.name}</h2>
        {
          player.hand.map((card, index) => {
            if (parseInt(card) === 0) {
              return null;
            }
            const convertedCard = convertToCardsArray(card);
            return (
              <>
                <Card
                  key={index}
                  card={convertedCard}
                  faceDown={0} // 人間プレーヤーでなければfaceDownをtrueに設定
                  onClick={() => onCardClick(index)}
                />
                <span>{convertedCard.rank}</span>
              </>
            );
          })
        }

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
          {renderClaimNFTButton()}
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

  const renderJoinButton = () => {
    return (
      <Button onClick={onJoinGame} >
        Join Game
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
            {renderJoinButton()}
            {renderStartButton()}
            {renderResetButton()}
          </Col>
        </Row>
        {gameStarted && !showRankings && (
          <Row>
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