import React from 'react';

const NFTCollection = ({ userNFTs }) => {
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

export default NFTCollection;
