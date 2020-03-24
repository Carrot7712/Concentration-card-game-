const GAME_STATE = {
    FirstCardAwaits:'FirstCardAwaits',
    SecondCardAwaits:'SecondCardAwaits',
    CardsMatchFailed:' CardsMatchFailed',
    CardsMatched:'CardsMatched',
    GameFinished:' GameFinished'
}
const Symbols = [
    'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
    'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
    'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
    'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
  ]
  //=======================管理資料(材料)==================
  const model={
      //暫存牌組，用來檢查是否配對成功
    revealCards:[],
    //檢查數字是否一樣
    isRevealedCardsMatched(){
        return this.revealCards[0].dataset.index % 13 ===
        this.revealCards[1].dataset.index % 13
    }
  }
//============================顯示畫面=====================
const view ={
    //生成牌的外框
    getCardElement(index){
        return `
        <div data-index="${index}" class="card back">
        </div>
        `
    },
    //生成牌的內容
    getCardContent(index){
        const number = this.transformNumber((index%13)+1)
        const symbol =Symbols[Math.floor(index/13)]
        return `
        <p>${number}</p>
        <img src="${symbol}"/>
        <p>${number}</p>
        `
    },
    //讓1.11.12.13顯示為A.J.Q.K
    transformNumber(number){
        switch(number){
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
    
    //傳入已打散過的陣列，產生52張卡片
    displayCards(indexes){
        const rootElement=document.querySelector('#cards')
        rootElement.innerHTML =
        // Array.from(Array(52).keys()) //生成陣列[0,1,...,51]按照順序
        // utility.getRandomNumberArray(52) //原本是 displayCards()去呼叫洗牌的函式，現在改成請controller去呼叫，這行改寫在controller
        indexes
        .map(index =>                //把陣列裡的東西拿出來，一個一個丟進getCardElement()去生成卡片
            this.getCardElement(index)
        ).join('')  //把map生成的陣列用空格連接轉成一個字串
        
    },
    //卡片翻正/反面
    flipCard(card){
        // console.log(card.dataset.index)
        //如果是正面
        if(card.classList.contains('back')){
            card.classList.remove('back')
            card.innerHTML=this.getCardContent(Number(card.dataset.index))
            //回傳背面
            return
        }
        //如果是背面
        card.classList.add('back')
        card.innerHTML= null
        //回傳正面
    },
    pairCard(card){
        card.classList.add('paired')
    }
}
//==========呼叫對應的人去做事`,中央指揮中心================
const controller ={
    currentState:GAME_STATE.FirstCardAwaits,
    //開始遊戲
    generateCards(){
                            //傳入一個已經打亂的陣列
        view.displayCards(utility.getRandomNumberArray(52))
    },
    //核心：發配狀態
    dispatchCardAction(card){
        // console.log(card) //<div data-index="13" class="card">...</div>
        //如果卡片不是背面，不用再做任何處理，被點到也不該有反應
        if(!card.classList.contains('back')){
            return //結束此函式
        }
        //依照不同狀態推進遊戲
        switch(this.currentState){
            case GAME_STATE.FirstCardAwaits:
                view.flipCard(card)
                model.revealCards.push(card)
                this.currentState=GAME_STATE.SecondCardAwaits
                break
            case GAME_STATE.SecondCardAwaits:
                view.flipCard(card)
                model.revealCards.push(card)
                // 判斷配對是否成功
                if(model.isRevealedCardsMatched()){
                    // console.log(model.isRevealedCardsMatched())
                    //配對成功
                    //改狀態
                    this.currentState = GAME_STATE.CardsMatched
                    //換卡片底色
                    view.pairCard(model.revealCards[0])
                    view.pairCard(model.revealCards[1])
                    //清空暫存
                    model.revealCards=[]
                    this.currentState = GAME_STATE.FirstCardAwaits
                }else{
                    //配對失敗
                        this.currentState=GAME_STATE.CardsMatchFailed
                    //先等一秒鐘讓玩家記憶
                    setTimeout(()=>{
                        //然後執行
                        //把卡片翻回去
                    view.flipCard(model.revealCards[0])
                    view.flipCard(model.revealCards[1])
                    //清空暫存
                    model.revealCards=[]
                    //改狀態
               this.currentState = GAME_STATE.FirstCardAwaits
                    },1000)
                }
                break
        }
        // console.log('this',this) //這個物件
        console.log('current state:',this.currentState) //SecondCardAwaits
        console.log('revealedCards', model.revealedCards)
        
        }   
    }

//=====================工具=======================
const utility = {
    getRandomNumberArray(count){
        //count = 5 //[2,3,4,1,0]
        const number =Array.from(Array(count).keys())
        for(let index = number.length-1;index>0;index--){
            //決定這張牌要跟前面的隨機某一張交換
            let randomIndex =Math.floor(Math.random()*(index+1))
            ;[number[index],number[randomIndex]]=[number[randomIndex],number[index]]
        }
        return number
    }
}

//==========================global=====================
controller.generateCards()

// console.log(utility.getRandomNumberArray(5))
document.querySelectorAll('.card').forEach(card=>
    card.addEventListener('click',event=>{
        // console.log(card)
        controller.dispatchCardAction(card)
    })
    )