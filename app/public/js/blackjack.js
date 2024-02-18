const suits = {
  "Hearts": 0,
  "Diamonds": 1950,
  "Clubs": 3900,
  "Spades": 5850
}
class Deck {
  constructor() {
      this.deck = [];
      for (const suit in suits) {
          for (let i = 2; i < 15; i++) {
              this.deck.push([i, suit]);
          }
      }
  }
  resetcards() {
      this.deck = [];
      for (const suit in suits) {
          for (let i = 2; i < 15; i++) {
              this.deck.push([i, suit]);
          }
      }
      this.shufflecards();
  }
  shufflecards() {
      for (let i = this.deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
      }
  }
  returncard() {
      return this.deck.pop();
  }
}

let done_deal = false;
let done_bet = false;
let pot = 0;
let player_cards = [];
let dealer_cards = [];
let bet_input = document.querySelector(".bet_input");
let game_deck = new Deck();
let player_hand = 0;
let dealer_hand = 0;
let dealer_aces = 0;
let player_aces = 0;
let conf_bet = document.querySelector(".confirm_bet_btn");
game_deck.shufflecards();

let player_card_values = [];
function turn_over_playerCard(card) {
  console.log("turn over player");
  var value = 0;
  card.classList.add("flip");
  var next_card = game_deck.returncard();
  player_cards.push(next_card);
  card.style.backgroundImage = `url('../assets/newDeck/${next_card[1]}/card${next_card[1]}_${next_card[0]}.png')`;
  card.style.backgroundSize = '100% 109%';
  if (next_card[0] === 11 || next_card[0] === 12 || next_card[0] === 13) { value = 10 }
  else if (next_card[0] === 14) {
    value = 11;
    if (!done_split) {
      player_aces++;
    }
    else if (done_split) {
      if (hand === 'hand1') {
        player_aces1++;
      }
      else if (hand === 'hand2') {
        player_aces2++;
      }
    }
  }
  else { value = parseInt(next_card[0]) };
  if (!done_split) {
    player_hand = player_hand + value;
  } else if (done_split) {
    if (hand === 'hand1') {
      split_hand1 = split_hand1 + value;
    } else if (hand === 'hand2') {
      split_hand2 = split_hand2 + value;
    }
  }

  player_card_values.push(value);
}

function turn_over_dealerCard(card) {
  console.log("turn over dealer");
  var value = 0;
  card.classList.add("flip");
  var next_card = game_deck.returncard();
  dealer_cards.push(next_card);
  card.style.backgroundImage = `url('../assets/newDeck/${next_card[1]}/card${next_card[1]}_${next_card[0]}.png')`;
  card.style.backgroundSize = '100% 109%';
  if (next_card[0] === 11 || next_card[0] === 12 || next_card[0] === 13) { value = 10 }
  else if (next_card[0] === 14) {
    value = 11
    dealer_aces++;
  }
  else { value = parseInt(next_card[0]) };
  dealer_hand = dealer_hand + value;
}

function player_card() {
  console.log("player card")
  if (!done_deal && done_bet) {
    done_deal = true;
    const Cards = document.querySelectorAll(".player_card");
    Cards.forEach(card => {
      turn_over_playerCard(card)
    })
    const dealerCards = document.querySelectorAll(".dealer_card");
    var n = 0;
    dealerCards.forEach(card => {
      n++;
      if (n===1) {
        turn_over_dealerCard(card);
      }
    })
    console.log(`player hand: ${player_hand}`);
    if (player_hand === 21) {
      stand();
      blackjack = true;
    }

    console.log(player_card_values);
    if (player_card_values[0] === player_card_values[1]) {
      document.querySelector('.split_btn').style.visibility = 'visible';
    }
  }
}

function dealer_card() {
  console.log("dealers card")
  if (done_bet) {
    const Cards = document.querySelectorAll(".dealer_card");
    var n = 0;
    Cards.forEach(card => {
      n++;
      if (n===2) {
        turn_over_dealerCard(card)
      }
    })
    console.log(`dealer hand: ${dealer_hand}`);
  }
}

