socket.on("UID", (UID) =>{
    localStorage.setItem("UID",UID);
});
socket.on("SendUID", () =>{
    socket.emit("ReturnUID",localStorage.getItem("UID"));
});
socket.on("send location", () =>{
    socket.emit("window location", window.location.href);
})
socket.on("redirect", (location) =>{
    alert("You cannot join a game while not logged in");
    window.location.href = location;
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