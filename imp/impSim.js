function rollOrdinaryDice() {
    return Math.floor(Math.random() * 6) + 1
}

function StarryMushrooms(currentPosition, roll) {
    if (roll < 0) {
        return
    }

    let newPosition = currentPosition + roll
    let addStars = 0
    if (newPosition === 4 || newPosition === 24) {
        addStars = 2 + ((mushroomLevels[1] < 3) ? mushroomLevels[1]++: mushroomLevels[1])
    } else if (newPosition === 11) {
        addStars = 2 + ((mushroomLevels[2] < 3) ? mushroomLevels[2]++: mushroomLevels[2])
    } else if (newPosition === 18) {
        addStars = 2 + ((mushroomLevels[3] < 3) ? mushroomLevels[3]++: mushroomLevels[3])
    }
    
    if (currentPosition < 4 && 4 < newPosition) {
        addStars += 2 + mushroomLevels[1]
    }
    if (currentPosition < 11 && 11 < newPosition) {
        addStars += 2 + mushroomLevels[2]
    }
    if (currentPosition < 18 && 18 < newPosition) {
        addStars += 2 + mushroomLevels[3]
    }
    if (doubleStars) {
        addStars *= 2
        doubleStars = false
    }
    stars += addStars
}

function printMushroomLevels() {
    for (let [mushroom, level] of Object.entries(mushroomLevels)) {
        console.info(`'Mushroom${mushroom} Level: ${level}`)
    }
}

function increaseRandomMushroomHut() {
    if (Object.values(mushroomLevels).every(mushroom => mushroom === 3)) {
        return
    }

    let availableMushrooms = []
    for (let [mushroom, level] of Object.entries(mushroomLevels)) {
        if (level < 3) {
            availableMushrooms.push(mushroom)
        }
    }

    let choice = availableMushrooms[Math.floor(Math.random() * availableMushrooms.length)]
    mushroomLevels[choice] = ++mushroomLevels[choice]
}

function decreaseRandomMushroomHut() {
    if (Object.values(mushroomLevels).every(mushroom => mushroom === 1)) {
        return
    }

    let availableMushrooms = []
    for (let [mushroom, level] of Object.entries(mushroomLevels)) {
        if (level > 1) {
            availableMushrooms.push(mushroom)
        }
    }

    let choice = availableMushrooms[Math.floor(Math.random() * availableMushrooms.length)]
    mushroomLevels[choice] = --mushroomLevels[choice]
}

function FortuneHut(newPosition) {
    tarotNum = Math.floor(Math.random() * 9)
    switch(tarotNum) {
        case 0:
            increaseRandomMushroomHut()
            break;
        case 1:
            decreaseRandomMushroomHut()
            break
        case 2:
            // move backwards on next roll
            moveForward = false
            break
        case 3:
            // forfeit resources
            break
        case 4:
            // double rewards on next mushroom hut
            doubleStars = true
            break;
        case 5:
            // CopyCat
            doubleRoll = true
            break
        case 6:
            // Rebirth Card - return to start
            newPosition = -1
            break
        case 7:
            // Energy Chest - free resource chest
            break
        case 8:
            rollTwoDice = true
            break
        default:
            throw new Error('Fortune Hut not found')
    }
    return newPosition
}

function move(currentPosition, roll) {
    let newPosition = currentPosition + roll
    StarryMushrooms(currentPosition, roll)
    if (newPosition > 20) {
        newPosition -= 20
    }
    
    if (newPosition === 5) {
        ordDiceAvailable++
    } else if (newPosition === 10) {
        newPosition = FortuneHut(newPosition)
    } else if (newPosition === 15) {
        karmaEnabled = true
    } else if (newPosition === 20) {
        luckyDiceAvailable++
    } 

    return newPosition
}

function getRoll() {
    let roll
    if (doubleRoll || rollTwoDice) {
        if (luckyDiceAvailable > 0) {
            roll = 10
            luckyDiceAvailable--
        } else if (doubleRoll) {
            roll = rollOrdinaryDice() * 2
            ordDiceAvailable--
        } else if (rollTwoDice) {
            roll = rollOrdinaryDice() + rollOrdinaryDice()
            ordDiceAvailable--
        } else {
            throw new Error('Unknown Dice')
        }
        doubleRoll = false
        rollTwoDice = false
    } else if (karmaEnabled === true && luckyDiceAvailable > 1) {
        roll = 6
        luckyDiceAvailable--
    } else if (luckyDiceAvailable > 0 && [14, 16, 17, 18].includes(currentPosition)) {
        roll = 20 - currentPosition
        luckyDiceAvailable--
    } else if (luckyDiceAvailable > 0 && ordDiceAvailable == 0) {
        if ([20, 1, 2, 3, 4].includes(currentPosition)) {
            roll = 5 - (currentPosition % 20)
        } else if ([6, 7, 8, 9].includes(currentPosition)) {
            roll = 11 - currentPosition
        } else if ([12, 13].includes(currentPosition)) {
            roll = 18 - currentPosition
        } else {
            roll = 6
        }
        luckyDiceAvailable--
    } else {
        roll = rollOrdinaryDice()
        ordDiceAvailable--
    }

    if (moveForward === false) {
        roll *= -1
        moveForward = true
    } else if (karmaEnabled === true) {
        if (roll % 2 === 1) {
            roll *= -1
        }
        karmaEnabled = false
    }
    return roll
}

function resetSimulation() {
    currentPosition = 0
    mushroomLevels = {
        1: 1, 
        2: 1, 
        3: 1
    }
    stars = 0
    ordDiceAvailable = 78
    luckyDiceAvailable = 0
    moveForward = true
    doubleStars = false
    doubleRoll = false
    rollTwoDice = false
    karmaEnabled = false
}

var currentPosition
var mushroomLevels
var stars
var ordDiceAvailable
var luckyDiceAvailable
var moveForward
var doubleStars
var doubleRoll
var rollTwoDice
var karmaEnabled

var starsArray = []
var simulations = 1000000
const debug = false

function runSimulation() {
    resetSimulation()

    while (ordDiceAvailable > 0 || luckyDiceAvailable > 0) {
        let roll = getRoll()
        if (debug) {
            console.log(`currentPosition: ${currentPosition}, roll: ${roll}`) 
        }
        currentPosition = move(currentPosition, roll)
        if (debug) { 
            console.log(`newPosition: ${currentPosition}, Stars: ${stars}`) 
            console.log(`Remaining Lucky Dice: ${luckyDiceAvailable}, Ordinary Dice: ${ordDiceAvailable}`)
            printMushroomLevels()
        }
    }
    // console.log('Stars: ' + stars)
    return stars
}

for (let i = 0; i < simulations; i++) {
    stars = runSimulation()
    starsArray.push(stars)
}

function getBin(num) {
    let bins = [0, 80, 110, 140, 170, 200, 230, 260, 300, 999]
    for (let i = 0; i < bins.length -1; i++) {
        if (num >= bins[i] && num < bins[i+1]) {
            return bins[i].toString()
        }
    }
}

let binNum = {}

for (const star of starsArray) {
    const bin = getBin(star)
    binNum[bin] = ++binNum[bin] || 1
}

console.log(starsArray)
var starsTotal = starsArray.reduce((total, num) => {return total + num}, 0)
console.log('Avg Stars: ' + 1.0 * starsTotal / simulations)


for (let i in binNum) {
    let perc = 100.0 * binNum[i] / simulations
    console.log(`bin${i}: ${perc}%`)
}