function hide_stuff() {
  console.log("hidestuff")
  document.querySelector(".play_again_btn").style.visibility = "visible";
  document.querySelector(".betting_container").classList.add('remove');
}

function go_again() {
  console.log("go again");
  player_card_values = [];
  player_aces = 0;
  player_aces1 = 0;
  player_aces2 = 0;
  dealer_aces = 0;
  bet_input.disabled = false;
  bet_input.value = '';
  done_deal = false;
  done_stand = false;
  done_bet = false;
  done_split = false;
  player_cards = [];
  dealer_cards = [];
  player_hand = 0;
  split_hand1 = 0;
  split_hand2 = 0;
  hand = '';
  dealer_hand = 0;
  game_deck.resetcards();
  game_deck.shufflecards();
  num_hits = 2;
  n_hits1 = 1;
  n_hits2 = 1;
  num_hits_dealer = 2;
  pot = 0;
  var n = 0;
  var m = 0;
  blackjack = false;
  const playerCards = document.querySelectorAll(".player_card");
  playerCards.forEach(card => {
    n++;
    card.style.backgroundImage = 'url(../assets/cardBackBlue.png)';
    card.classList.remove('flip');
    card.style.backgroundSize = "110% 110%";
    if (n>2) {
      card.parentNode.removeChild(card);
    }
  })
  const dealerCards = document.querySelectorAll(".dealer_card");
  dealerCards.forEach(card => {
    m++;
    card.classList.remove('flip');
    card.style.backgroundImage = 'url(../assets/cardBackRed.png)';
    card.style.backgroundSize = "110% 110%";
    if (m>2) {
      card.parentNode.removeChild(card);
    }
  })
  document.querySelector(".betting_container").classList.remove('remove');
  document.querySelector(".hit_btn").disabled = false;
  document.querySelector(".play_again_btn").style.visibility = 'hidden';
  document.querySelector(".double_btn").style.visibility = 'visible';
  document.getElementById('playerCard1').style.visibility = 'visible';
  document.getElementById('playerCard2').style.visibility = 'visible';
  document.getElementById('playerCard2').classList.remove('card1');
  document.getElementById('playerCard2').classList.add('card2');
}

//betting
let bet;
let stack = 5000;
let done_stand = false;
let blackjack = false;
socket.on("page loaded",()=> {
  document.querySelector(".stack").innerHTML = `Your stack: £${stack}`;
});

function handle_betInput() {
  console.log("bet input ")
  let inputValue = document.querySelector(".bet_input").value;
  inputValue = inputValue.replace(/[^0-9]/g, '');
  if (inputValue.length > 3) {
    inputValue = inputValue.substring(0,3);
  }
  document.querySelector(".bet_input").value = inputValue;
  bet = inputValue;
}

function make_bet() {
  console.log("make bet");
  if (done_deal === false && bet_input.value >= 50) {
    bet_input.disabled = true;
    done_bet = true;
    pot = pot + parseInt(bet_input.value);
    stack = stack - parseInt(bet_input.value);
    document.querySelector(".stack").innerHTML = `Your stack: £${stack}`;
    player_card();
  }
}

async function dealer_stand() {
  console.log("dealer stand");
  let winners = [];
  if (!done_split) {
    winners.push(get_winner(player_hand, dealer_hand));
  } else if (done_split) {
    winners.push(get_winner(split_hand1, dealer_hand));
    winners.push(get_winner(split_hand2, dealer_hand));
  }

  let i = 1;
  var notiboxID;
  winners.forEach((winner) => {
    if (i === 1) {
      notiboxID = "notification";
    } else if (i===2) {
      notiboxID = "notification2";
    }

    var text = '';
    if (!done_split) {
      text = "Hand:"
    } else if (done_split) {
      text = `Hand ${i}:`
    }

    if (winner === 'player' && blackjack===false) {
      stack = stack + 2*pot;
      document.querySelector(".stack").innerHTML = `Your stack: ${stack}`;
      showNotification(`${text} You win £${2*pot}!`, notiboxID)
    }
    else if (winner==='player' && blackjack===true) {
      stack = stack + 1.5*(2*pot);
      document.querySelector(".stack").innerHTML = `Your stack: ${stack}`;
      showNotification(`${text} You win £${1.5*(2*pot)}!`, notiboxID)
    }
    else if (winner === 'push') {
      stack = stack + pot;
      document.querySelector(".stack").innerHTML = `Your stack: ${stack}`;
      showNotification(`${text} Push.`, notiboxID)
    }
    else {
      showNotification(`${text} Oops...`, notiboxID);
    }
    i++;
  })
  hide_stuff()
}

