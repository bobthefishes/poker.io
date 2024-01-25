const table = document.querySelector('.main_table');
async function getData() {
  socket.emit("return player winnings");
  return new Promise((resolve, reject) => {
      socket.on("player winnings", (winnings)=>{
        resolve(winnings);
      });
  });
}