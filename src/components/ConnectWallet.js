import React, { useState } from 'react';
import Web3 from 'web3';

const ConnectWallet = () => {
  const [account, setAccount] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      } catch (error) {
        console.error('ウォレット接続エラー:', error);
      }
    } else {
      alert('Ethereum対応ウォレットが見つかりません。MetaMaskをインストールしてください。');
    }
  };

  return (
    <div>
      <h1>ウォレット接続画面</h1>
      <button onClick={connectWallet}>ウォレットに接続</button>
      {account && <p>接続したアカウント: {account}</p>}
    </div>
  );
};

export default ConnectWallet;
