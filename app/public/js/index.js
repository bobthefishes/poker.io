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

let done_deal_A = false;
let done_deal_B = false;
let done_flip_B = false;
let done_flop = false;
let done_turn = false;
let done_river = false;
let done_bet = false;
let playerA_cards = [];   //add for loop for each player so new list + connect to player class
let playerB_cards = [];
let community_cards = [];
let i = 0;
let x = 0;
let card_1_B = null;
let card_2_B = null;
let game_deck = new Deck();
game_deck.shufflecards();

function reset() {
    game_deck.resetcards();
    game_deck.shufflecards()
    const communityCards = document.querySelectorAll(".community_card");
    const playerACards = document.querySelectorAll(".playerA_card");
    const playerBCards = document.querySelectorAll(".playerB_card");
    communityCards.forEach(card => {
        card.style.backgroundImage = "url(../assets/cardBackRed.png)";
        card.style.backgroundSize = "110% 110%";
    })
    playerACards.forEach(card => {
        card.style.backgroundImage = "url(../assets/cardBackBlue.png)";
        card.style.backgroundSize = "110% 110%";
    })
    playerBCards.forEach(card => {
        card.style.backgroundImage = "url(../assets/cardBackBlue.png)";
        card.style.backgroundSize = "110% 110%";
    })
    document.querySelector(".pot_size").innerHTML = "Pot: £0";
    document.querySelector(".betting_amount").innerHTML = "Your bet: £";
    done_deal_A = false;
    done_deal_B = false;
    done_flip_B = false;
    done_flop = false;
    done_turn = false;
    done_river = false;
    done_bet = false;
    playerA_cards = [];
    playerB_cards = [];
    community_cards = [];
    allin = false;
    i = 0;
    x = 0;
    potsize = 0;
    card_1_B = null;
    card_2_B = null;
    const allCards = document.querySelectorAll(".card");
    allCards.forEach(card => {
        card.classList.remove("flip");
    })
    document.querySelector(".stack").innerHTML = `Your stack: £${stack}`;
    document.querySelector(".pot_size").innerHTML = `Blind: £${blind_size}`;
    document.querySelector(".winner").innerHTML = "Winner:";
    document.querySelector(".confirm_bet_btn").disabled = false;
    document.querySelector(".all_in_btn").disabled = false;
    document.getElementById("bet_input").disabled = false;
    document.getElementById("hand_strength_A").innerHTML = `Player A hand strength:`;
    document.getElementById("hand_strength_B").innerHTML = `Player B hand strength:`;
    document.querySelector(".play_again_btn").style.visibility = "hidden"
    conf_bet.style.visibility = "visible";
    allin_btn.style.visibility = "visible";
    bet_input.style.visibility = "visible";
    betting_amount.style.visibility = 'visible';
    fold_btn.style.visibility = 'visible';
}

function play_again() {
    reset();
    playerB_card();
}

function flop() {
    if (done_deal_A && done_deal_B) {
        if (!allin) {
            conf_bet.disabled = false;
            allin_btn.disabled = false;
            done_bet = false;
        };
        if (!done_flop) {
            const Cards = document.querySelectorAll(".flop");
            Cards.forEach(card => {
                card.classList.add("flip");
                let next_card = game_deck.returncard();
                community_cards.push(next_card);
                card.style.backgroundImage = `url('/assets/newDeck/${next_card[1]}/card${next_card[1]}_${next_card[0]}.png')`;
                card.style.backgroundSize = '100% 109%';
            })
            return_hand_strength();
            done_flop = true;
        }
    }
}
function dealer(type) {
    if (!allin) {
        conf_bet.disabled = false;
        allin_btn.disabled = false;
        done_bet = false;
    };
    if ((!done_turn && done_flop && type === 'turn') || (!done_river && done_turn && type === 'river')) {
        if (!done_turn) { done_turn = true } else { done_river = true }
        const card = document.querySelector(`.${type}`);
        card.classList.add("flip");
        let next_card = game_deck.returncard();
        community_cards.push(next_card);
        card.style.backgroundImage = `url('/assets/newDeck/${next_card[1]}/card${next_card[1]}_${next_card[0]}.png')`;
        card.style.backgroundSize = '100% 109%';
        //done_turn = true //why
        return_hand_strength()
    }
}
function playerA_card() {
    if (!done_deal_A) {
        done_deal_A = true;
        const Cards = document.querySelectorAll(".playerA_card");
        Cards.forEach(card => {
            card.classList.add("flip");
            let next_card = game_deck.returncard();
            playerA_cards.push(next_card);
            card.style.backgroundImage = `url('/assets/newDeck/${next_card[1]}/card${next_card[1]}_${next_card[0]}.png')`;
            card.style.backgroundSize = '100% 109%';
        })
        return_hand_strength()
        done_bet = false;
        blind(blind_size);
        socket.emit("PlayerA");
    }
}

