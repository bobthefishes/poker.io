socket.on("UID", (UID) =>{
    localStorage.setItem("UID",UID);
});
socket.on("SendUID", () =>{
    socket.emit("ReturnUID",localStorage.getItem("UID"));
});
socket.on("check location", (accountbyUID,UID) =>{
    const location = window.location.href;
    if (location === "http://localhost:8000/poker"){
        if (!accountbyUID[UID]){
            alert("You cannot join a game while not logged in");
            window.location.href = "http://localhost:8000/login";
        }
    }
})
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