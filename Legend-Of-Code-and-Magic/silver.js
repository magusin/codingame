/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
const costRanges = {
    zero: { min: 0, max: 0, desiredPercentage: 0.033, currentCount: 0 },
    un: { min: 1, max: 1, desiredPercentage: 0.1, currentCount: 0 },
    deux: { min: 2, max: 2, desiredPercentage: 0.1, currentCount: 0 },
    trois: { min: 3, max: 3, desiredPercentage: 0.167, currentCount: 0 },
    quatre: { min: 4, max: 4, desiredPercentage: 0.166, currentCount: 0 },
    cinq: { min: 5, max: 5, desiredPercentage: 0.167, currentCount: 0 },
    six: { min: 6, max: 6, desiredPercentage: 0.1, currentCount: 0 },
    high: { min: 7, max: 12, desiredPercentage: 0.067, currentCount: 0 },
    item: { desiredPercentage: 0.1, currentCount: 0 }
};
const CHARGE_BONUS = 1.1;
const GUARD_BONUS = 1.4;
const BREAKTHROUGH_BONUS = 1.2;
const DRAIN = 1.2;
const LETHAL = 1.3;
const WARD = 1.3;
let totalCardsToSelect = 0;
let cardPickCount = {};
let locationCount = 0;
let enemyHealth = 30;
let myMana = 0;
let myHealth = 30;
let turn = 0;
let myDeck = null;
let opponentDeck = null;
let position = null;
const MAX_SEQUENCES = 1300;
let totalSequences = 0;

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
// Fonction pour logique d'attaque
function deepCopy(cards) {
    return JSON.parse(JSON.stringify(cards));
}

function attack(target, attacker, currentScoreKill, currentScoreDamage, health) {
    // console.log('attacker :', attacker, 'target :', target)
    let initialDefenseAttacker = attacker.defense;
    let initialDefenseTarget = target.defense;
    let died = false;
    let damageInflicted = 0;
    let damageReceived = 0;
    let damagePlayer = 0;
    if (target.instanceId === -1) {
        damagePlayer = attacker.attack
    } else {
        damageInflicted = Math.min(attacker.attack, target.defense);
        damageReceived = Math.min(target.attack, attacker.defense);
        target.defense -= attacker.attack;
        attacker.defense -= target.attack;

        // Lethal ability: l'attaque est toujours suffisante pour tuer la cible
        if (attacker.abilities.includes('L')) {
            damageInflicted = initialDefenseTarget;
            target.defense = 0; // La carte meurt peu importe la défense
        }

        // Breakthrough ability: le dommage excédentaire est infligé au joueur adverse
        if (attacker.abilities.includes('B')) {
            let excessDamage = attacker.attack - initialDefenseTarget;
            if (excessDamage > 0) {
                damagePlayer += excessDamage;
            }
        }

        if (target.abilities.includes('L')) {
            damageReceived = initialDefenseAttacker;
        }
        if (attacker.abilities.includes('W')) {
            damageReceived = 0;
        }
        if (target.abilities.includes('W')) {
            damageInflected = 0;
            damagePlayer = 0;
            target.abilities = target.abilities.replace('W', '-');
        }
        if (target.abilities.includes('D') && !attacker.abilities.includes('W')) {
            damageHealed = Math.min(target.attack, initialDefenseTarget);
            damagePlayer -= damageHealed
        }
    }

    // Réduit la défense de la carte cible

    if (target.defense <= 0 && target.instanceId !== -1) {
        // La carte cible est morte
        currentScoreKill += 1;
        died = true
    }
    if (attacker.defense <= 0) {
        // La carte attaquante est morte
        currentScoreKill -= 1;
    }
    currentScoreDamage += damageInflicted;
    currentScoreDamage -= damageReceived;
    attacker.attack = 0;

    return {
        scoreKill: currentScoreKill,
        scoreDamage: currentScoreDamage,
        died: died,
        health: health - damagePlayer
    };
}

