const key_arr = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
function count_values(deck) {
    let value_list = {
        14: [],
        13: [],
        12: [],
        11: [],
        10: [],
        9: [],
        8: [],
        7: [],
        6: [],
        5: [],
        4: [],
        3: [],
        2: []
    }
    for (let card of deck) {
        value_list[card[0]].push(card);
    }
    return value_list
}
function is_straight_flush(deck) { //royal flush is just [true,14]
    try {
        return is_straight(is_flush(deck, returnflushdeck = true))
    } catch (e) {
        return [false]
    }
}
function is_four_of_a_kind(deck) {
    let value_dict = count_values(deck);
    for (let key of key_arr) {
        if (value_dict[key].length === 4) {
            return [true, key]
        }
    }
    return [false]
}
function is_full_house(deck) {
    let three = is_three_of_a_kind(deck)
    let pair = is_pair(deck)
    if (three[0] && pair[0]) {
        return [true, three[1], pair[1]]
    }
    return [false]
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
function is_straight(deck) {
    let unique_deck = [];
    let value_deck = [];
    for (let i = 0; i < deck.length; i++) {
        if (!value_deck.includes(deck[i][0])) {
            unique_deck.push(deck[i]);
            value_deck.push(deck[i][0]);
        }
    }
    if (unique_deck.length < 5) { return [false] }
    for (let i = unique_deck.length - 1; i >= 4; i--) {
        if (unique_deck[i][0] - unique_deck[i - 4][0] == 4) {
            return [true, unique_deck[i][0]];
        }
    }
    let slice = unique_deck.slice(0, 4);
    let slice_val = [];
    for (let x of slice) {
        slice_val.push(x[0]);
    }
    if (slice_val.join("") === [2, 3, 4, 5].join("") && unique_deck.at(-1)[0] === 14) {
        return [true, 5]
    }
    return [false]
}
function is_three_of_a_kind(deck) {
    let value_dict = count_values(deck);
    for (let key of key_arr) {
        if (value_dict[key].length === 3) {
            return [true, key]
        }
    }
    return [false]
}
function is_two_pair(deck) {
    let pairs = [];
    let value_dict = count_values(deck);
    for (let key of key_arr) {
        if (value_dict[key].length === 2) {
            pairs.push(key);
            if (pairs.length === 2) {
                returnval = [true, ...pairs];
                return returnval
            }
        }
    }
    return [false]
}
function is_pair(deck) {
    let value_dict = count_values(deck);
    for (let key of key_arr) {
        if (value_dict[key].length === 2) {
            return [true, key]
        }
    }
    return [false]
}
function highcard(deck) {
    return deck[deck.length-1][0]
}
function handvalue(player, player_cards, community_cards, raw = false) {
    let deck = make_deck(player_cards, community_cards);
    if (!raw) {
        let straight_flush = is_straight_flush(deck);
        if (straight_flush[0]) {
            if (straight_flush[1] === 14) {
                return `You have a royal flush`
            }
            return `You have a ${straight_flush[1]} high straight flush`
        }
        let four_of_a_kind = is_four_of_a_kind(deck);
        if (four_of_a_kind[0]) {
            return `You have a ${four_of_a_kind[1]} high four of a kind`
        }
        let full_house = is_full_house(deck);
        if (full_house[0]) {
            return `You have a full house: ${full_house[1]} full of ${full_house[2]}`
        }
        let flush = is_flush(deck);
        if (flush[0]) {
            return `You have a ${flush[1]} high flush`
        }
        let straight = is_straight(deck);
        if (straight[0]) {
            return `You have a ${straight[1]} high straight`
        }
        let three_of_a_kind = is_three_of_a_kind(deck);
        if (three_of_a_kind[0]) {
            return `You have a ${three_of_a_kind[1]} high three of a kind`
        }
        let two_pair = is_two_pair(deck);
        if (two_pair[0]) {
            return `You have a ${two_pair[1]}, ${two_pair[2]} high two pair`
        }
        let pair = is_pair(deck);
        if (pair[0]) {
            return `You have a ${pair[1]} high pair`
        }
        else {
            return `You have a ${highcard(deck)} highcard`
        }
    } else {
        let straight_flush = is_straight_flush(deck);
        if (straight_flush[0]) {
            return ["straight_flush", straight_flush[1]]
        }
        let four_of_a_kind = is_four_of_a_kind(deck);
        if (four_of_a_kind[0]) {
            return ["four_of_a_kind", four_of_a_kind[1]]
        }
        let full_house = is_full_house(deck);
        if (full_house[0]) {
            return ["full_house", full_house[1], full_house[2]]
        }
        let flush = is_flush(deck);
        if (flush[0]) {
            return ["flush", flush[1]]
        }
        let straight = is_straight(deck);
        if (straight[0]) {
            return ["straight", straight[1]]
        }
        let three_of_a_kind = is_three_of_a_kind(deck);
        if (three_of_a_kind[0]) {
            return ["three_of_a_kind", three_of_a_kind[1]]
        }
        let two_pair = is_two_pair(deck);
        if (two_pair[0]) {
            return ["two_pair", two_pair[1], two_pair[2]]
        }
        let pair = is_pair(deck);
        if (pair[0]) {
            return ["pair", pair[1]]
        }
        else {
            return ["highcard", highcard(deck)]
        }
    }
}
function make_deck(player_cards, community_cards) {
    let deck = [...player_cards, ...community_cards];
    deck.sort(function (a, b) { return a[0] - b[0] });
    return deck
}
module.exports = {handvalue,make_deck,is_flush}