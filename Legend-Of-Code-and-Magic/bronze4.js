



// Fonction pour logique d'attaque
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
        let guardCards = opponentCards.filter(card => card.abilities.includes('G'));
        if (guardCards.length > 0) {
            // Attaquer la carte 'Guard' avec défense la plus proche mais inférieure à l'attaque de myCard
            const lowerOrEqualDefenseGuardCard = guardCards.sort((a, b) => b.defense - a.defense)
                .find(card => card.defense <= myCard.attack);
            targetInstanceId = lowerOrEqualDefenseGuardCard
                ? lowerOrEqualDefenseGuardCard.instanceId
                : guardCards[0].instanceId; // Si aucune, attaquer la carte 'Guard' avec la plus haute défense
        } else {
            // Aucune carte 'Guard', attaquer une carte ennemie si la carte peut survivre à l'attaque
            let vulnerableEnemies = opponentCards.filter(card => card.attack < myCard.defense && card.defense <= myCard.defense);
            if (vulnerableEnemies.length > 0) {
                vulnerableEnemies.sort((a, b) => b.defense - a.defense);
                targetInstanceId = vulnerableEnemies[0].instanceId;
            } else if (locationCount < 6 || opponentCards.length === 0) {
                // Pas de carte 'Guard' ou de carte ennemie vulnérable, attaquer directement le joueur ennemi
                targetInstanceId = -1;
            } else {
                const lowerOrEqualDefenseCard = guardCards.sort((a, b) => b.defense - a.defense)
                if (lowerOrEqualDefenseCard.length > 0) {

                } else {
                    // Attaquer la carte ennemie avec la plus haute défense
                    opponentCards.sort((a, b) => b.defense - a.defense);
                    targetInstanceId = opponentCards[0].instanceId;
                }
            }
        }
    }
    // Mettre à jour la défense de la carte cible et la liste des cartes si nécessaire
    if (targetInstanceId !== -1) {
        const targetCard = opponentCards.find(card => card.instanceId === targetInstanceId);
        if (myCard.defense - targetCard.attack <= 0 && !myCard.abilities.includes('W')) {
            locationCount -= 1
            console.error('cardId:', myCard.instanceId)
            console.error('cardDefense:', myCard.defense)
        }
        if (targetCard.abilities.includes('W')) {
            targetCard.abilities = targetCard.abilities.replace('W', '-');
        } else {
            targetCard.defense -= myCard.attack;
            const index = opponentCards.findIndex(card => card.instanceId === targetCard.instanceId);
            if (targetCard.defense <= 0 || myCard.abilities.includes('L')) {
                opponentCards.splice(index, 1);
            }
        }
    } else {
        enemyHealth -= myCard.attack
    }
    console.error("locationCount:", locationCount)

    return `ATTACK ${myCard.instanceId} ${targetInstanceId};`;
}

function canFinish(cardsOnField, opponentCards, enemyHealth) {

    const totalAttackPower = cardsOnField.reduce((sum, card) => sum + card.attack, 0);
    const hasGuard = opponentCards.some(card => card.abilities.includes('G'));
    return totalAttackPower >= enemyHealth && !hasGuard;
}

// game loop
while (true) {
    locationCount = 0
    turn += 1
    let result = "";

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
        if (cardDraw > 0) bonus += cardDraw * 0.7
        let calcMediumPower = (attack + defense + bonus) / cost
        if (calcMediumPower === Infinity) {
            calcMediumPower = 2;
        }
        actualInstance = instanceId
        if (instanceId === -1) {
            const costRange = getCostRange(cost, cardType);
            const currentPercentage = costRange ? costRanges[costRange].currentCount / 30 : 0;
            const desiredPercentage = costRange ? costRanges[costRange].desiredPercentage : 0;
            const adjustedPower = currentPercentage < desiredPercentage ? calcMediumPower * 1.8 : calcMediumPower;

            // console.error('calcMediumPower:', calcMediumPower)
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
        let spellCards = cards.filter(card => card.cardType != 0)
        if (spellCards.length > 0) {
            spellCards.forEach((spell) => {
                // item vert
                if (spell.cardType === 1) {
                    let targetableCards = cards.filter(card => card.cost >= 5 && card.location === 1 && card.attack != 0);
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
                        result += `USE ${spell.instanceId} -1;`;
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
                let cardIndex = cards.findIndex(c => c.instanceId === card.instanceId);
                if (cardIndex !== -1) {
                    cards[cardIndex].location = 1;
                    cards[cardIndex].justSummoned = true;
                }
            }
        }

        let cardsOnField = cards.filter(card => card.location === 1 && card.attack != 0);
        let attackableCards = cardsOnField.filter(card => !card.justSummoned || card.abilities.includes('C'));
        if (canFinish(attackableCards, opponentCards, enemyHealth)) {
            attackableCards.forEach(card => {
                result += `ATTACK ${card.instanceId} -1;`;
            });
        } else {
            for (let i = 0; i < attackableCards.length; i++) {
                let myCard = attackableCards[i];

                result += attackWithCard(myCard, opponentCards, locationCount);
                if (canFinish(attackableCards.slice(i + 1)), opponentCards, enemyHealth) {
                    for (let j = i + 1; j < cardsOnField.length; j++) {
                        let attackingCard = cardsOnField[j];
                        result += `ATTACK ${attackingCard.instanceId} -1;`;
                    }
                }
            }
        }

        let summonableCardsForEnd = cards.filter(card => card.location === 0 && card.cost <= myMana && card.cardType === 0);
        summonableCardsForEnd.sort((a, b) => b.cost - a.cost);

        for (let card of summonableCardsForEnd) {

            if (locationCount < 6 && myMana >= card.cost) {
                result += `SUMMON ${card.instanceId};`;
                myMana -= card.cost;
                locationCount += 1;
                let cardIndex = cards.findIndex(c => c.instanceId === card.instanceId);
                if (cardIndex !== -1) {
                    cards[cardIndex].location = 1;
                    cards[cardIndex].justSummoned = true;
                }
            }
        }
        console.log(result)

    }
}