function generateSequences(myCards, oppCards, opponentHealth, sequences = [], currentSequence = [], scoreKill = 0, scoreDamage = 0) {
    let isSequenceComplete = true;
    let totalAttackValue = myCards.reduce((total, card) => total + (currentSequence.some(seq => seq.attacker === card.instanceId) ? 0 : card.attack), 0);
    const guardsAlive = oppCards.filter(card => card.abilities.includes('G') && card.defense > 0);
    let opponentHealthCopy = opponentHealth;
    myCards.forEach((myCard, index) => {
        let currentScoreKill = scoreKill;
        let currentScoreDamage = scoreDamage;
        if (totalSequences >= MAX_SEQUENCES) {
            return; // Arrêtez la génération de nouvelles séquences
        }
        // Ignore les cartes qui ont déjà attaqué ou qui n'ont pas d'attaque
        if (currentSequence.some(seq => seq.attacker === myCard.instanceId) || myCard.attack === 0) {
            return;
        }

        isSequenceComplete = false;

        // Si le joueur ennemi peut être vaincu avec les attaques restantes et qu'il n'y a pas de garde, attaquer directement le joueur ennemi
        if (guardsAlive.length === 0 && opponentHealthCopy <= totalAttackValue) {
            generateSequences(
                myCards,
                oppCards,
                opponentHealthCopy - myCard.attack,
                sequences,
                currentSequence.concat({ attacker: myCard.instanceId, target: -1 }),
                currentScoreKill,
                currentScoreDamage
            );
            totalSequences++;
            if (totalSequences >= MAX_SEQUENCES) {
                return;
            }
        } else if (guardsAlive.length === 0) {
            // Pas de gardes, et l'opposant ne peut pas encore être vaincu, choisir entre attaquer une autre carte ennemie ou l'opposant
            oppCards.map(opponentCard => {
                const myCardsCopy = deepCopy(myCards);
                const opponentCardsCopy = deepCopy(oppCards);
                const myCardCopy = myCardsCopy.find(card => card.instanceId === myCard.instanceId);
                const targetCard = opponentCardsCopy.find(card => card.instanceId === opponentCard.instanceId);

                let score = attack(targetCard, myCardCopy, currentScoreKill, currentScoreDamage)
                if (score.died) {
                    opponentCardsCopy.splice(opponentCardsCopy.indexOf(targetCard), 1);
                }
                newCurrentScoreKill = score.scoreKill;
                newCurrentScoreDamage = score.scoreDamage;
                newOppponentHealth = score.health

                const newSequence = currentSequence.concat({ attacker: myCardCopy.instanceId, target: targetCard.instanceId });

                generateSequences(
                    myCardsCopy,
                    opponentCardsCopy,
                    newOppponentHealth,
                    sequences,
                    newSequence,
                    newCurrentScoreKill,
                    newCurrentScoreDamage
                );
                totalSequences++;
                if (totalSequences >= MAX_SEQUENCES) {
                    return; // Arrêtez la génération si le maximum est atteint
                }
            });
        } else {
            // Il y a des gardes vivants, continuer comme avant
            guardsAlive.forEach(guard => {
                const myCardsCopy = deepCopy(myCards);
                const opponentCardsCopy = deepCopy(oppCards);
                const myCardCopy = myCardsCopy.find(card => card.instanceId === myCard.instanceId);
                const guardCopy = opponentCardsCopy.find(card => card.instanceId === guard.instanceId);

                let score = attack(guardCopy, myCardCopy, currentScoreKill, currentScoreDamage)
                if (score.died) {
                    opponentCardsCopy.splice(opponentCardsCopy.indexOf(guardCopy), 1);
                }
                newCurrentScoreKill = score.scoreKill;
                newCurrentScoreDamage = score.scoreDamage;
                newOpponentHealth = score.health;
                const newCurrentSequence = currentSequence.concat({ attacker: myCard.instanceId, target: guard.instanceId });
                generateSequences(
                    myCardsCopy,
                    opponentCardsCopy,
                    newOpponentHealth,
                    sequences,
                    newCurrentSequence,
                    newCurrentScoreKill,
                    newCurrentScoreDamage
                );
                totalSequences++;
                if (totalSequences >= MAX_SEQUENCES) {
                    return;
                }
            });
        }
    });

    // Si la séquence est complète (toutes les cartes ont attaqué ou il n'y a plus de cibles), l'ajoute aux séquences
    if (isSequenceComplete) {
        sequences.push({
            sequence: currentSequence,
            scoreKill: scoreKill,
            scoreDamage: scoreDamage
        });
    }
}

