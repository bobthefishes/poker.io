function submit_creds() {
    document.querySelector(".invalid").innerHTML = "";
    let username = document.querySelector(".uname").value;
    let password = document.querySelector(".pwd").value;
    socket.emit("log in",username,password);
}
socket.on("invalid details", (type) => {
    document.querySelector(".invalid").innerHTML = `Invalid ${type}`
})
socket.on("logged in", () =>{
    if(document.referrer.indexOf(window.location.origin) !== 0){
        window.location.href = "home";
    }else{
        history.go(-1); 
    }
})