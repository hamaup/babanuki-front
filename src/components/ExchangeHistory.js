import React, { useState, useEffect } from 'react';

const ExchangeHistory = () => {
  const [exchangeHistory, setExchangeHistory] = useState([]);

  useEffect(() => {
    // ここに交換履歴の取得処理を記述します。
    fetchExchangeHistory();
  }, []);

  const fetchExchangeHistory = async () => {
    // スマートコントラクトから交換履歴を取得する処理を実装します。
    // 例: const history = await contract.methods.getExchangeHistory().call();
    // 仮のデータを設定します。
    const history = [
      { player1: '0x1234...', card1: 'Card A', player2: '0x5678...', card2: 'Card B' },
      { player1: '0x5678...', card1: 'Card B', player2: '0x1234...', card2: 'Card C' },
      // ...
    ];
    setExchangeHistory(history);
  };

  return (
    <div>
      <h2>Exchange History</h2>
      <table>
        <thead>
          <tr>
            <th>Player 1</th>
            <th>Card 1</th>
            <th>Player 2</th>
            <th>Card 2</th>
          </tr>
        </thead>
        <tbody>
          {exchangeHistory.map((exchange, index) => (
            <tr key={index}>
              <td>{exchange.player1}</td>
              <td>{exchange.card1}</td>
              <td>{exchange.player2}</td>
              <td>{exchange.card2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExchangeHistory;
