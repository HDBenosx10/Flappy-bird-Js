function newElement (tagName,className) {
    const element = document.createElement(tagName)
    element.className = className
    return element

}

function Barrier (reverse = false) {
    this.element = newElement('div','barrier')

    const border = newElement('div','border')
    const body = newElement('div','body')

    this.element.appendChild(reverse ? body : border)
    this.element.appendChild(reverse ? border : body)

    this.setHeight = height => body.style.height = `${height}px`

}

function PairOfBarriers(height, opening, x ) {
    this.element = newElement('div','pair-of-barriers')

    this.upper = new Barrier(true)
    this.bottom = new Barrier(false)

    this.element.appendChild(this.upper.element)
    this.element.appendChild(this.bottom.element)

    this.sortOpening = () => {
        const upperHeight = Math.random() * (height - opening)
        const bottomHeight = height - opening - upperHeight
        this.upper.setHeight(upperHeight)
        this.bottom.setHeight(bottomHeight)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.sortOpening()
    this.setX(x)
}

function Barriers (height, width, opening, spaceBetween, addScore) {
    this.pairs = [
        new PairOfBarriers(height, opening, width),
        new PairOfBarriers(height, opening, width + spaceBetween),
        new PairOfBarriers(height, opening, width + spaceBetween * 2),
        new PairOfBarriers(height, opening, width + spaceBetween * 3)
    ]

    const displacement = 3
    this.animate = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            if ( pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + spaceBetween * this.pairs.length)
                pair.sortOpening()

            }

            const middle = width / 2
            const pastMiddle = pair.getX() + displacement >= middle
                && pair.getX() < middle
            if(pastMiddle) addScore()
        })
    }
}


function Bird(gameHeight) {
    let flying = false

    this.element = newElement('img','bird')
    this.element.src = './imgs/passaro.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    this.animate = () => {
        const newY = this.getY() + (flying ? 8 : -5)
        const maxHeight = gameHeight - this.element.clientHeight

        flying ? this.element.style.transform = "rotate(-10deg)" :
        this.element.style.transform = "rotate(10deg)"

        if(newY <= 0) {
            this.setY(0)

        } else if (newY >= maxHeight){
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }

    }
    this.setY(gameHeight / 2)
}

function Progress () {
    this.element = newElement('span','progress')
    this.updateScore = score => {
        this.element.innerHTML = score
    }
    this.updateScore(0)
}

function isOverlapping(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function collided(bird, barriers) {
    let collided = false
    barriers.pairs.forEach(pairOfBarriers => {
        if (!collided) {
            const upper = pairOfBarriers.upper.element
            const bottom = pairOfBarriers.bottom.element
            collided = isOverlapping(bird.element, upper)
                || isOverlapping(bird.element, bottom)
        }
    })
    return collided
}

function checkScore (newScore) {
    const congrats = newElement('div','congrats')
    const congratsText = newElement('p','congrats-text')
    congratsText.innerHTML = "NEW HIGHSCORE !!!"
    congrats.appendChild(congratsText)
    const gameScreen = document.querySelector('[wm-flappy]')

    let highScore = localStorage.getItem('highScore') || 0
    if ( highScore < newScore ) {
        localStorage.setItem('highScore', newScore)
        highScore = newScore
        gameScreen.appendChild(congrats)
    }


    return highScore

}

function gameOver (newScore) {
    const gameScreen = document.querySelector('[wm-flappy]')
    const gameOverBg = newElement('div','game-over-bg')
    const gameOverScreen = newElement('div','game-over')
    const scoreStatus = newElement('div','score-status')
    const playAgain = newElement('div','play-again')
    const score = newElement('p','score')
    const highScore = newElement('p','high-score')

    highScore.innerHTML = `High Score ${checkScore(newScore)}`
    score.innerHTML = `Score ${newScore}`
    playAgain.innerHTML = `&#9658;`

    playAgain.onclick = e => document.location.reload()
    
    scoreStatus.appendChild(highScore)
    scoreStatus.appendChild(score)

    gameOverScreen.appendChild(scoreStatus)
    gameOverScreen.appendChild(playAgain)

    gameOverBg.appendChild(gameOverScreen)
    gameScreen.appendChild(gameOverBg)

}



function FlappyBird () {
    let score = 0

    const gameScreen = document.querySelector('[wm-flappy]')
    const height = gameScreen.clientHeight
    const width = gameScreen.clientWidth

    const progress = new Progress()
    const barriers = new Barriers(height, width, 200, 400,
        () => progress.updateScore(++score))
    const bird = new Bird(height)

    gameScreen.appendChild(progress.element)
    gameScreen.appendChild(bird.element)
    barriers.pairs.forEach( pair => gameScreen.appendChild(pair.element) )

    this.start = () => {
        const timer = setInterval (() => {
            barriers.animate()
            bird.animate()

            if(collided(bird,barriers)) {
                gameOver(score)
                clearInterval(timer)
            }
        },20)
    }
}

new FlappyBird().start()