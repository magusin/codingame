/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
const costRanges = {
    low: { min: 0, max: 3, desiredPercentage: 0.2, currentCount: 0 },
    mid: { min: 4, max: 6, desiredPercentage: 0.4, currentCount: 0 },
    high: { min: 7, max: 12, desiredPercentage: 0.4, currentCount: 0 }
};
const CHARGE_BONUS = 1;
const GUARD_BONUS = 1.5;
const BREAKTHROUGH_BONUS = 2;
let totalCardsToSelect = 0;

// Fonction pour déterminer la plage de coût d'une carte
function getCostRange(cost) {
    for (const range in costRanges) {
        if (cost >= costRanges[range].min && cost <= costRanges[range].max) {
            return range;
        }
    }
    return null;
}

// game loop
while (true) {
    let selectedCards = [];
    let locationCount = 0;
    let result = "";
    let myMana = 0;
    for (let i = 0; i < 2; i++) {

        var inputs = readline().split(' ');
        const playerHealth = parseInt(inputs[0]);
        const playerMana = parseInt(inputs[1]);
        const playerDeck = parseInt(inputs[2]);
        const playerRune = parseInt(inputs[3]);
        const playerDraw = parseInt(inputs[4]);
        if (i == 1) {
            myMana = playerMana
        }

    }
    var inputs = readline().split(' ');
    const opponentHand = parseInt(inputs[0]);
    const opponentActions = parseInt(inputs[1]);
    for (let i = 0; i < opponentActions; i++) {
        const cardNumberAndAction = readline();

    }

    let cards = [];
    let opponentCards = [];
    let bestMediumPower = 0;
    let bestCardToChoose = null;
    let actualInstance = -1;
    const cardCount = parseInt(readline());
    for (let i = 0; i < cardCount; i++) {
        var inputs = readline().split(' ');
        const cardNumber = parseInt(inputs[0]);
        const instanceId = parseInt(inputs[1]);
        const location = parseInt(inputs[2]);
        const cardType = parseInt(inputs[3]);
        const cost = parseInt(inputs[4]);
        const attack = parseInt(inputs[5]);
        const defense = parseInt(inputs[6]);
        const abilities = inputs[7];
        const myHealthChange = parseInt(inputs[8]);
        const opponentHealthChange = parseInt(inputs[9]);
        const cardDraw = parseInt(inputs[10]);
        let bonus = 0;
        if (abilities.includes('C')) bonus += CHARGE_BONUS;
        if (abilities.includes('G')) bonus += GUARD_BONUS;
        if (abilities.includes('B')) bonus += BREAKTHROUGH_BONUS;

        const calcMediumPower = (attack + defense + bonus) / cost
        actualInstance = instanceId
        if (instanceId === -1) {
            const costRange = getCostRange(cost);
            const currentPercentage = costRange ? costRanges[costRange].currentCount / totalCardsToSelect : 0;
            const desiredPercentage = costRange ? costRanges[costRange].desiredPercentage : 0;
            const adjustedPower = currentPercentage < desiredPercentage ? calcMediumPower * 1.4 : calcMediumPower;
            if (adjustedPower > bestMediumPower) {
                bestMediumPower = adjustedPower
                bestCardToChoose = i
            }
            if (costRange) costRanges[costRange].currentCount++;
            totalCardsToSelect++;
        } else {
            if (location === -1) {
                opponentCards.push({
                    cardNumber,
                    instanceId,
                    location,
                    cardType,
                    cost,
                    attack,
                    defense,
                    abilities,
                    myHealthChange,
                    opponentHealthChange,
                    cardDraw
                })
            } else {
                cards.push({
                    cardNumber,
                    instanceId,
                    location,
                    cardType,
                    cost,
                    attack,
                    defense,
                    abilities,
                    myHealthChange,
                    opponentHealthChange,
                    cardDraw
                })
            }

            if (location === 1) {
                locationCount++;
            }
        }
    }

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');
    if (actualInstance === -1) {

        // Si une carte a été trouvée, la sélectionner et mettre à jour le compteur
        if (bestCardToChoose !== null) {
            console.log(`PICK ${bestCardToChoose}`);
        } else {
            // Si aucune carte n'a été trouvée, choisir la carte avec la puissance la plus élevée
            console.log(`PICK 0`);
        }
    } else {
        let summonableCards = cards.filter(card => card.location === 0 && card.cost <= myMana);
        summonableCards.sort((a, b) => b.cost - a.cost);

        for (let card of summonableCards) {
            if (locationCount < 6 && myMana >= card.cost) {
                result += `SUMMON ${card.instanceId};`;
                myMana -= card.cost;
                locationCount += 1;
            }
        }
        let cardsOnField = cards.filter(card => card.location === 1);

        for (let myCard of cardsOnField) {
            let targetIndex = -1;

            // 1. Chercher des cartes avec Guard
            const guardCardsIndices = opponentCards.map((card, index) => card.abilities.includes('G') ? index : -1).filter(index => index !== -1);
            if (guardCardsIndices.length > 0) {
                targetIndex = guardCardsIndices[0]; // Choisissez comment sélectionner la carte si plusieurs options sont disponibles
            } else {
                // 2. Attaquer en fonction de la défense
                const weakerCardsIndices = opponentCards.map((card, index) => card.defense <= myCard.attack ? index : -1).filter(index => index !== -1);
                if (weakerCardsIndices.length > 0) {
                    targetIndex = weakerCardsIndices[0];
                } else if (opponentCards.length > 0) {
                    targetIndex = 0; // Attaquer la première carte par défaut
                }
            }

            // 3. Attaquer le joueur adverse si aucune carte n'est disponible
            if (targetIndex !== -1) {
                const targetInstanceId = opponentCards[targetIndex].instanceId;

                // Mettre à jour la défense de la carte cible
                opponentCards[targetIndex].defense -= myCard.attack;

                // Si la défense de la carte cible est 0 ou en dessous, la supprimer du tableau
                if (opponentCards[targetIndex].defense <= 0) {
                    opponentCards.splice(targetIndex, 1);
                }

                result += `ATTACK ${myCard.instanceId} ${targetInstanceId};`;
            } else {
                result += `ATTACK ${myCard.instanceId} -1;`;
            }
        }
        console.log(result)

    }
}
