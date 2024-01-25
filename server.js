const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const http = require("http").Server(app);
const port = 8000;
const io = require("socket.io")(http);
const poker = require("./pokerserver/pokerback.js");
let storedUID = {};
let rooms = {};
let accountbyUID = {};
let accountbyUname = {};


class Account {
    constructor(UID, uname, pwd, fname, winnings = 0) {
        this.UID = UID;
        this.uname = uname;
        this.pwd = pwd;
        this.fname = fname;
        this.winnings = winnings;
        this.ingame = false;
        accountbyUID[this.UID] = this;
        accountbyUname[this.uname] = this;
    }
    updateUID(newUID) {
        delete accountbyUID[this.UID];
        this.UID = newUID;
        accountbyUID[this.UID] = this;
    }
}
function loadaccounts() {
    const data = fs.readFileSync("accounts.json");
    const accounts = JSON.parse(data);
    for (let account of accounts) {
        new Account(account.UID, account.uname, account.pwd, account.fname, account.winnings);
    }
}
async function saveaccounts() {
    const accounts = Object.values(accountbyUID);
    const data = JSON.stringify(accounts);
    await fs.promises.writeFile("accounts.json", data);
}
function login(socket, UID, uname, pwd) {
    if (accountbyUname[uname]) {
        if (accountbyUname[uname].pwd === pwd) {
            let playeraccount = accountbyUname[uname];
            playeraccount.updateUID(UID);
            socket.emit("logged in", accountbyUID[UID].winnings);
            saveaccounts();
        } else {
            socket.emit("invalid details", "wrong password");
        }
    }
    else {
        socket.emit("invalid details", "wrong username");
    }
}
function sign_up(socket, UID, uname, pwd, fname) {
    if (accountbyUname[uname]) {
        socket.emit("invalid details", "used username");
    }
    else {
        new Account(UID, uname, pwd, fname);
        socket.emit("logged in", accountbyUID[UID].winnings);
        saveaccounts()
    }
}
function create_room(socket, UID) {
    let roomID = Math.floor(Math.random() * 900000) + 100000;
    try {
        while (rooms[roomID].players.length > 0) {
            roomID = Math.floor(Math.random() * 900000) + 100000;
        }
    }
    catch { }
    socket.join(roomID);
    rooms[roomID] = new poker.room_instance(roomID);
    new poker.player_instance(socket, UID, accountbyUID[UID].uname, rooms[roomID]);
    socket.emit("joined room", roomID, poker.LETTERS[0], accountbyUID[UID].uname);
    accountbyUID[UID].ingame = true;
}
async function join_room(socket, roomID, UID) {
    roomID = parseInt(roomID);
    if (!rooms[roomID]) {
        socket.emit("invalid room");
    }
    else {
        if (rooms[roomID].players.length >= 4) {
            socket.emit("invalid (full) room");
        }
        else {
            socket.join(roomID);
            new poker.player_instance(socket, UID, accountbyUID[UID].uname, rooms[roomID]);
            io.to(roomID).emit("joined room", roomID, poker.LETTERS[rooms[roomID].players.length - 1], accountbyUID[UID].uname);
            accountbyUID[UID].ingame = true;
            if (rooms[roomID].players.length === 4) {
                const players = await poker.game_round(io, rooms[roomID]);
                players.forEach((player) => {
                    accountbyUID[player.UID].ingame = false;
                })
                delete rooms[roomID];
            }
        }
    }
}
async function UIDsetup(socket, UID) {
    if (!UID || !storedUID[UID]) {
        socket.emit("UID", socket.id);
        UID = socket.id;
        storedUID[UID] = { "disconnecttimer": null };
    }
    else {
        clearTimeout(storedUID[UID].disconnecttimer)
        storedUID[UID].disconnecttimer = null;
    }
    return UID
}
async function log_out(socket, UID) {
    const validlogin = await new Promise((resolve, reject) => {
        if (accountbyUID[UID].ingame) {
            resolve(false);
        } else {
            socket.emit("querylocation");
            socket.on("locationanswer", (location) => {
                const pathnames = ["/blackjack", "/roulette"]; //poker removed as in game tester
                if (pathnames.includes(location)) {
                    resolve(false);
                }
                else {
                    resolve(true)
                }
            });
        }
    });
    if (validlogin) {
        delete storedUID[UID];
        socket.emit("reloadpage");
    }
    else {
        socket.emit("message", "You cannot log out whilst in a game");
    }
}
function gamewinnings(UID, gamewinnings) {
    accountbyUID[UID].winnings += gamewinnings;
    saveaccounts();
}
function returnplayerwinnings(socket){
    let returnval = [];
    for (const UID in accountbyUID){
        const account = accountbyUID[UID]
        returnval.push([account.uname,account.winnings, account.winnings]);
    }
    socket.emit("player winnings",returnval);
}
function disconnect(socket, UID) {
    try {
        accountbyUID[UID].ingame = false;
    }
    catch { }
    //add poker logic
};
io.on("connection", (socket) => {
    socket.emit("SendUID");
    socket.on("ReturnUID", UID => {
        setTimeout(async () => {
            UID = await UIDsetup(socket, UID);
            if (accountbyUID[UID]) { socket.emit("logged in", accountbyUID[UID].winnings) } else {
                socket.emit("check location", accountbyUID, UID);
            }
            socket.on("create room", () => { create_room(socket, UID) });
            socket.on("join room", (room) => { join_room(socket, room, UID) });
            socket.on("sign up", (uname, pwd, fname) => { sign_up(socket, UID, uname, pwd, fname) });
            socket.on("log in", (uname, pwd) => { login(socket, UID, uname, pwd) });
            socket.on("gamewinnings", (winnings) => { gamewinnings(UID, winnings) });
            socket.on("return player winnings", ()=>{returnplayerwinnings(socket)})
            socket.on("log out", () => { log_out(socket, UID) });
            socket.on("disconnect", () => { disconnect(socket, UID) });
        }, 15);
    });
});
try {
    loadaccounts();
}
catch { }
process.on("uncaughtException", async () => {
    console.error(error);
    await saveaccounts();
    process.exit(1)
})
app.use(express.static(path.join(__dirname, 'app', 'public')));
function sendhtml(req, res, file) {
    let file_path = path.join(__dirname, "app", `${file}`);
    res.sendFile(file_path);
}
app.get("/", (req, res) => {
    res.redirect("/home");
});
app.get("/leaderboard", (req, res) => {
    sendhtml(req, res, "leaderboard.html");
});
app.get("/home", (req, res) => {
    sendhtml(req, res, "home.html");
});
app.get("/login", (req, res) => {
    sendhtml(req, res, "login.html");
});
app.get("/poker", (req, res) => {
    sendhtml(req, res, "poker.html");
});
app.get("/signup", (req, res) => {
    sendhtml(req, res, "signup.html");
});
app.get("/blackjack", (req, res) => {
    sendhtml(req, res, "blackjack.html");
});
app.get("/roulette", (req, res) => {
    sendhtml(req, res, "roulette.html");
});
http.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})