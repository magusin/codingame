/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
const costRanges = {
    low: { min: 0, max: 3, desiredPercentage: 0.15, currentCount: 0 },
    mid: { min: 4, max: 6, desiredPercentage: 0.25, currentCount: 0 },
    high: { min: 7, max: 12, desiredPercentage: 0.45, currentCount: 0 },
    item: { desiredPercentage: 0.15, currentCount: 0 }
};
const CHARGE_BONUS = 1;
const GUARD_BONUS = 1.2;
const BREAKTHROUGH_BONUS = 1.1;
const DRAIN = 1.3;
const LETHAL = 1.5;
const WARD = 1.5;
let totalCardsToSelect = 0;
let cardPickCount = {};
let locationCount = 0;

// Fonction pour déterminer la plage de coût d'une carte
function getCostRange(cost, cardType) {
    if (cardType != 0) {
        return 'item';
    } else {
        for (const range in costRanges) {
            if (cost >= costRanges[range].min && cost <= costRanges[range].max) {
                return range;
            }
        }
    }
    return null;
}

function attackWithCard(myCard, opponentCards, locationCount) {

    let targetInstanceId = -1;

    // Si la carte a la capacité 'L', attaquer la carte 'Guard' ennemie avec la plus haute défense, ou à défaut la carte ennemie avec la plus haute défense.
    if (myCard.abilities.includes('L')) {
        const guardCards = opponentCards.filter(card => card.abilities.includes('G'));
        if (guardCards.length > 0) {
            targetInstanceId = guardCards.sort((a, b) => b.defense - a.defense)[0].instanceId;
        } else if (opponentCards.length > 0) {
            targetInstanceId = opponentCards.sort((a, b) => b.defense - a.defense)[0].instanceId;
        } else {
            targetInstanceId = -1;
        }
    } else {
        // Si des cartes ennemies ont 'Guard'
        const guardCards = opponentCards.filter(card => card.abilities.includes('G'));
        if (guardCards.length > 0) {
            // Attaquer la carte 'Guard' avec défense la plus proche mais inférieure à l'attaque de myCard
            const lowerOrEqualDefenseGuardCard = guardCards.sort((a, b) => b.defense - a.defense)
                .find(card => card.defense <= myCard.attack);
            targetInstanceId = lowerOrEqualDefenseGuardCard 
                ? lowerOrEqualDefenseGuardCard.instanceId 
                : guardCards[0].instanceId; // Si aucune, attaquer la carte 'Guard' avec la plus haute défense
        } else if (locationCount < 6 || opponentCards.length === 0) {
            // Si pas de cartes 'Guard' et locationCount < 6, ou si pas de cartes ennemies, attaquer le joueur.
            targetInstanceId = -1;
        } else {
            // Si pas de cartes 'Guard' et locationCount >= 6, attaquer la carte ennemie avec défense la plus proche mais inférieure à l'attaque de myCard
            const lowerOrEqualDefenseCard = opponentCards.sort((a, b) => b.defense - a.defense)
                .find(card => card.defense <= myCard.attack);
            targetInstanceId = lowerOrEqualDefenseCard ? lowerOrEqualDefenseCard.instanceId : opponentCards[0].instanceId;
        }
    }
    // Mettre à jour la défense de la carte cible et la liste des cartes si nécessaire
    if (targetInstanceId !== -1) {
        const targetCard = opponentCards.find(card => card.instanceId === targetInstanceId);
        if (myCard.defense - targetCard.attack <= 0 && !myCard.abilities.includes('W')) {
            locationCount -= 1
        }
        if (targetCard.abilities.includes('W')) {
            targetCard.abilities = targetCard.abilities.replace('W', '-');
        } else {
            targetCard.defense -= myCard.attack;
            if (targetCard.defense <= 0 || myCard.abilities.includes('L')) {
                opponentCards = opponentCards.filter(card => card.instanceId !== targetCard.instanceId);
            }
        }
    }

    return `ATTACK ${myCard.instanceId} ${targetInstanceId};`;
}

