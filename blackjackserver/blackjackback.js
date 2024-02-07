const SUITS = {
    "Hearts": 0,
    "Diamonds": 1950,
    "Clubs": 3900,
    "Spades": 5850
  }
  class Deck {
    constructor() {
        this.deck = [];
        for (const suit in SUITS) {
            for (let i = 2; i < 15; i++) {
                this.deck.push([i, suit]);
            }
        }
    }
    resetcards() {
        this.deck = [];
        for (const suit in SUITS) {
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
async function blackjack_round(){

};

module.exports = {
    blackjack_round
}