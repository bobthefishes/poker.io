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
        return "Player A won"
    }
    if (handstrength[playerA_hand_strength[0]] < (handstrength[playerB_hand_strength[0]])) {
        return "Player B won"
    }
    //card rank not working
    for (let i = 1; i < 3; i++) {
        if (playerA_hand_strength[i] > playerB_hand_strength[i]) {
            return "Player A won"
        }
        if (playerA_hand_strength[i] < playerB_hand_strength[i]) {
            return "Player B won"
        }
    }
    if ((handstrength[playerA_hand_strength[0]] === 7 || (handstrength[playerA_hand_strength[0]] === 3))) {
        if (playerA_hand_strength[2] > playerB_hand_strength[2]) {
            return "Player A won"
        }
        if (playerA_hand_strength[2] < playerB_hand_strength[2]) {
            return "Player B won"
        }
    }
    let hand_type = handstrength[playerA_hand_strength[0]]
    if (hand_type === 9 || hand_type === 7 || hand_type === 5) {
        return "Split money"
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
            return "Player A won"
        }
        if (A_filter_deck[0] < B_filter_deck[0]) {
            return "Player B won"
        }
        return "Split money"
    }
    if (hand_type === 6) {
        let A_flush = is_flush(playerA_deck, returnflushdeck = true).sort(function (a, b) { return b[0] - a[0] });
        let B_flush = is_flush(playerB_deck, returnflushdeck = true).sort(function (a, b) { return b[0] - a[0] });
        for (let i = 0; i < 5; i++) {
            if (A_flush[i][0] > B_flush[i][0]) {
                return "Player A won"
            }
            if (A_flush[i][0] < B_flush[i][0]) {
                return "Player B won"
            }
        }
        return "Split money"
    }
    function find_highest_kicker(rep) {
        for (let i = 0; i <= rep; i++) {
            if (A_filter_deck[i][0] > B_filter_deck[i][0]) {
                return "Player A won"
            }
            if (A_filter_deck[i][0] < B_filter_deck[i][0]) {
                return "Player B won"
            }
        }
        return "Split money"
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

function is_flush(deck, returnflushdeck = false) {
    let suit_lists = {
        "Clubs": [],
        "Spades": [],
        "Hearts": [],
        "Diamonds": [],
    };
    for (let card of deck) {
        suit_lists[card[1]].push(card);
    }
    for (let suit in suit_lists) {
        let suit_deck = suit_lists[suit]
        if (suit_deck.length >= 5) {
            if (!returnflushdeck) {
                return [true, suit_deck.at(-1)[0]]
            } else {
                return suit_deck
            }
        }
    }
    return [false]
}
