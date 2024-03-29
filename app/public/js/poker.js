function getcardimage(card){
    return `./assets/newDeck/${card[1]}/card${card[1]}_${card[0]}.png`
}
function dealcards(cardclass,dealtcards){
    const Cards = document.querySelectorAll(cardclass);
    Cards.forEach((card,index) => {
        card.style.backgroundImage = `url(${getcardimage(dealtcards[index])})`
        card.style.backgroundSize = '100% 109%';
    }) 
}
socket.on("player cards", (dealtcards,letter) => {   
    dealcards(".player_card",dealtcards);
    dealcards(`.player${letter}_card`,dealtcards);
})
socket.on("flop", (dealtcards) => {
    dealcards(".flop",dealtcards);
})
socket.on("turn", (dealtcards) => {
    dealcards(".turn",[dealtcards]);
})
socket.on("river", (dealtcards) => {
    dealcards(".river",[dealtcards]);
})
socket.on("show cards", (playera,playerb,playerc,playerd)=>{
    console.log(playera,playerb,playerc,playerd);
    dealcards(".playerA_card",playera);
    dealcards(".playerB_card",playerb);
    if (playerc){
        dealcards(".playerC_card",playerc);
        if (playerd){
            dealcards(".playerD_card",playerd);
        }
    }
    
})
socket.on("show player decision", (letter,action,uname,potsize) =>{
    if (action[0] === "fold"){
        showNotification(`${uname}: Fold`, `noti${letter}`)
        document.querySelectorAll(`.player${letter}_card`).forEach((card)=> {
            card.classList.add("greyscale");
        });
    }
    else if (action[0] === "check"){
        showNotification(`${uname}: Check`, `noti${letter}`)
    }
    else if (action[0] === "call"){
        showNotification(`${uname}: Call`, `noti${letter}`)
    }
    else if (action[0] === "raise"){
        showNotification(`${uname}: Raise to ${action[1]}`, `noti${letter}`)
    }
    else if (action[0] === "allin"){
        if (action[2]){
            showNotification(`${uname}: All-in for ${action[2]}`, `noti${letter}`)
        }
        else{
            showNotification(`${uname}: All-in for ${action[1]}`, `noti${letter}`)
        }
    }
    document.querySelector(".pot_size").innerHTML = `Pot: £${potsize}`
})
socket.on("Blind", (small,big,potsize)=>{
    if (small.UID === localStorage.getItem("UID")){
        alert("You are small blind: £10")
    }
    else if (big.UID === localStorage.getItem("UID")){
        alert("You are big blind: £20   ")
    }
    document.querySelector(".pot_size").innerHTML = `Pot: £${potsize}`
})
socket.on("winners", (winners) =>{
    winners.forEach((letter)=>{
        showNotification("WINNER!",`noti${letter}`);
    });
    alert(`The winner(s) were: ${winners.join(", ")}`);
})
socket.on("Show winnings", (winnings) =>{
    if (winnings > 0){
        alert(`You won £${winnings}`)
    }
    else if (winnings < 0){
        alert(`You lost £${winnings}`);
    }
    else{
        alert("You did not loose or make money");
    }
    ingame = false;
})
socket.on("game starting", () =>{
    showNotification('Game starting...', 'noti');
    document.querySelector(".pot_container").style.visibility = 'visible';
})
let ingame = false;
let globalcall;
let globalstack;
let globalbetoffset;
socket.on("get player decision", (stack,callamount,playeralreadycalled) => {
    globalcall = callamount
    globalstack = stack
    globalbetoffset = playeralreadycalled;
    if (stack<= globalcall){
        document.querySelector(".bet_container").style.visibility = "visible";
        document.querySelector(".fold_btn").style.visibility = "visible";
        document.getElementById("bet_input").style.visibility = "hidden";
        document.querySelector(".confirm_bet_btn").style.visibility = "hidden";
        document.querySelector(".stack").innerHTML = `You can only fold or go all in (Stack £${stack},callamount:${globalcall})`;
    }
    else{
    document.querySelector(".bet_container").style.visibility = "visible";
    document.querySelector(".fold_btn").style.visibility = "visible";
    let bet_input = document.getElementById("bet_input");
    bet_input.setAttribute("max", stack+globalbetoffset);
    bet_input.setAttribute("min", globalcall+globalbetoffset);
    document.querySelector(".stack").innerHTML = `Your stack: £${stack}`;
    document.querySelector(".betting_amount").innerHTML = 'Make a bet';
    }})
function fold(){
    socket.emit("users choice", "fold",0,globalcall);
    choicecompleted();
}
function setbet(){
    const value = parseInt(document.getElementById("bet_input").value)-globalbetoffset;
    socket.emit("users choice","bet",value,globalcall);
    choicecompleted();
}
function all_in(){
    socket.emit("users choice","bet",globalstack,globalcall);
    choicecompleted();
}
function show_value() {
    const value = parseInt(document.getElementById("bet_input").value);
    if (value === 0) { document.querySelector(".betting_amount").innerHTML = 'Check' }
    else if (value === globalcall + globalbetoffset){ document.querySelector(".betting_amount").innerHTML = 'Call' }
    else if (value === globalstack + globalbetoffset){ document.querySelector(".betting_amount").innerHTML = 'All in' }
    else { document.querySelector(".betting_amount").innerHTML = `Raise to: £${value}` };
}
function choicecompleted(){
    document.querySelector(".bet_container").style.visibility = "hidden";
    document.querySelector(".fold_btn").style.visibility = "hidden";
}
socket.on("decision valid", () => {choicecompleted()});
socket.on("page loaded", () => {choicecompleted()});
socket.on("joined room", (roomID,letter,uname) => {
    if (document.querySelector(".room_id_container")){
        document.querySelector(".room_id_container").classList.add('removeID');
        setTimeout(() => {
            document.querySelector(".room_id_container").parentNode.removeChild(document.querySelector(".room_id_container"));  
        },500);
        document.querySelector(".createroom_header").innerHTML = `Room ID: ${roomID}`;
    }
    showNotification(`${uname} joined!`,`noti${letter}`);
    LETTERS = ["A","B","C","D"];
    LETTERS.forEach((playerletter)=>{
        if (LETTERS.indexOf(playerletter) > LETTERS.indexOf(letter)){
            return
        };
        document.querySelectorAll(`.player${playerletter}_card`).forEach((card)=> {
            card.classList.remove("greyscale");
        });
    });
    ingame = true;
})
socket.on("invalid (full) room", ()=>{
    document.querySelector(".roomID").innerHTML = "Full room";
    document.querySelector(".roominput").value = null;    
});
socket.on("invalid room", () =>{
    document.querySelector(".roomID").innerHTML = "Invalid room";
    document.querySelector(".roominput").value = null;
})
socket.on("invalid room params", ()=>{
    document.querySelector(".roomID").innerHTML = "Invalid room settings";
})
document.querySelector(".createroom_button").addEventListener("click", () => {
    const nplayers = Number(document.getElementById("nplayers").value);
    socket.emit("create room",nplayers);
})
function room(event){
    event.preventDefault();
    const roomID = document.querySelector(".roominput").value;
    socket.emit("join room", roomID);
}
function showNotification(text, target) {
    var notification = document.getElementById(target);
    notification.innerHTML = text;
    notification.style.display = 'block';
    setTimeout(function() {
      notification.style.display = 'none';
    }, 3000);
  }
window.addEventListener('beforeunload', function (e) {
    if (ingame){
        e.returnValue = true;
    }
});