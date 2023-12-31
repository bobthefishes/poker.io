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


class Account{
    constructor(UID,uname,pwd,fname,winnings = 0){
        this.UID = UID;
        this.uname = uname;
        this.pwd = pwd;
        this.fname = fname;
        this.winnings = winnings;
        accountbyUID[this.UID] = this;
        accountbyUname[this.uname] = this;
    }
    updateUID(newUID){
        delete accountbyUID[this.UID];
        this.UID = newUID;
        accountbyUID[this.UID] = this;
    }
}
function loadaccounts(){
    const data = fs.readFileSync("accounts.json");
    const accounts = JSON.parse(data);
    for (let account of accounts) {
      new Account(account.UID, account.uname, account.pwd, account.fname,account.winnings);
    }
}
async function saveaccounts(){
    const accounts = Object.values(accountbyUID);
    const data = JSON.stringify(accounts);
    await fs.promises.writeFile("accounts.json",data);
}
function login(socket,UID,uname,pwd){
    if (accountbyUname[uname]){
        if (accountbyUname[uname].pwd === pwd){
            socket.emit("logged in");
            let playeraccount = accountbyUname[uname];
            playeraccount.updateUID(UID);
            saveaccounts();
        }else{
            socket.emit("invalid details", "wrong password");
        }
    }
    else{
        socket.emit("invalid details", "wrong username");
    }
}
function sign_up(socket,UID,uname,pwd,fname){
    if (accountbyUname[uname]){
        socket.emit("invalid details", "used username");
    }
    else{
        socket.emit("logged in");
        new Account(UID,uname,pwd,fname);
        saveaccounts()
    }
}
function create_room(socket,UID){
    let roomID = Math.floor(Math.random() * 900000) + 100000;
    while (rooms[roomID]){
        roomID = Math.floor(Math.random() * 900000) + 100000;
    }
    socket.join(roomID);
    socket.emit("joined room", roomID, accountbyUID[UID]);
    rooms[roomID] = new poker.room_instance(roomID);
    new poker.player_instance(socket,UID,accountbyUID[UID].uname,rooms[roomID]);
}
async function join_room(socket,roomID,UID){
    roomID = parseInt(roomID);
    if (!rooms[roomID]){
        socket.emit("invalid room");
    }
    else{
        if (rooms[roomID].players.length >= 4){
            socket.emit("invalid (full) room");
        }
        else{
            socket.join(roomID);
            io.to(roomID).emit("joined room", roomID, accountbyUID[UID]);
            new poker.player_instance(socket,UID,accountbyUID[UID].uname,rooms[roomID]);
            if (rooms[roomID].players.length === 4){
                await poker.game_round(io,rooms[roomID]);
            }
        }
    }
}

async function UIDsetup(socket,UID){
    if (!UID || !storedUID[UID]){
        socket.emit("UID", socket.id);
        UID = socket.id;
        storedUID[UID] = {"disconnecttimer":null};
    }
    else{
        clearTimeout(storedUID[UID].disconnecttimer)
        storedUID[UID].disconnecttimer = null;
    }
    return UID
}
function disconnect(UID){
    try{
        storedUID[UID].disconnecttimer = setTimeout(() => {
            delete storedUID[UID];
        }, 10000);
    }
    catch{}
}
function gamewinnings(UID,gamewinnings){
    accountbyUID[UID].winnings += gamewinnings;
    saveaccounts();
}
io.on("connection", (socket) => {
    socket.emit("SendUID");
    socket.on("ReturnUID", UID =>{
        setTimeout(async() => {
        UID = await UIDsetup(socket,UID);
        if (accountbyUID[UID]){socket.emit("logged in")}else{
        socket.emit("check location", accountbyUID,UID);
        }
        socket.on("create room", () => {create_room(socket, UID)});
        socket.on("join room", (room) => {join_room(socket,room, UID)});
        socket.on("sign up", (uname,pwd,fname) => {sign_up(socket,UID,uname,pwd,fname)});
        socket.on("log in", (uname,pwd) => {login(socket,UID,uname,pwd)});
        socket.on("gamewinnings",(winnings) =>{gamewinnings(UID,winnings)});
        socket.on("disconnect", ()=>{disconnect(UID)});
    },15);
    });
});
try{
loadaccounts();
}
catch{}

app.use(express.static(path.join(__dirname, 'app', 'public')));
function sendhtml(req,res,file){
    let file_path = path.join(__dirname,"app",`${file}`);
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