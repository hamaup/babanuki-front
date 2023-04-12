import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game-scene');
  }

  preload() {
    // 背景画像の読み込み
    this.load.image('background', '/images/background/white-tiles.png');

    // 絵札画像の読み込み
    for (let i = 1; i <= 13; i++) {
      for (let j = 1; j <= 4; j++) {
        this.load.image(`card_${i}_${j}`, `/images/cards/card_${i}_${j}.png`);
      }
    }
    // ジョーカーの読み込み
    this.load.image('joker', '/images/cards/joker.png');

    this.load.image('back', '/images/cards/card_back.png');
    this.load.image('stacked_cards', '/images/cards/card_back.png');


    // 効果音の読み込み
    this.load.audio('card_pick', '/sounds/card_pick.mp3');
    this.load.audio('card_swap', '/sounds/card_swap.mp3');
    this.load.audio('win', '/sounds/win.mp3');
    this.load.audio('lose', '/sounds/lose.mp3');

    this.load.on('complete', () => {
      console.log('All assets loaded');
    });
  }

  create() {
    // 背景画像の表示
    this.add.image(400, 300, 'background');

    // 重なったカードの画像の表示
    this.add.image(400, 300, 'stacked_cards');

    // プレイヤーの初期化
    this.players = this.createPlayers();

    // カードの初期化
    this.cards = this.createCards();

    // カードの配布
    this.dealCards();

    // イベントリスナーの設定
    this.setEventListeners();
    // カードの表示
    this.displayCards();
    // ゲーム開始
    this.playGame();
  }


  createCards() {
    let cards = [];

    // 通常のカードの生成
    for (let i = 1; i <= 13; i++) {
      for (let j = 1; j <= 4; j++) {
        let card = {
          value: i,
          suit: j,
          image: this.add.image(0, 0, `card_${i}_${j}`).setVisible(false)
            .setScale(0.1)
        };
        cards.push(card);
      }
    }

    // ジョーカーの生成
    let joker = {
      value: 14,
      suit: 0,
      image: this.add.image(0, 0, 'joker').setVisible(false)
        .setScale(0.1)
    };
    cards.push(joker);

    // カードのシャッフル
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    // カードの配布が終わった後、各プレイヤーのカードを表示
    this.displayCards();
    return cards;
  }


  createPlayers() {
    const playerNames = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
    let players = playerNames.map((name, index) => {
      return {
        name,
        index,
        isNPC: index !== 0,
        hand: [],
      };
    });
    return players;
  }

  dealCards() {
    const shuffledCards = this.createCards();

    let cardIndex = 0;
    for (let i = 0; i < this.players.length; i++) {
      for (let j = 0; j < 13; j++) {
        this.players[i].hand.push(shuffledCards[cardIndex]);
        cardIndex++;
      }
    }

    // カードの配布が終わった後に同じ数字のカードを捨てる処理を実行
    this.players.forEach(player => this.discardPairs(player));
  }

  displayCards() {
    const xOffset = 90;
    const yOffset = 140;

    this.players.forEach((player, playerIndex) => {
      player.hand.forEach((card, cardIndex) => {
        const x = xOffset * cardIndex + 100;
        const y = yOffset * playerIndex + 100;

        card.image.setPosition(x, y);
        card.image.setVisible(true);
      });
    });
  }

  discardPairs(player) {
    // 同じ数字のカードを見つけて捨てる処理を実装します
    // 捨てるカードを見つけたら、プレイヤーの手札から削除します
  }

  playGame() {
    // (略)
  }

  pickCard() {
    // (略)
  }

  isMyCard(card) {
    // クリックされたカードが自分の手札のカードかどうかを判断する処理を実装します
  }

  swapCardWithNPC(card) {
    // 自分のカードとNPCのカードを交換する処理を実装します
  }

  playSwapAnimation(card1, card2) {
    // カードの交換アニメーションを再生する処理を実装します
  }

  updateCardInfo(player1, card1, player2, card2) {
    // 交換後のカード情報を更新する処理を実装します
  }

  checkGameEnd() {
    // ゲームが終了するかどうかを判断する処理を実装します
  }

  showWinner() {
    // 勝者を表示する処理を実装します
  }

  startNextRound() {
    // 次のラウンドを開始する処理を実装します
    // 例: ターンプレイヤーを変更し、新しいターンを開始する
  }
  setEventListeners() {
    this.input.on('gameobjectdown', (pointer, gameObject) => {
      // クリックされたカードの情報を取得
      const card = gameObject.getData('card');

      // クリックされたカードとプレイヤーの対応関係を確認し、カードの交換処理を行う
      // 例: クリックされたカードが自分の手札のカードの場合、NPCとカードを交換する
      if (this.isMyCard(card)) {
        this.swapCardWithNPC(card);
      }
    });
    this.input.on('gameobjectdown', (pointer, gameObject) => {
      // クリックされたオブジェクトが引くカードの場合
      if (gameObject.getData('type') === 'cardToPick') {
        this.pickCard();
      }
    });
    this.events.on('swap', (player1, card1, player2, card2) => {
      // カードの交換アニメーションや効果音を再生
      this.playSwapAnimation(card1, card2);
      this.sound.play('card_swap');

      // 交換後のカード情報を更新
      this.updateCardInfo(player1, card1, player2, card2);
    });

    this.events.on('roundend', () => {
      // ラウンド終了後の処理を行う
      // 例: 各プレイヤーの手札を確認し、ゲームが終了するかどうかを判断する
      if (this.checkGameEnd()) {
        this.events.emit('gameend');
      } else {
        this.startNextRound();
      }
    });

    this.events.on('gameend', () => {
      // ゲーム終了後の処理を行う
      // 例: 勝者を表示し、リザルト画面に遷移する
      this.showWinner();
      this.scene.start('result-scene');
    });

  }


}
