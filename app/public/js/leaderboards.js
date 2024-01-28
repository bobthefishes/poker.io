async function getData() {
  return new Promise((resolve, reject) => {
    socket.emit("return player winnings");
    socket.on("player winnings", (winnings) => {
      resolve(winnings);
    });
  });
}
async function refreshboard(){
  try{
    const table = document.querySelector('.main_table');
    table.innerHTML = '<tr class="headers"><th class="name_h">USERNAME</th><th class="winnings_h">WINNINGS (£)</th></tr>';
    await displayBoard();
  }
  catch(error){
    console.error(error.message);
  }
}
async function displayBoard() {
  try {
    const table = document.querySelector('.main_table');
    const leaderBoard = await getData();
    const sortedLeaderBoard = leaderBoard.sort((a, b) => b[1] - a[1]);
    sortedLeaderBoard.forEach(player => {
      var row = table.insertRow(-1);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      cell1.innerHTML = player[0];
      cell2.innerHTML = player[1];
      if (player[2] == localStorage.getItem("UID")){
        row.style.color = "red";
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}
socket.on("page loaded", ()=>{
  displayBoard();
})