import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import CONTRACT_ADDRESS from '../config/contract-address';
import CONTRACT_ABI from '../config/BabanukiNFT.json';
import './Profile.css';

const Profile = ({ currentAccount }) => {
  const [userNFTs, setUserNFTs] = useState([]);

  useEffect(() => {
    fetchUserNFTs();
  }, [currentAccount]);

  const fetchMetadata = async (uri) => {
    const response = await fetch(uri);
    const metadata = await response.json();
    return metadata;
  };

  const fetchUserNFTs = async () => {
    const web3 = new Web3(window.ethereum);
    const contractInstance = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);

    const balance = await contractInstance.methods.balanceOf(currentAccount).call();
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

  return (
    <div>
      <h2>Your NFTs Collection</h2>
      <ul>
        {userNFTs.map((nft) => (
          <div key={nft.id} className="nft-item">
            <img src={nft.image} alt={nft.name} className="nft-image" />
            <h3>{nft.name}</h3>
            <p>{nft.description}</p>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default Profile;
