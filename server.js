const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const http = require("http").Server(app);
const port = 8000;
const io = require("socket.io")(http);
let storedUID = {}
let rooms = [];
/*SOCKET.IO SERVER */
let accountbyUID = {} //UID:account
let accountbyUname = {}//Uname:account
class Account{
    constructor(UID,uname,pwd,fname,wins = 0,losses = 0,money_won = 0){
        this.UID = UID;
        this.uname = uname;
        this.pwd = pwd;
        this.fname = fname;
        this.wins = wins;
        this.losses = losses;
        this.money_won = money_won;
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
      new Account(account.UID, account.uname, account.pwd, account.fname,account.wins,account.losses,account.money_won);
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
    console.log(uname,pwd,fname)
    if (accountbyUname[uname]){
        socket.emit("invalid details", "used username");
    }
    else{
        socket.emit("logged in");
        let playeraccount = new Account(UID,uname,pwd,fname);
        saveaccounts()
    }
}
async function create_room(socket, UID){        
    let room = Math.floor(Math.random() * 900000) + 100000;
    let sockets = await io.in(room).fetchSockets();
    while (sockets.length > 0){
        sockets = await io.in(room).fetchSockets();
        room = Math.floor(Math.random() * 900000) + 100000;
    }
    rooms.push(room);
    socket.join(room);
    io.to(room).emit("joined room", room, accountbyUID[UID]);
}
async function join_room(socket,room, UID){
    room = +room;
    const sockets = await io.in(room).fetchSockets();
    if (!rooms.includes(room)){
        socket.emit("invalid room");
    }else{
        if (sockets.length < 4){
        socket.join(room);
        io.to(room).emit("joined room", room, accountbyUID[UID]);
        }else{
            socket.emit("invalid room");
        }
    }
}
io.on("connection", (socket) => {
    socket.emit("SendUID");
    socket.on("ReturnUID", UID =>{
        setTimeout(() => {
        if (!UID){
            socket.emit("UID", socket.id);
            UID = socket.id;
            storedUID[UID] = {"disconnecttimer":null};
        }
        else{
            if (storedUID[UID]){
                clearTimeout(storedUID[UID].disconnecttimer)
                storedUID[UID].disconnecttimer = null;
            }
            else{
                socket.emit("UID", socket.id);
                UID = socket.id;
                storedUID[UID] = {"disconnecttimer":null};
            }
        }
        socket.on("disconnect", ()=>{
            storedUID[UID].disconnecttimer = setTimeout(() => {
                delete storedUID[UID];
            }, 10000);
        });
        if (accountbyUID[UID]){
            socket.emit("logged in");
            socket.emit("load play page");
        }else{
            socket.emit("check location");
        }
        socket.on("create room", () => {create_room(socket, UID)});
        socket.on("join room", room => {join_room(socket,room, UID)})
        socket.on("sign up", (uname,pwd,fname) => {sign_up(socket,UID,uname,pwd,fname)})
        socket.on("log in", (uname,pwd) => {login(socket,UID,uname,pwd)})
    },15); //default to testing.js for without delay(does not work on edge without)
    });
});
//assume that the player is logged in before playing
try{
loadaccounts();
}catch{}


/*Basic app */
app.use(express.static(path.join(__dirname, 'app', 'public')));
function sendhtml(req,res,file){
    let file_path = path.join(__dirname,"app",`${file}`)
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
http.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})
