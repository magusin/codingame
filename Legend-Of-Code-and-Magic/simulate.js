function searchAndDestroy (cards, opponentCards, enemyHealth, myHealth) {
    allyCardTarget = null
    enemyCardTarget = null
    // target
    const myCardsField = cards.filter(card => card.location === 1 && card.attack != 0)
    const enemyCardGuard = opponentCards.filter(card => card.abilities.includes('G'))
    // total attack
    const totalAttack = myCardsField.reduce((total, card) => total + card.attack, 0)
    // logic for spell later
    // si total attaque et pas de carte def > vie adverssaire = attaquer l'adverssaire
    if (totalAttack >= enemyHealth && enemyCardGuard.length === 0) {
        allyCardTarget = cards[0].locationId
        enemyCardTarget = -1
    } else {
        if (enemyCardGuard.length > 0) {
            
        }
    }
    
}

function foundBestSequence (cards, opponentCards, enemyHealth, myHealth) {
    actualSequence = []
    actualScoreSequence = 0
    bestSequence = []
    bestScoreSequence = 0
    enemyCardTarget = null
    // target
    const myCardsField = cards.filter(card => card.location === 1 && card.attack != 0)
    const enemyCardGuard = opponentCards.filter(card => card.abilities.includes('G'))
    // total attack
    const totalAttack = myCardsField.reduce((total, card) => total + card.attack, 0)
    // logic for spell later
    // si total attaque et pas de carte def > vie adverssaire = attaquer l'adverssaire
    if (totalAttack >= enemyHealth && enemyCardGuard.length === 0) {
        allyCardTarget = cards[0].locationId
        enemyCardTarget = -1
    } else {
        if (enemyCardGuard.length > 0) {
            
        }
    }
    
}