function playerB_card() {
    if (!done_deal_B) {
        done_deal_B = true;
        const Cards = document.querySelectorAll(".playerB_card");
        Cards.forEach(card => {
            let next_card_B = game_deck.returncard();
            playerB_cards.push(next_card_B);
            i++;
            if (i === 1) { card_1_B = next_card_B }
            if (i === 2) { card_2_B = next_card_B }
        })
        return_hand_strength();
    }
}
function playerB_card_flip() {
    if (!done_flip_B) {
        done_flip_B = true;
        const Cards = document.querySelectorAll(".playerB_card");
        Cards.forEach(card => {
            x++;
            card.classList.add("flip");
            if (x === 1) {
                card.style.backgroundImage = `url('/assets/newDeck/${card_1_B[1]}/card${card_1_B[1]}_${card_1_B[0]}.png')`;
            }
            else if (x === 2) {
                card.style.backgroundImage = `url('/assets/newDeck/${card_2_B[1]}/card${card_2_B[1]}_${card_2_B[0]}.png')`;
            }
            card.style.backgroundSize = '100% 109%';
            card.style.opacity = "1"
        })
        return_hand_strength()

    }
}


//betting
let conf_bet = document.querySelector(".confirm_bet_btn");
let allin_btn = document.querySelector(".all_in_btn");
let bet_input = document.getElementById("bet_input");
let potsize = 0;
let allin = false;
let stack = 5000;
let blind_size = 50;
let betting_amount = document.querySelector(".betting_amount");
let fold_btn = document.querySelector(".fold_btn");

function show_value() {
    const value = parseInt(document.getElementById("bet_input").value);
    if (value === 0) { document.querySelector(".betting_amount").innerHTML = 'Check' }
    else if (value === stack) { document.querySelector(".betting_amount").innerHTML = 'All in' }
    else { document.querySelector(".betting_amount").innerHTML = `Your bet is: £${value}` };
}
/*function show_value_2() {
    const value = document.getElementById("text_bet_input").value;
    document.querySelector(".betting_amount").innerHTML = `Your bet is: £${value}`;
    document.getElementById("bet_input").value = value;
}*/

function hide_stuff() {
    document.querySelector(".play_again_btn").style.visibility = "visible";
    conf_bet.style.visibility = "hidden";
    allin_btn.style.visibility = "hidden";
    bet_input.style.visibility = 'hidden';
    betting_amount.style.visibility = 'hidden';
    fold_btn.style.visibility = 'hidden';
}

function fold() {
    if (done_deal_A && !done_bet) {
        reset();
        console.log("B");
        document.querySelector(".winner").innerHTML = 'Winner: Player B won';
        playerB_card();
    }
}

