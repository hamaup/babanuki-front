import React, { useState, useEffect } from 'react';

const CardCollection = () => {
  const [cardCollection, setCardCollection] = useState([]);

  useEffect(() => {
    // ここにカードコレクションの取得処理を記述します。
    fetchCardCollection();
  }, []);

  const fetchCardCollection = async () => {
    // スマートコントラクトからカードコレクションを取得する処理を実装します。
    // 例: const cards = await contract.methods.getCardCollection(account).call();
    // 仮のデータを設定します。
    const cards = [
      { id: 1, name: 'Card A', imageUrl: 'https://example.com/card-a.png' },
      { id: 2, name: 'Card B', imageUrl: 'https://example.com/card-b.png' },
      // ...
    ];
    setCardCollection(cards);
  };

  return (
    <div>
      <h2>Card Collection</h2>
      <div className="card-container">
        {cardCollection.map((card) => (
          <div key={card.id} className="card">
            <img src={card.imageUrl} alt={card.name} />
            <p>{card.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardCollection;