function stand() {
  if (!done_split) {
    if (!done_stand && done_deal) {
      dealer_card();
      done_stand = true;
      if (player_hand <= 21) {
        dealer_hit();
      } else {
        dealer_stand()
      }
      hide_stuff();
      document.querySelector(".hit_btn").disabled = true;
    }
  }
  else if (done_split) {
    if (hand === 'hand1' && !done_stand && done_deal) {
      document.querySelector(".double_btn").style.visibility = "hidden";
      hand = 'hand2';
      hand_indicator.innerHTML = 'HAND 2';
      document.querySelectorAll('.hand1').forEach((card) => {
        card.style.visibility = 'hidden';
      })
      document.querySelectorAll('.hand2').forEach((card) => {
        card.style.visibility = 'visible';
      })
    }
    else if (hand === 'hand2' && !done_stand && done_deal) {
      showNotification('Hand 2...', 'notification');
      dealer_card();
      done_stand = true;
      if (split_hand1 <= 21 || split_hand2 <= 21) {
        dealer_hit();
      } else {
        dealer_stand()
      }
      hide_stuff();
      document.querySelector(".hit_btn").disabled = true;
      hand_indicator.innerHTML = '';
    }
  }
}

let hand;
let done_split = false;
let split_hand1;
let split_hand2;
let hand_indicator = document.querySelector(".hand_indicator");

function split() {
  if (done_deal && !done_split) {
    document.querySelector('.split_btn').style.visibility = 'hidden';
    document.querySelector('.double_btn').style.visibility = 'hidden';
    hand = 'hand1';
    showNotification('Hand 1...', 'notification');
    document.getElementById('playerCard1').classList.add('hand1');
    document.getElementById('playerCard2').classList.add('hand2');
    hand_indicator.innerHTML = "HAND 1";
    document.getElementById('playerCard2').style.visibility = 'hidden';
    done_split = true
    document.getElementById('playerCard2').classList.remove('card2');
    document.getElementById('playerCard2').classList.add('card1');


    split_hand1, split_hand2 = player_hand / 2, player_hand / 2;
  }
}

let num_hits = 2;
let num_hits_dealer = 2;

