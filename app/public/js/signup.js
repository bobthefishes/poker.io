function create_account() {
    document.querySelector(".invalid").innerHTML = "";
    let username = document.querySelector(".uname").value;
    let password = document.querySelector(".pwd").value;
    let fname = document.querySelector(".fnm").value;
    if (username === null || password === null || fname === null){
        document.querySelector(".invalid").innerHTML = "You have not entered all fields";
    }
    socket.emit("sign up", username,password,fname);
}
socket.on("invalid details", (type) => {
    document.querySelector(".invalid").innerHTML = `Invalid ${type}`
})
socket.on("logged in", () =>{
    if(document.referrer.indexOf(window.location.origin) !== 0 || document.referrer.indexOf("signup")){
        window.location.href = "home";
    }else{
        history.go(-1); 
    }
})