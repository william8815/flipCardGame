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
  displayCards() {
    // Array.from(Array(52).keys()) : 將陣列中52個空值的 index 形成新陣列
    // 下列方法省的用 for 迴圈、 += 把字串串接起來
    document.querySelector('#cards').innerHTML = utility.getRandomNumberArray(52).map(value => this.getCardElement(value)).join("")
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
  flipCard(card) {
    // 如果是背面，回傳正面
    if (card.classList.contains('back')) {
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index))
      return
    }
    // 如果是正面，回傳背面
    card.classList.add('back')
    card.innerHTML = null
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
view.displayCards()

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener('click', function onClickedCard() {
    view.flipCard(card)
  })
})
