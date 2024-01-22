socket.on("UID", (UID) =>{
    localStorage.setItem("UID",UID);
});
socket.on("SendUID", () =>{
    socket.emit("ReturnUID",localStorage.getItem("UID"));
});
socket.on("check location", (accountbyUID,UID) =>{
    const pathnames = ["/poker", "/blackjack", "/roulette"];
        if (pathnames.includes(window.location.pathname)) {        
            alert("You cannot join a game while not logged in");
            window.location.href = "login";
        };
});
socket.on("querylocation", ()=>{
    socket.emit("locationanswer", window.location.pathname);
})
socket.on("reloadpage", ()=>{
    window.location.reload();
});
socket.on("message", (message)=>{
    alert(message);
})
socket.on("logged in", (stack) =>{
    try{
        document.querySelector(".user_login").innerHTML = "LOG OUT";
        document.querySelector(".playerearnings").innerHTML = `£${stack}`;
        document.querySelector(".playerearnings").removeAttribute("href");
    }catch{}
});
function login(){
    if (document.querySelector(".user_login").innerHTML === "LOG OUT"){
      socket.emit("log out")
    }else{
        window.location.href = "login";
    }
}