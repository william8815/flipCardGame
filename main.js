// 建立遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished"
}

// 花色圖檔
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]
// view
const view = {
  // 卡片內容
  getCardContent(index) {
    // num =>  (index % 13) + 1，取餘數再加 1
    const num = this.transformNumber((index % 13) + 1)
    // img => Symbols[0/1/2/3]，直接除 13 再捨去小數點，取的索引值
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${num}</p>
      <img src="${symbol}" alt="">
      <p>${num}</p>`
  },
  // 卡片處理
  getCardElement(index) {
    return `
    <div class="card back" data-index="${index}"></div>`
  },
  // 卡片渲染
  displayCards(indexs) {
    // Array.from(Array(52).keys()) : 將陣列中52個空值的 index 形成新陣列
    // 下列方法省的用 for 迴圈、 += 把字串串接起來
    document.querySelector('#cards').innerHTML = indexs.map(value => this.getCardElement(value)).join("")
  },
  // 數字轉換子母
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  // 翻牌
  flipCard(...cards) {
    cards.map((card) => {
      // 如果是背面，回傳正面
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 如果是正面，回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  // 配對成功樣式更改
  pairCard(...cards) {
    cards.map((card) => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector(".score").innerHTML = `Score: ${score}`;
  },
  renderTriedTimes(times) {
    document.querySelector(".tried").innerHTML = `You've tried: ${times} times`;
  },
  // 配對失敗動畫
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add('wrong')
      // 動畫結束事件
      card.addEventListener('animationend', event => {
        event.target.classList.remove('wrong'), { once: true } // once: true =>事件結束一次之後，卸載監聽器
      })
    })
  },
  // 遊戲結束畫面
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('complete')
    div.innerHTML = `
    <p>Complete!</p>
    <p>Score: ${model.score}</p>
    <p>You've tried: ${model.triedTimes} times</p>`
    const header = document.querySelector('.header')
    header.before(div)
  }
}
// 洗牌
const utility = {
  // Fisher-Yates Shuffle 洗牌演算法
  // 從陣列中隨機抽值，跟最後一值交換，每抽一次 => index--
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 1; index--) {
      let random = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[random]] = [number[random], number[index]]
    }
    return number
  }
}

// Model
const model = {
  revealedCards: [], // 存放翻牌結果
  // 配對結果
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0, // 分數
  triedTimes: 0 // 嘗試次數
}

// Controller
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  // 啟動遊戲初始化
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  // 翻牌後的遊戲狀態
  dispatchCardAction(card) {
    // 卡片正面時
    if (!card.classList.contains('back')) return
    // 卡片背面時
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits: // 第一次抽排
        view.flipCard(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break;
      case GAME_STATE.SecondCardAwaits: // 第二次抽排
        view.flipCard(card)
        model.revealedCards.push(card)
        view.renderTriedTimes(model.triedTimes += 1)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          this.currentState = GAME_STATE.CardsMatched
          view.pairCard(...model.revealedCards)
          model.revealedCards = []
          this.currentState = GAME_STATE.FirstCardAwaits
          view.renderScore(model.score += 10)
          // 達到 260 分，遊戲結束
          if (model.score === 260) {
            // console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          // 卡片重設
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    // console.log('this.currentState', this.currentState)
    // console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },
  resetCards() {
    view.flipCard(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

controller.generateCards()

// 點擊卡片，進入遊戲流程
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener('click', function onClickedCard() {
    controller.dispatchCardAction(card)
  })
})
