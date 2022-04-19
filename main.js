const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 紅心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png" // 梅花
]
// 放在文件最上方
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}
// View
const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
        <img src="${symbol}" alt="img">
      <p>${number}</p>`
  },
  // 生成卡牌
  getCardElement(index) {
    return `<div class="card back" data-index="${index}"></div>`
  },
  // 數字轉字母
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
  // 渲染卡牌
  displayCards() {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = utility.getRandomNumberArray(52).map((index) => this.getCardElement(index)).join('')
  },
  // 翻牌
  flipCards(...cards) {
    cards.forEach((card) => {
      // 如是反面，回傳正面
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 如是正面，回傳反面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  // 改變牌面顏色
  pairCards(...cards) {
    cards.forEach((card) => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector(".score").innerHTML = `Score: ${score}`;
  },
  renderTriedTimes(times) {
    document.querySelector(".tried").innerHTML = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}
// 洗牌 :  Fisher-Yates Shuffle 洗牌演算法
const utility = {
  getRandomNumberArray(count) {
    const arr = Array.from(Array(count).keys())
    for (let index = arr.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[arr[index], arr[randomIndex]] = [arr[randomIndex], arr[index]]
    }
    return arr
  }
}
// controller
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,  // 加在第一行
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        view.renderTriedTimes(model.triedTimes += 1)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore(model.score += 10)  // add this 
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 10) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCard, 1000)
        }
        break
    }
    // console.log('this.currentState', this.currentState)
    // console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },
  // 配對失敗，重置
  resetCard() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}
// model
const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 1
}
controller.generateCards()
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', function onClickedCard() {
    controller.dispatchCardAction(card)
  })
})
