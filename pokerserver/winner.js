const handstrength = {
    "straight_flush": 9,
    "four_of_a_kind": 8,
    "full_house": 7,
    "flush": 6,
    "straight": 5,
    "three_of_a_kind": 4,
    "two_pair": 3,
    "pair": 2,
    "highcard": 1
};
function winner(playerA_deck, playerA_hand_strength, playerB_deck, playerB_hand_strength) {
    if (handstrength[playerA_hand_strength[0]] > (handstrength[playerB_hand_strength[0]])) {
        return "1"
    }
    if (handstrength[playerA_hand_strength[0]] < (handstrength[playerB_hand_strength[0]])) {
        return "2"
    }
    //card rank not working
    for (let i = 1; i < 3; i++) {
        if (playerA_hand_strength[i] > playerB_hand_strength[i]) {
            return "1"
        }
        if (playerA_hand_strength[i] < playerB_hand_strength[i]) {
            return "2"
        }
    }
    if ((handstrength[playerA_hand_strength[0]] === 7 || (handstrength[playerA_hand_strength[0]] === 3))) {
        if (playerA_hand_strength[2] > playerB_hand_strength[2]) {
            return "1"
        }
        if (playerA_hand_strength[2] < playerB_hand_strength[2]) {
            return "2"
        }
    }
    let hand_type = handstrength[playerA_hand_strength[0]]
    if (hand_type === 9 || hand_type === 7 || hand_type === 5) {
        return "S"
    }
    if (hand_type === 6 || hand_type === 3) {
        return kicker(hand_type, [playerA_hand_strength[1], playerA_hand_strength[2]], playerA_deck, playerB_deck)
    }
    return kicker(hand_type, playerA_hand_strength[1], playerA_deck, playerB_deck)
}
function kicker(hand_type, handstrength, playerA_deck, playerB_deck) {
    let A_filter_deck = filter_deck(playerA_deck, [[handstrength]].flat(Infinity)).sort(function (a, b) { return b[0] - a[0] });
    let B_filter_deck = filter_deck(playerB_deck, [[handstrength]].flat(Infinity)).sort(function (a, b) { return b[0] - a[0] });
    if (hand_type === 8) {
        if (A_filter_deck[0] > B_filter_deck[0]) {
            return "1"
        }
        if (A_filter_deck[0] < B_filter_deck[0]) {
            return "2"
        }
        return "S"
    }
    if (hand_type === 6) {
        let A_flush = strengthdecoder.is_flush(playerA_deck, returnflushdeck = true).sort(function (a, b) { return b[0] - a[0] });
        let B_flush = strengthdecoder.is_flush(playerB_deck, returnflushdeck = true).sort(function (a, b) { return b[0] - a[0] });
        for (let i = 0; i < 5; i++) {
            if (A_flush[i][0] > B_flush[i][0]) {
                return "1"
            }
            if (A_flush[i][0] < B_flush[i][0]) {
                return "2"
            }
        }
        return "S"
    }
    function find_highest_kicker(rep) {
        for (let i = 0; i <= rep; i++) {
            if (A_filter_deck[i][0] > B_filter_deck[i][0]) {
                return "1"
            }
            if (A_filter_deck[i][0] < B_filter_deck[i][0]) {
                return "2"
            }
        }
        return "S"
    }
    if (hand_type === 4) {
        return `${find_highest_kicker(2)}`
    }
    if (hand_type === 3) {
        return `${find_highest_kicker(1)}`
    }
    if (hand_type === 2) {
        return `${find_highest_kicker(3)}`
    }
    if (hand_type === 1) {
        return `${find_highest_kicker(4)}`
    }
}
function filter_deck(deck, values) {
    for (val of values) {
        deck = deck.filter(card => card[0] != val);
    }
    return deck
}
const strengthdecoder = require("./hands.js");
function multiplayerwinner(player_cards,community_cards){ //give playercards as {"A":deck,"B":deck ect}, assume minumum 2 players
    let hands = {}
    for (const player in player_cards) {
        hands[player] = {
            "Deck":strengthdecoder.make_deck(player_cards[player],community_cards),
            "Strength":strengthdecoder.handvalue(null,player_cards[player],community_cards,true)
        };
    }
    let overallwinner;
    for (const x in hands){
        if (!overallwinner){overallwinner = [x];continue}
        const tempwinner = winner(hands[overallwinner].Deck,hands[overallwinner].Strength,hands[x].Deck,hands[x].Strength);
        if (tempwinner === "2"){
            overallwinner = [x];
        }
        else if (tempwinner === "S"){
            overallwinner.push(x);
        }
    }
    return overallwinner;
}
module.exports = {
    multiplayerwinner
};