function hit() {
  if (done_deal && !done_split) {
    document.querySelector('.double_btn').style.visibility = 'hidden';
    document.querySelector('.split_btn').style.visibility = 'hidden';
    num_hits++;
    const newCard = document.createElement('div')
    document.querySelector('.player_cards').appendChild(newCard);
    newCard.classList.add('card');
    newCard.classList.add('player_card');
    newCard.classList.add(`card${num_hits}`);
    turn_over_playerCard(newCard);
    while (player_hand > 21 && player_aces > 0) {
      console.log('accounting for player aces', player_aces)
      player_hand  = player_hand - 10;
      player_aces = player_aces - 1;
      console.log(player_hand)
    }
    if (player_hand >= 21) {
      document.querySelector(".hit_btn").disabled = true;
      stand();
    }
      
    console.log(`player hand: ${player_hand}`)
  }
}
let n_hits1 = 1;
let n_hits2 = 1;
let player_aces1 = 0;
let player_aces2 = 0;
async function split_hit() {
  if (done_deal && done_split && hand === 'hand1') {
    console.log(n_hits1);
    n_hits1++;
    if (n_hits1 === 2) {
      document.querySelector('.double_btn').style.visibility = 'visible';
    }
    else if (n_hits1 === 3) {
      document.querySelector('.double_btn').style.visibility = 'hidden';
    }
    const newCard = document.createElement('div')
    document.querySelector('.player_cards').appendChild(newCard);
    newCard.classList.add('card');
    newCard.classList.add('player_card')
    newCard.classList.add('hand1');
    newCard.classList.add(`card${n_hits1}`);
    turn_over_playerCard(newCard);
    while (split_hand1 > 21 && player_aces1 > 0) {
      console.log('accounting for player aces', player_aces1)
      split_hand1  = split_hand1 - 10;
      player_aces1 = player_aces1 - 1;
      console.log(split_hand1)
    }
    if (split_hand1 >= 21) {
      setTimeout(function() {
        console.log('...')
        stand();
      }, 3000);
    }
      
    console.log(`player hand: ${split_hand1}`)
  }
  else if (done_deal && done_split && hand === 'hand2') {
    console.log(n_hits2);
    document.querySelector('.double_btn').style.visibility = 'hidden';
    n_hits2++;
    if (n_hits2 === 2) {
      document.querySelector('.double_btn').style.visibility = 'visible';
    }
    else if (n_hits2 === 3) {
      document.querySelector('.double_btn').style.visibility = 'hidden';
    }
    const newCard = document.createElement('div')
    document.querySelector('.player_cards').appendChild(newCard);
    newCard.classList.add('card');
    newCard.classList.add('player_card');
    newCard.classList.add('hand2');
    newCard.classList.add(`card${n_hits2}`);
    turn_over_playerCard(newCard);
    while (split_hand2 > 21 && player_aces2 > 0) {
      console.log('accounting for player aces', player_aces2)
      split_hand2  = split_hand2 - 10;
      player_aces2 = player_aces2 - 1;
      console.log(split_hand2)
    }
    if (split_hand2 >= 21) {
      stand();
    }
      
    console.log(`player hand: ${split_hand2}`)
  }
}
function hitAction() {
  if (done_split) {
    split_hit();
  } else if (!done_split) {
    hit();
  }
}

function dealer_hit() {
  let blah = false;
  while (!blah) {
    while (dealer_hand<17 && player_hand<=21) {
      num_hits_dealer++;
      const newCard = document.createElement('div')
      document.querySelector('.dealer_cards').appendChild(newCard);
      newCard.classList.add('card');
      newCard.classList.add('dealer_card');
      newCard.classList.add(`card${num_hits_dealer}`);
      turn_over_dealerCard(newCard);
      console.log(`dealer hand: ${dealer_hand}`)
    }
    while (dealer_hand>21 && dealer_aces>0) {
      console.log('accounting for dealer aces', dealer_aces)
      dealer_hand -= 10;
      dealer_aces -= 1;
      console.log(dealer_hand);
    }
    if (dealer_hand>17) {
      dealer_stand()
      blah = true;
    }
    else if (dealer_hand===17 && dealer_aces===0) {
      dealer_stand()
      blah = true;
    }
  }
}

function double() {
  console.log("double")
  if (num_hits === 2 && done_deal) {
    console.log('doubled!');
    stack = stack - pot;
    document.querySelector(".stack").innerHTML = `Your stack: ${stack}`;
    pot = pot*2;
    if (!done_split) {
      hit();
    } else if (done_split) {
      split_hit();
    }
    stand();
  }
}

function showNotification(text, notiboxID) {
  var notification = document.getElementById(notiboxID);
  notification.innerHTML = text;
  notification.style.display = 'block';

  setTimeout(function() {
    notification.style.display = 'none';
  }, 3000);
}

//winner
function get_winner(a, b) {
  console.log("get winner")
  let winner;
  if (a <= 21 && a > b) { winner = 'player' }
  else if (a<=21 && b>21) { winner = 'player' }
  else if (a === b && a+b <= 42) { winner = 'push' }
  else if (b>a && b<=21) { winner = 'dealer' }
  else if (player_hand > 21) { winner = 'dealer' }
  return winner;
}