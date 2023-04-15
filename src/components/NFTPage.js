import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import CONTRACT_ADDRESS from '../config/contract-address';
import CONTRACT_ABI from '../config/BabanukiNFT.json';

const NFTPage = () => {
  const [userNFTs, setUserNFTs] = useState([]);

  // 2. ユーザーのアドレスから保有しているNFTを取得
  useEffect(() => {
    const fetchUserNFTs = async () => {
      const web3 = new Web3('ws://localhost:8545');
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
      const userAddress = (await web3.eth.getAccounts())[0];

      const balance = await contractInstance.methods.balanceOf(userAddress).call();
      const userNFTsPromises = [];
      for (let i = 0; i < balance; i++) {
        userNFTsPromises.push(contractInstance.methods.tokenOfOwnerByIndex(userAddress, i).call());
      }
      const userNFTsIds = await Promise.all(userNFTsPromises);

      const nftURIsPromises = userNFTsIds.map((tokenId) => contractInstance.methods.tokenURI(tokenId).call());
      const nftURIs = await Promise.all(nftURIsPromises);

      const userNFTs = nftURIs.map((uri, index) => ({ id: userNFTsIds[index], uri }));
      setUserNFTs(userNFTs);
    };

    fetchUserNFTs();
  }, []);

  // 3. 取得したNFTを表示するリストを作成
  return (
    <div>
      <h1>Your NFTs</h1>
      <ul>
        {userNFTs.map((nft) => (
          <li key={nft.id}>
            <p>ID: {nft.id}</p>
            <p>URI: {nft.uri}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NFTPage;
