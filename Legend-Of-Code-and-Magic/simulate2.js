let opponentHealthTotal = 30;

const cards = [
  {
    cardNumber: 100,
    instanceId: 33,
    location: 1,
    cardType: 0,
    cost: 3,
    attack: 1,
    defense: 6,
    abilities: '---G--',
    myHealthChange: 0,
    opponentHealthChange: 0,
    cardDraw: 0
  },
  {
    cardNumber: 51,
    instanceId: 21,
    location: 1,
    cardType: 0,
    cost: 4,
    attack: 3,
    defense: 5,
    abilities: '----L-',
    myHealthChange: 0,
    opponentHealthChange: 0,
    cardDraw: 0
  },
  {
    cardNumber: 75,
    instanceId: 13,
    location: 1,
    cardType: 0,
    cost: 5,
    attack: 6,
    defense: 5,
    abilities: 'B-----',
    myHealthChange: 0,
    opponentHealthChange: 0,
    cardDraw: 0
  },
  {
    cardNumber: 75,
    instanceId: 17,
    location: 1,
    cardType: 0,
    cost: 5,
    attack: 6,
    defense: 5,
    abilities: 'B-----',
    myHealthChange: 0,
    opponentHealthChange: 0,
    cardDraw: 0
  },
  {
    cardNumber: 75,
    instanceId: 15,
    location: 1,
    cardType: 0,
    cost: 5,
    attack: 6,
    defense: 5,
    abilities: 'B-----',
    myHealthChange: 0,
    opponentHealthChange: 0,
    cardDraw: 0
  },
  {
    cardNumber: 75,
    instanceId: 3,
    location: 1,
    cardType: 0,
    cost: 5,
    attack: 3,
    defense: 1,
    abilities: 'B-----',
    myHealthChange: 0,
    opponentHealthChange: 0,
    cardDraw: 0
  }
]

const opponentCards = [
  {
    cardNumber: 48,
    instanceId: 28,
    location: -1,
    cardType: 0,
    cost: 1,
    attack: 1,
    defense: 1,
    abilities: '----L-',
    myHealthChange: 0,
    opponentHealthChange: 0,
    cardDraw: 0
  },
  {
    cardNumber: 114,
    instanceId: 24,
    location: -1,
    cardType: 0,
    cost: 7,
    attack: 6,
    defense: 6,
    abilities: '---G--',
    myHealthChange: 0,
    opponentHealthChange: 0,
    cardDraw: 0
  },
  {
    cardNumber: 72,
    instanceId: 32,
    location: -1,
    cardType: 0,
    cost: 4,
    attack: 5,
    defense: 3,
    abilities: 'B-----',
    myHealthChange: 0,
    opponentHealthChange: 0,
    cardDraw: 0
  },
  {
    cardNumber: 73,
    instanceId: 22,
    location: -1,
    cardType: 0,
    cost: 4,
    attack: 4,
    defense: 4,
    abilities: 'B-----',
    myHealthChange: 4,
    opponentHealthChange: 0,
    cardDraw: 0
  },
  {
    cardNumber: 73,
    instanceId: 30,
    location: -1,
    cardType: 0,
    cost: 4,
    attack: 4,
    defense: 4,
    abilities: 'B-----',
    myHealthChange: 4,
    opponentHealthChange: 0,
    cardDraw: 0
  },
  {
    cardNumber: 73,
    instanceId: 50,
    location: -1,
    cardType: 0,
    cost: 4,
    attack: 4,
    defense: 4,
    abilities: 'B-----',
    myHealthChange: 4,
    opponentHealthChange: 0,
    cardDraw: 0
  }
]

function deepCopy(cards) {
  return JSON.parse(JSON.stringify(cards));
}

function attack(target, attackValue) {
  // Réduit la défense de la carte cible
  target.defense -= attackValue;
  // Retourne true si la carte cible est détruite
  return target.defense <= 0;
}

function generateSequences(myCards, opponentCards, opponentHealth, sequences = [], currentSequence = []) {
  let isSequenceComplete = true;
  let totalAttackValue = myCards.reduce((total, card) => total + (currentSequence.some(seq => seq.attacker === card.instanceId) ? 0 : card.attack), 0);
  const guardsAlive = opponentCards.filter(card => card.abilities.includes('G') && card.defense > 0);

  myCards.forEach((myCard, index) => {
    // Ignore les cartes qui ont déjà attaqué ou qui n'ont pas d'attaque
    if (currentSequence.some(seq => seq.attacker === myCard.instanceId) || myCard.attack === 0) {
      return;
    }

    isSequenceComplete = false;

    // Si le joueur ennemi peut être vaincu avec les attaques restantes et qu'il n'y a pas de garde, attaquer directement le joueur ennemi
    if (guardsAlive.length === 0 && opponentHealth <= totalAttackValue) {
      generateSequences(
        myCards,
        opponentCards,
        opponentHealth - myCard.attack,
        sequences,
        currentSequence.concat({ attacker: myCard.instanceId, target: 'OPPONENT_PLAYER' })
      );
    } else if (guardsAlive.length === 0) {
      // Pas de gardes, et l'opposant ne peut pas encore être vaincu, choisir entre attaquer une autre carte ennemie ou l'opposant
      const newSequences = opponentCards.map(opponentCard => {
        const opponentCardsCopy = deepCopy(opponentCards);
        const targetCard = opponentCardsCopy.find(card => card.instanceId === opponentCard.instanceId);

        if (attack(targetCard, myCard.attack)) {
          opponentCardsCopy.splice(opponentCardsCopy.indexOf(targetCard), 1);
        }

        return currentSequence.concat({ attacker: myCard.instanceId, target: opponentCard.instanceId });
      });

      // Ajouter également l'option d'attaquer directement l'opposant
      newSequences.push(currentSequence.concat({ attacker: myCard.instanceId, target: 'OPPONENT_PLAYER' }));

      // Générer les séquences pour chacune des nouvelles séquences possibles
      newSequences.forEach(newSequence => {
        generateSequences(
          myCards,
          opponentCards,
          opponentHealth,
          sequences,
          newSequence
        );
      });
    } else {
      // Il y a des gardes vivants, continuer comme avant
      guardsAlive.forEach(guard => {
        const opponentCardsCopy = deepCopy(opponentCards);
        const guardCopy = opponentCardsCopy.find(card => card.instanceId === guard.instanceId);

        if (attack(guardCopy, myCard.attack)) {
          opponentCardsCopy.splice(opponentCardsCopy.indexOf(guardCopy), 1);
        }

        generateSequences(
          myCards,
          opponentCardsCopy,
          opponentHealth,
          sequences,
          currentSequence.concat({ attacker: myCard.instanceId, target: guard.instanceId })
        );
      });
    }
  });

  // Si la séquence est complète (toutes les cartes ont attaqué ou il n'y a plus de cibles), l'ajoute aux séquences
  if (isSequenceComplete) {
    sequences.push(currentSequence);
  }
}

// Utiliser une copie profonde des cartes pour ne pas modifier l'original
let myCardsCopy = deepCopy(cards);
let opponentCardsCopy = deepCopy(opponentCards);
let opponentHealth = opponentHealthTotal;

let sequences = [];
generateSequences(myCardsCopy, opponentCardsCopy, opponentHealth, sequences);

// Afficher les séquences générées pour démonstration
console.log(sequences);