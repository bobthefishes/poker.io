socket.on("UID", (UID) =>{
    localStorage.setItem("UID",UID);
});
socket.on("SendUID", () =>{
    socket.emit("ReturnUID",localStorage.getItem("UID"));
});
socket.on("check location", (accountbyUID,UID) =>{
    const pathnames = ["/poker", "/blackjack", "/roulette"];
    console.log(window.location.pathname)
        if (pathnames.includes(window.location.pathname)) {        
            alert("You cannot join a game while not logged in");
            window.location.href = "login";
        };
});
socket.on("logged in", () =>{
    try{
        document.querySelector(".user_login").innerHTML = "LOG OUT"
    }catch{}
})
socket.on("logged out", () => {
    try{
        document.querySelector(".user_login").innerHTML = "LOG IN"
    }catch{}
})