function add_to_pot() {
    if (done_deal_A && done_deal_B) {
        done_bet = true;
        const value = document.getElementById("bet_input").value;
        potsize = potsize + parseInt(value);
        document.querySelector(".pot_size").innerHTML = `Pot: £${potsize}`;
        conf_bet.disabled = true;
        allin_btn.disabled = true;
        stack = stack - parseInt(value);
        document.querySelector(".stack").innerHTML = `Your stack: £${stack}`;
        change_max_bet()
        if (stack <= 0) {
            allin = true;
            document.querySelector(".stack").innerHTML = "Your stack is empty...";
            document.querySelector(".betting_amount").innerHTML = "You're all in!";
            if (!done_flop) { flop(); dealer('turn'); dealer('river') }
            else if (done_flop && !done_turn) { dealer("turn"); dealer("river") }
            else if (done_turn && !done_river) { dealer("river")}
            playerB_card_flip();
            return_winner();
            if (stack > 0) {
                hide_stuff();
            }
        }

        if (!done_flop) { flop() }
        else if (done_flop && !done_turn) { dealer("turn") }
        else if (done_turn && !done_river) { dealer("river") }

        if (done_river === true && done_bet === true && stack > 0) {
            conf_bet.disabled = true;
            allin_btn.disabled = true;
            playerB_card_flip();
            return_winner();
            hide_stuff();
        }
    }
}

function all_in() {
    if (done_deal_A && done_deal_B) {
        done_bet = true;
        allin = true;
        potsize = potsize + stack;
        document.querySelector(".pot_size").innerHTML = `Pot: £${potsize}`;
        document.querySelector(".betting_amount").innerHTML = "You're all in!";
        document.getElementById("bet_input").disabled = true;
        conf_bet.disabled = true;
        allin_btn.disabled = true;
        stack = 0;
        document.querySelector(".stack").innerHTML = `Your stack is empty...`;

        if (!done_flop) { flop(); dealer('turn'); dealer('river') }
        else if (done_flop && !done_turn) { dealer("turn"); dealer("river") }
        else if (done_turn && !done_river) { dealer("river") }
        playerB_card_flip();
        return_winner();
        if (stack > 0) {
            hide_stuff();
        }
    }
}
function blind(blind_size) {
    potsize = potsize + blind_size;
    stack = stack - blind_size;
    change_max_bet();
    document.querySelector(".pot_size").innerHTML = `Pot: £${potsize}`;
    document.querySelector(".stack").innerHTML = `Your stack: £${stack}`;
}
function change_max_bet() {
    const bet_input = document.getElementById("bet_input");
    bet_input.setAttribute("max", stack);
    console.log(stack);
}

//Hand strenths
function return_hand_strength() {
    if (playerA_cards.length != 0) {
        document.getElementById("hand_strength_A").innerHTML = `Player A hand strength: ${handvalue(null, playerA_cards, community_cards)}`;
    }
    if (playerB_cards.length != 0) {
        document.getElementById("hand_strength_B").innerHTML = `Player B hand strength: ${handvalue(null, playerB_cards, community_cards)}`;
    }
}
function return_winner() {
    const playerA_hand_strength = handvalue(null, playerA_cards, community_cards, true);
    const playerB_hand_strength = handvalue(null, playerB_cards, community_cards, true);
    let win = winner(make_deck(playerA_cards, community_cards), playerA_hand_strength, make_deck(playerB_cards, community_cards), playerB_hand_strength);
    document.querySelector(".winner").innerHTML = `Winner: ${win}`;
    if (win === "Player A won") {
        console.log("A");
        stack = stack + (potsize*2);
        document.querySelector(".stack").innerHTML = `Your stack: ${stack}`;
        potsize = 0;
        document.querySelector(".pot_size").innerHTML = `Pot: ${potsize}`;
    }
    else if (win === "Player B won") {
        console.log("B");
    }
    else {
        console.log("Split")
      
    }
}
socket.on("joined room", (room, account) => {
    document.querySelector(".roomID").innerHTML = `Room ID: ${room} ${account.uname}`;
})
socket.on("invalid room", () =>{
    document.querySelector(".roomID").innerHTML = "Invalid room";
    document.querySelector(".roominput").value = null;
})
document.querySelector(".createroom").addEventListener("click", () =>{
    socket.emit("create room");
})
function room(event){
    event.preventDefault();
    const roomID = document.querySelector(".roominput").value;
    socket.emit("join room", roomID);
}
socket.on("load play page", () => {
    playerB_card();
    document.querySelector(".stack").innerHTML = `Your stack: £${stack}`;
    document.querySelector(".pot_size").innerHTML = `Blind: £${blind_size}`;
    change_max_bet();
})