socket.on("UID", (UID) =>{
    localStorage.setItem("UID",UID);
});
socket.on("SendUID", () =>{
    socket.emit("ReturnUID",localStorage.getItem("UID"));
});
socket.on("check location", () => {
    if (window.location.pathname === "/poker"){
        alert("You must be logged in to play");
        window.location.href = "login";
    }
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