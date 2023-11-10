let opponentHealth = 30;

const cards = [
  {
    cardNumber: 100,
    instanceId: 33,
    location: 1,
    cardType: 0,
    cost: 6,
    attack: 2,
    defense: 2,
    abilities: '-G----',
    myHealthChange: 0,
    opponentHealthChange: 0,
    cardDraw: 0
  },
  {
    cardNumber: 50,
    instanceId: 15,
    location: 22,
    cardType: 0,
    cost: 3,
    attack: 1,
    defense: 5,
    abilities: '------',
    myHealthChange: 0,
    opponentHealthChange: 0,
    cardDraw: 0
  },
  {
    cardNumber: 51,
    instanceId: 38,
    location: 1,
    cardType: 0,
    cost: 4,
    attack: 1,
    defense: 3,
    abilities: '---G--',
    myHealthChange: 0,
    opponentHealthChange: 0,
    cardDraw: 0
  },
  {
    cardNumber: 20,
    instanceId: 17,
    location: 1,
    cardType: 0,
    cost: 4,
    attack: 4,
    defense: 4,
    abilities: '-B----',
    myHealthChange: 0,
    opponentHealthChange: 0,
    cardDraw: 0
  },
  {
    cardNumber: 1,
    instanceId: 19,
    location: 1,
    cardType: 0,
    cost: 6,
    attack: 2,
    defense: 4,
    abilities: '-G----',
    myHealthChange: 0,
    opponentHealthChange: 0,
    cardDraw: 0
  }
  // {
  //   cardNumber: 75,
  //   instanceId: 15,
  //   location: 1,
  //   cardType: 0,
  //   cost: 5,
  //   attack: 6,
  //   defense: 5,
  //   abilities: 'B-----',
  //   myHealthChange: 0,
  //   opponentHealthChange: 0,
  //   cardDraw: 0
  // },
  // {
  //   cardNumber: 75,
  //   instanceId: 3,
  //   location: 1,
  //   cardType: 0,
  //   cost: 5,
  //   attack: 3,
  //   defense: 1,
  //   abilities: 'B-----',
  //   myHealthChange: 0,
  //   opponentHealthChange: 0,
  //   cardDraw: 0
  // }
]

const originalOpponentCards = [
  {
    cardNumber: 23,
    instanceId: 14,
    location: -1,
    cardType: 0,
    cost: 7,
    attack: 6,
    defense: 3,
    abilities: '-B----',
    myHealthChange: 0,
    opponentHealthChange: 0,
    cardDraw: 0
  }
]

function deepCopy(cards) {
  return JSON.parse(JSON.stringify(cards));
}

function attack(target, attacker, currentScoreKill, currentScoreDamage) {
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
          let excessDamage = attacker.attack - target.defense;
          if (excessDamage > 0) {
              damagePlayer += excessDamage;
          }
      }

      if (target.abilities.includes('L')) {
          damageReceived = initialDefenseAttacker
      }
      if (attacker.abilities.includes('W')) {
          damageReceived = 0
      }
      if (target.abilities.includes('W')) {
          damageInflected = 0
          target.abilities = target.abilities.replace('W', '-');
      }
  }


  // console.log('damageInflicted :', damageInflicted, 'damageReceived :', damageReceived)
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
      died: died
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
        currentScoreKill = score.scoreKill;
        currentScoreDamage = score.scoreDamage;
        // console.log('targetCard :', targetCard)

        const newSequence = currentSequence.concat({ attacker: myCardCopy.instanceId, target: targetCard.instanceId });
      
        generateSequences(
          myCardsCopy,
          opponentCardsCopy,
          opponentHealthCopy,
          sequences,
          newSequence,
          currentScoreKill,
          currentScoreDamage
        );
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
        currentScoreKill = score.scoreKill;
        currentScoreDamage = score.scoreDamage;
        const newCurrentSequence = currentSequence.concat({ attacker: myCard.instanceId, target: guard.instanceId });
        generateSequences(
          myCardsCopy,
          opponentCardsCopy,
          opponentHealthCopy,
          sequences,
          newCurrentSequence,
          currentScoreKill,
          currentScoreDamage
        );
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

// Utiliser une copie profonde des cartes pour ne pas modifier l'original
let myCardsCopy = deepCopy(cards);
let opponentCardsCopy = deepCopy(originalOpponentCards);

let sequences = [];
const newOpponentCards = [...originalOpponentCards, { instanceId: -1, abilities: '------' }];
generateSequences(myCardsCopy, newOpponentCards, opponentHealth, sequences, [], 0, 0);

//Sélectionner les séquences avec les meilleurs ScoreKill
const bestsScoreKill = sequences.filter(seq => seq.scoreKill === Math.max(...sequences.map(seq => seq.scoreKill)));
//Sélectionner les séquences avec les meilleurs ScoreDamage
const bestsScoreDamage = bestsScoreKill.filter(seq => seq.scoreDamage === Math.max(...bestsScoreKill.map(seq => seq.scoreDamage)));
const bestSequence = bestsScoreDamage[0];
console.log('bestSequence :', JSON.stringify(bestSequence))
// bestSequence.map(seq => {
  // console.log(`ATTACK ${seq.attacker} ${seq.target};`)
// })
// Afficher les séquences générées pour démonstration
console.log(sequences.length);