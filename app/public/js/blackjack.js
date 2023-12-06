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

function turn_over_playerCard(card) {
  var value = 0;
  card.classList.add("flip");
  var next_card = game_deck.returncard();
  player_cards.push(next_card);
  card.style.backgroundImage = `url('../assets/newDeck/${next_card[1]}/card${next_card[1]}_${next_card[0]}.png')`;
  card.style.backgroundSize = '100% 109%';
  if (next_card[0] === 11 || next_card[0] === 12 || next_card[0] === 13) { value = 10 }
  else if (next_card[0] === 14) { value = 11 }
  else { value = parseInt(next_card[0]) };
  player_hand = player_hand + value;
}
function turn_over_dealerCard(card) {
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
  }
}

function dealer_card() {
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
  document.querySelector(".play_again_btn").style.visibility = "visible";
  document.querySelector(".betting_container").classList.add('remove');
}

function go_again() {
  player_aces = 0;
  dealer_aces = 0;
  bet_input.disabled = false;
  bet_input.value = '';
  done_deal = false;
  done_stand = false;
  done_bet = false;
  player_cards = [];
  dealer_cards = [];
  player_hand = 0;
  dealer_hand = 0;
  game_deck.resetcards();
  game_deck.shufflecards();
  num_hits = 2;
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
  document.querySelector(".winner").innerHTML = 'Winner:';
  document.querySelector(".hit_btn").disabled = false;
  document.querySelector(".play_again_btn").style.visibility = 'hidden';
  document.querySelector(".double_btn").style.visibility = 'visible';
}

//betting
let bet;
let stack = 5000;
let done_stand = false;
let blackjack = false;
let blah = false;
window.onload = function () {
  document.querySelector(".stack").innerHTML = `Your stack: £${stack}`;
}

function handle_betInput() {
  let inputValue = document.querySelector(".bet_input").value;
  inputValue = inputValue.replace(/[^0-9]/g, '');
  if (inputValue.length > 3) {
    inputValue = inputValue.substring(0,3);
  }
  document.querySelector(".bet_input").value = inputValue;
  bet = inputValue;
}

function make_bet() {
  if (done_deal === false && bet_input.value >= 50) {
    bet_input.disabled = true;
    done_bet = true;
    pot = pot + parseInt(bet_input.value);
    stack = stack - parseInt(bet_input.value);
    document.querySelector(".stack").innerHTML = `Your stack: £${stack}`;
    player_card();
  }
}

function dealer_stand() {
  const winner = get_winner(player_hand, dealer_hand);
  document.querySelector(".winner").innerHTML = `Winner: ${winner}`;
  if (winner === 'player' && blackjack===false) {
    stack = stack + 2*pot;
    document.querySelector(".stack").innerHTML = `Your stack: ${stack}`;
  }
  else if (winner==='player' && blackjack===true) {
    stack = stack + 1.5*(2*pot);
    document.querySelector(".stack").innerHTML = `Your stack: ${stack}`;
  }
  else if (winner === 'push') {
    stack = stack + pot;
    document.querySelector(".stack").innerHTML = `Your stack: ${stack}`;
  }
  hide_stuff();
}

function stand() {
  if (!done_stand && done_deal) {
    dealer_card();
    done_stand = true;
    if (player_hand <= 21) {
      dealer_hit();
    }
    else {
      dealer_stand()
    };
    hide_stuff();
  }
    document.querySelector(".hit_btn").disabled = true;
}


let num_hits = 2;
let num_hits_dealer = 2;

function hit() {
  if (done_deal) {
    document.querySelector('.double_btn').style.visibility = 'hidden';
    num_hits++;
    const newCard = document.createElement('div')
    document.querySelector('.player_cards').appendChild(newCard);
    newCard.classList.add('card');
    newCard.classList.add('player_card');
    newCard.classList.add(`card${num_hits}`);
    turn_over_playerCard(newCard);
    if (player_hand === 21) {
      document.querySelector(".hit_btn").disabled = true;
      stand();
    }
    while (player_hand > 21 && player_aces > 0) {
      player_hand -= 10;
      player_aces -= 1;
    }
    if (player_hand >= 21) {
      document.querySelector(".hit_btn").disabled = true;
      stand();
    }
      
    console.log(`player hand: ${player_hand}`)
  }
}

function dealer_hit() {
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
    };
    while (dealer_hand>21 && dealer_aces>0) {
      dealer_hand -= 10;
      dealer_aces -= 1;
    }
  }
  dealer_stand()
}

function double() {
  if (num_hits === 2 && done_deal) {
    pot = pot*2;
    stack = stack - pot;
    hit();
    stand();
  }
}

//winner
function get_winner(a, b) {
  let winner;
  if (a <= 21 && a > b) { winner = 'player' }
  else if (a<=21 && b>21) { winner = 'player' }
  else if (a === b && a+b <= 42) { winner = 'push' }
  else if (b>a && b<=21) { winner = 'dealer' }
  else if (player_hand > 21) { winner = 'dealer' }
  return winner;
}