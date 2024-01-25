const table = document.querySelector('.main_table');

async function getData() {
  return new Promise((resolve, reject) => {
    socket.emit("return player winnings");
    socket.on("player winnings", (winnings) => {
      resolve(winnings);
    });
  });
}

async function displayBoard() {
  try {
    const leaderBoard = await getData();
    console.log(leaderBoard);
    const sortedLeaderBoard = leaderBoard.sort((a, b) => b[1] - a[1]);
    sortedLeaderBoard.forEach(player => {
      var row = table.insertRow(-1);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);

      cell1.innerHTML = player[0];
      cell2.innerHTML = player[1];
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}
