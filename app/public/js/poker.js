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
function resetactiontext(){
    document.querySelector(".playeractionA").innerHTML = "PlayerA";
    document.querySelector(".playeractionB").innerHTML = "PlayerB";
    document.querySelector(".playeractionC").innerHTML = "PlayerC";
    document.querySelector(".playeractionD").innerHTML = "PlayerD";
}
socket.on("flop", (dealtcards) => {
    dealcards(".flop",dealtcards);
    resetactiontext();
})
socket.on("turn", (dealtcards) => {
    dealcards(".turn",[dealtcards]);
    resetactiontext();
})
socket.on("river", (dealtcards) => {
    dealcards(".river",[dealtcards]);
    resetactiontext();
})
socket.on("show cards", (playera,playerb,playerc,playerd)=>{
    dealcards(".playerA_card",playera);
    dealcards(".playerB_card",playerb);
    dealcards(".playerC_card",playerc);
    dealcards(".playerD_card",playerd);
})
socket.on("show player decision", (letter,action,uname,potsize) =>{
    const decisionblock = document.querySelector(`.playeraction${letter}`);
    if (action[0] === "fold"){
        showNotification(`${uname}: Fold`, `noti${letter}`)
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
    socket.emit("gamewinnings", (winnings));
})
socket.on("game starting", () =>{
    chatmessage("The game is now starting");
    showNotification('Game starting...', 'noti');
    document.querySelectorAll(".card").classList.remove('greyscale');
    document.querySelector(".pot_container").style.visibility = 'visible';
})

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
window.onload = () => {choicecompleted()}
/*Rooms */
socket.on("joined room", (roomID,letter,uname) => {
    document.querySelector(".room_id_container").classList.add('removeID');
    document.querySelector(".createroom_header").innerHTML = `Room ID: ${roomID}`;
    showNotification(`${uname} joined!`,`noti${letter}`);
})
socket.on("invalid room", () =>{
    document.querySelector(".roomID").innerHTML = "Invalid room";
    document.querySelector(".roominput").value = null;
})
document.querySelector(".createroom_button").addEventListener("click", () => {
    socket.emit("create room");
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