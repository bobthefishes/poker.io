const SMALLBLIND = 10;
const BIGBLIND = 20;
const LETTERS = ["A","B","C","D"];
const SUITS = ["Hearts","Diamonds","Clubs","Spades"];
const winnerdecoder = require("./winner.js");
class Deck {
    constructor() {
        this.deck = [];
        for (const suit of SUITS) {
            for (let i = 2; i < 15; i++) {
                this.deck.push([i, suit]);
            }
        }
    }
    resetcards() {
        this.deck = [];
        for (const suit of SUITS) {
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
};
const game_deck = new Deck();
game_deck.shufflecards();


class room_instance{
    constructor(roomID){
        this.roomID = roomID;
        this.players = [];
        this.activeplayers = [];
        this.community_cards = [];
        this.potsize = 0;
        this.bettingplayers = [];
        this.playerbyletter = {};
    }
}


class player_instance{
    constructor(socket,UID,uname, room_instance) {
        this.socket = socket;
        this.UID = UID;
        this.room_instance = room_instance;
        this.uname = uname;
        this.player_cards = [];
        room_instance.players.push(this);
        room_instance.activeplayers.push(this);
        room_instance.bettingplayers.push(this);
        this.letter = LETTERS[room_instance.players.indexOf(this)];
        this.stack = 5000;
        this.go = [];
        this.roundbetamount = 0;
        room_instance.playerbyletter[this.letter] = this;
    }
}


function blinds(io,room_instance,roomID){
    const smallblindplayer = room_instance.players[0];
    const bigblindplayer = room_instance.players[1];
    room_instance.potsize += SMALLBLIND + BIGBLIND;
    smallblindplayer.stack -= SMALLBLIND;
    bigblindplayer.stack -= BIGBLIND;
    io.to(roomID).emit("Blind", smallblindplayer.uname, bigblindplayer.uname,room_instance.potsize);
}
function dealplayercards(room_instance){
    room_instance.players.forEach((player) => {
        const playercards = [game_deck.returncard(),game_deck.returncard()];
        player.player_cards = playercards;
        player.socket.emit("player cards", playercards);
    });
}
function dealflop(io,room_instance,roomID){
    room_instance.community_cards.push(game_deck.returncard(),game_deck.returncard(),game_deck.returncard());
    io.to(roomID).emit("flop", room_instance.community_cards);
}
function dealturn(io,room_instance,roomID){
    room_instance.community_cards.push(game_deck.returncard());
    io.to(roomID).emit("turn", room_instance.community_cards[3]);
}
function dealriver(io,room_instance,roomID){
    room_instance.community_cards.push(game_deck.returncard());
    io.to(roomID).emit("river", room_instance.community_cards[4]);
}

function playerfold(player,room_instance){
    player.go = ["fold",0];
    room_instance.activeplayers.splice(room_instance.activeplayers.indexOf(player),1);
    room_instance.bettingplayers.splice(room_instance.bettingplayers.indexOf(player),1);
}
function playerbet(player,betamount,callamount,room_instance){
    console.log(betamount,callamount);
    if (betamount >= callamount){
        if (betamount === 0){
            player.go = ["check",0];
        }
        else if (betamount === player.stack){
            player.go = ["allin",betamount];
            room_instance.activeplayers.splice(room_instance.activeplayers.indexOf(player),1);
        }
        else if (betamount === callamount){
            player.go = ["call", betamount];
        } 
        else{
            player.go = ["raise",betamount];
        }
        player.stack -= betamount;
        player.room_instance.potsize += betamount;
    }
    else if (callamount > player.stack){
        player.go = ["allin",callamount,player.stack];
        player.stack -= betamount;
        room_instance.potsize += betamount;
        room_instance.activeplayers.splice(room_instance.activeplayers.indexOf(player),1);
    } 
    else{
        throw new Error("Invalid go");
    }
}

async function getplayerdecision(player,callamount,room_instance){
    return new Promise((resolve, reject) => {
        function handledecision(choice,betamount,callamount){
            if (choice === "bet"){
                playerbet(player,betamount,callamount,room_instance);
                resolve(player.go);
            }
            else{
                playerfold(player,room_instance);
                resolve(["fold",callamount]);
            }
        }
        player.socket.once("users choice",(choice,betamount,callamount) => {
            handledecision(choice,betamount,callamount)});
    });
}
async function playersgo(io,room_instance){
    let index = 0;
    let roundfinished = false;
    room_instance.activeplayers.forEach((player)=>{
        player.go = ["reset",0];
        player.roundbetamount = 0;
    });
    console.log("New round");
    while (!roundfinished){
        console.log("\n\n\n\n");
        console.log("_________________");
        room_instance.bettingplayers.forEach((player)=>{
            console.log(player.letter);
        });
        console.log(index);
        console.log(room_instance.activeplayers.length);
        if (room_instance.bettingplayers.length !== 1 && room_instance.activeplayers.length > 0){
            const player = room_instance.activeplayers[index];
            console.log("Playerletter:",player.letter);
            let actualcallamount = (room_instance.bettingplayers.indexOf(player)>0)?
            room_instance.bettingplayers[room_instance.bettingplayers.indexOf(player)-1].roundbetamount - 
            player.roundbetamount: room_instance.bettingplayers[room_instance.bettingplayers.length-1].roundbetamount-player.roundbetamount;
            if (actualcallamount > 0 || player.go[0] === "reset"){
                player.socket.emit("get player decision", player.stack, actualcallamount,player.roundbetamount);
                const playeraction = await getplayerdecision(player,actualcallamount,room_instance);
                player.roundbetamount += playeraction[1]; 
                //if the player goes all in for less than call amount this will default to actual callamount(on purpose)
                if (playeraction[0] !== "fold"){
                    actualcallamount = playeraction[1];
                }
                player.socket.emit("decision valid");
                io.to(room_instance.roomID).emit("show player decision", player.letter, player.go,player.uname,room_instance.potsize);
                room_instance.bettingplayers.forEach((player)=>{
                    console.log(player.letter);
                });
                console.log(index);
                console.log(room_instance.activeplayers.length);
                if (playeraction[0] === "fold" || playeraction[0] === "allin"){
                    if(index === room_instance.activeplayers.length){index = 0};
                    continue;
                };
            }
            if (index === room_instance.activeplayers.length-1){
                if (room_instance.activeplayers[0].roundbetamount === player.roundbetamount){
                    roundfinished = true;
                }else{
                    index = 0;
                };
            }else{
                index++;
            };
        }
        else{
            roundfinished = true;
        }
    }
}
function showcards(io,room_instance){
    io.to(room_instance.roomID).emit("show cards",
    room_instance.players[0].player_cards,
    room_instance.players[1].player_cards,
    room_instance.players[2].player_cards,
    room_instance.players[3].player_cards
    );
}

function winner(io,room_instance){
    let bettingcards = {};
    let winningplayers = [];
    if (room_instance.bettingplayers.length > 1){
    room_instance.bettingplayers.forEach((player) =>{
         bettingcards[player.letter] = player.player_cards;
    });
        winningplayers = winnerdecoder.multiplayerwinner(bettingcards,room_instance.community_cards);
    }else{
        winningplayers[0] = room_instance.bettingplayers[0].letter
    };
    const sharedpot = (room_instance.potsize / winningplayers.length).toFixed(0);
    winningplayers.forEach((letter) =>{
        room_instance.playerbyletter[letter].stack += sharedpot;
        console.log(letter,room_instance.playerbyletter[letter].stack)
    });
    let winnings = {};
    room_instance.players.forEach((player)=>{
        winnings[player.UID] = player.stack - 5000;
        player.socket.emit("Show winnings", (player.stack -5000));
    });
    io.emit("winnings", winnings);
}

async function game_round(io,room_instance){
    const roomID = room_instance.roomID;
    blinds(io,room_instance,roomID);
    io.to(roomID).emit("game starting");
    dealplayercards(room_instance);
    await playersgo(io,room_instance);
    dealflop(io,room_instance,roomID);
    await playersgo(io,room_instance);
    dealturn(io,room_instance,roomID);
    await playersgo(io,room_instance);
    dealriver(io,room_instance,roomID);
    await playersgo(io,room_instance);
    showcards(io,room_instance);
    winner(io,room_instance);
}

module.exports = {
    game_round,
    room_instance,
    player_instance
}