// game loop
while (true) {
    const startTime = performance.now();
    totalSequences = 0;
    locationCount = 0
    turn += 1
    let result = "";
    for (let i = 0; i < 2; i++) {

        var inputs = readline().split(' ');
        const playerHealth = parseInt(inputs[0]);
        const playerMana = parseInt(inputs[1]);
        const playerDeck = parseInt(inputs[2]);
        const playerRune = parseInt(inputs[3]);
        const playerDraw = parseInt(inputs[4]);
        if (turn < 10) {
            if (i == 1) {
                opponentDeck = playerDeck
            }
        }
        if (i == 0) {
            myMana = playerMana
            myHealth = playerHealth
            myDeck = playerDeck
        }
        // console.error('myMana :', myMana)
        // console.error('turn :', turn)
        // console.error('position :', position)
        if (i == 1) {
            enemyHealth = playerHealth
        }
        if (myDeck != null && opponentDeck != null) {
            myDeck < opponentDeck ? position = 2 : position = 1
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
        if (cardDraw > 0) bonus += cardDraw * 0.7
        let calcMediumPower = (attack + defense + bonus) / cost
        if (calcMediumPower === Infinity) {
            calcMediumPower = 2;
        }
        actualInstance = instanceId
        if (instanceId === -1) {
            const costRange = getCostRange(cost, cardType);
            const currentCount = costRange ? costRanges[costRange].currentCount : 0;
            const desiredPercentage = costRange ? costRanges[costRange].desiredPercentage : 0;
            let currentPercentage;
            if (costRange === 'item') {
                // range pour item (pas de min-max)
                currentPercentage = currentCount / 30;
            } else {
                currentPercentage = (costRange && costRanges[costRange].min != null && costRanges[costRange].max != null)
                    ? currentCount / 30
                    : 0;
            }
            const adjustedPower = currentPercentage < desiredPercentage ? calcMediumPower * 1.8 : calcMediumPower;

            console.error('calcMediumPower:', calcMediumPower)
            console.error('adjustedPower :', adjustedPower)
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

            // Mise à jour de currentCount pour le costRange de la carte choisie
            const costRange = getCostRange(bestCardToChoose.cost, bestCardToChoose.cardType);
            if (costRange) {
                costRanges[costRange].currentCount++;
            }

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
                    let targetableCards = cards.filter(card => card.cost >= 4 && card.location === 1 && card.attack != 0);
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
                        // Choisir la carte avec la somme la plus haute d'attaque et de défense
                        targetableCards.sort((a, b) => (b.attack + b.defense) - (a.attack + a.defense));
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
                            opponentCards[index].defense -= spell.defense;
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

        const opponentHealth = enemyHealth
        let cardsOnField = cards.filter(card => card.location === 1 && card.attack != 0);
        let attackableCards = cardsOnField.filter(card => !card.justSummoned || card.abilities.includes('C'));
        const opponentCardsAndEnnemie = [...opponentCards, { instanceId: -1, abilities: '------' }]
        // console.error(opponentCardsAndEnnemie)
        let myCardsCopy = deepCopy(attackableCards);
        let opponentCardsCopy = deepCopy(opponentCardsAndEnnemie);
        let sequences = [];
        generateSequences(myCardsCopy, opponentCardsCopy, opponentHealth, sequences, [], 0, 0);

        //Sélectionner les séquences avec les meilleurs ScoreKill
        const bestsScoreKill = sequences.filter(seq => seq.scoreKill === Math.max(...sequences.map(seq => seq.scoreKill)));
        //Sélectionner les séquences avec les meilleurs ScoreDamage
        const bestsScoreDamage = bestsScoreKill.filter(seq => seq.scoreDamage === Math.max(...bestsScoreKill.map(seq => seq.scoreDamage)));
        const bestSequence = bestsScoreDamage[0].sequence;
        bestSequence.map(seq => {
            result += `ATTACK ${seq.attacker} ${seq.target};`
        })
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
        const endTime = performance.now();
        // console.error(`L'appel de la fonction attack a pris ${endTime - startTime} millisecondes.`);
        // console.error(sequences.length)
        // console.error(JSON.stringify(bestSequence))
        console.log(result)

    }
}