// game loop
while (true) {
    locationCount = 0
    let result = "";
    let myMana = 0;
    let myHealth = 30;
    let enemyHealth = 30;
    for (let i = 0; i < 2; i++) {

        var inputs = readline().split(' ');
        const playerHealth = parseInt(inputs[0]);
        const playerMana = parseInt(inputs[1]);
        const playerDeck = parseInt(inputs[2]);
        const playerRune = parseInt(inputs[3]);
        const playerDraw = parseInt(inputs[4]);
        if (i == 1) {
            myMana = playerMana
            myHealth = playerHealth
        }
        if (i == 2) {
            enemyHealth = playerHealth
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
        const attack = Math.abs(parseInt(inputs[5]));
        const defense = Math.abs(parseInt(inputs[6]));
        const abilities = inputs[7];
        const myHealthChange = parseInt(inputs[8]);
        const opponentHealthChange = Math.abs(parseInt(inputs[9]));
        const cardDraw = parseInt(inputs[10]);
        let bonus = 0;
        if (abilities.includes('C')) bonus += CHARGE_BONUS;
        if (abilities.includes('G')) bonus += GUARD_BONUS;
        if (abilities.includes('B')) bonus += BREAKTHROUGH_BONUS;
        if (abilities.includes('D')) bonus += DRAIN;
        if (abilities.includes('L')) bonus += LETHAL;
        if (abilities.includes('W')) bonus += WARD;
        if (myHealthChange > 0) bonus += myHealthChange * 0.5
        if (opponentHealthChange > 0) bonus += opponentHealthChange * 0.5
        if (cardDraw > 0) bonus += cardDraw * 0.5
        let calcMediumPower = (attack + defense + bonus) / cost
        if (calcMediumPower === Infinity) {
            calcMediumPower = 2;
        }
        actualInstance = instanceId
        if (instanceId === -1) {
            const costRange = getCostRange(cost, cardType);
            const currentPercentage = costRange ? costRanges[costRange].currentCount / totalCardsToSelect : 0;
            const desiredPercentage = costRange ? costRanges[costRange].desiredPercentage : 0;
            const adjustedPower = currentPercentage < desiredPercentage ? calcMediumPower * 1.6 : calcMediumPower;
            // console.error('totalCardsToSelect:', totalCardsToSelect)
            // console.error('calcMediumPower:', calcMediumPower)

            console.error('adjustedPower:', adjustedPower)
            // console.error('cardPickCount :', cardPickCount )
            const cardAlreadyPicked = cardPickCount[cardNumber] >= 3;
            if (adjustedPower > bestMediumPower && !cardAlreadyPicked) {
                bestMediumPower = adjustedPower
                bestCardToChoose = {
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
                    cardDraw,
                    i
                }
            }
            if (costRange) costRanges[costRange].currentCount++;

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
            cardPickCount[bestCardToChoose.cardNumber] = (cardPickCount[bestCardToChoose.cardNumber] || 0) + 1;
            console.log(`PICK ${bestCardToChoose.i}`);
            totalCardsToSelect++;
        } else {
            // Si aucune carte n'a été trouvée, choisir la carte avec la puissance la plus élevée
            console.log(`PICK 0`);
            totalCardsToSelect++;
        }
    } else {
        let cardsOnField = cards.filter(card => card.location === 1 && card.attack != 0);
        let spellCards = cards.filter(card => card.cardType != 0)
        if (spellCards.length > 0) {
            spellCards.forEach((spell) => {
                // item vert
                if (spell.cardType === 1) {
                    let targetableCards = cardsOnField.filter(card => card.cost >= 7);
                    targetableCards.sort((a, b) => b.cost - a.cost);
                    let targetCard = null;
                    if (spell.abilities.includes('G') || spell.abilities.includes('C') || spell.abilities.includes('B') || spell.abilities.includes('D') || spell.abilities.includes('W') || spell.abilities.includes('L')) {
                        for (let card of targetableCards) {
                            let hasAllAbilities = true;
                            for (let ability of spell.abilities) {
                                if (!card.abilities.includes(ability)) {
                                    hasAllAbilities = false;
                                }
                            }
                            if (!hasAllAbilities) {
                                targetCard = card;
                            }
                        }
                    } else {
                        targetCard = targetableCards[0];
                    }
                    if (targetCard && myMana >= spell.cost) {
                        result += `USE ${spell.instanceId} ${targetCard.instanceId};`;
                        myMana -= spell.cost
                    }
                }
                // item rouge
                else if (spell.cardType === 2) {
                    // let targetableCards = opponentCards
                    let targetCard = null;
                    if (spell.abilities.includes('G') || spell.abilities.includes('C') || spell.abilities.includes('B') || spell.abilities.includes('D') || spell.abilities.includes('W') || spell.abilities.includes('L')) {
                        for (let card of opponentCards) {
                            let hasAllAbilities = false;
                            for (let ability of spell.abilities) {
                                if (card.abilities.includes(ability)) {
                                    hasAllAbilities = true;
                                }
                            }
                            if (hasAllAbilities) {
                                targetCard = card;
                            }
                        }
                    } else {
                        if (spell.attack > 0) {
                            opponentCards.sort((a, b) => b.attack - a.attack)
                            targetCard = opponentCards[0]
                        } else {
                            let redTargetDef = opponentCards.filter(card => card.defense <= spell.defense)
                            redTargetDef.sort((a, b) => b.defense - a.defense);
                            targetCards = redTargetDef[0]
                        }
                    }
                    if (targetCard && myMana >= spell.cost) { 
                        // Mettre à jour la défense de la carte cible
                        const index = opponentCards.findIndex(card => card.instanceId === targetCard.instanceId);
                        if (index > -1) {
                            opponentCards[index].defense -= spell.attack;
                            if (targetCard.defense <= 0) {
                                opponentCards.splice(index, 1);
                            }
                        }
                        result += `USE ${spell.instanceId} ${targetCard.instanceId};`;
                        myMana -= spell.cost
                    }
                }
                // item bleu
                else if (spell.cardType === 3) {
                    if (myMana >= spell.cost && (myHealth + spell.myHealthChange) <= 60) {
                        result += `USE ${spell.instanceId};`;
                        myMana -= spell.cost;
                        myHealth += spell.myHealthChange;
                    }
                }
            }
            )
        }
        let summonableCards = cards.filter(card => card.location === 0 && card.cost <= myMana && card.cardType === 0);
        summonableCards.sort((a, b) => b.cost - a.cost);

        for (let card of summonableCards) {
            if (locationCount < 6 && myMana >= card.cost) {
                result += `SUMMON ${card.instanceId};`;
                myMana -= card.cost;
                locationCount += 1;
            }
        }

        for (let myCard of cardsOnField) {
            result += attackWithCard(myCard, opponentCards, locationCount);
        }
        console.log(result)

    }
}

