function updateWheelSize() {
  const wheel = document.getElementById('roulette_wheel');
  const betting_container = document.getElementById('betting_container');
  const pointer = document.querySelector('.pointer');
    function updateWheelSize(wwidth,whight,wtop,pleft,ptop,bright,bwidth){
      wheel.style.width = `${wwidth}px`;
      wheel.style.height = `${whight}px`;
      wheel.style.top = `${wtop}px`;
      pointer.style.left = `${pleft}px`;
      pointer.style.top = `${ptop}px`;
      betting_container.style.right = `${bright}%`;
      betting_container.style.width = `${bwidth}px`;      
    }
    const windowW = window.innerWidth;
    if (windowW < 830) {updateWheelSize(300,300,220,0.075*windowW+143.25,203,5,200)}
    else if (windowW < 1000) {updateWheelSize(450,450,220,0.075*windowW+218.25,203,10,200)}
    else if (windowW < 1200) {updateWheelSize(450,450,220,0.075*windowW+218.25,203,10,350)} 
    else if (windowW < 1300) {updateWheelSize(450,450,220,0.075*windowW+218.25,203,12.5,350)} 
    else if (windowW < 1600) {updateWheelSize(600,600,220,0.075*windowW+293.25,203,12.5,350)}
    else {updateWheelSize(650,650,200,0.075*windowW+318.25,183,10,400)}
}
window.addEventListener('resize', updateWheelSize);

let stack = 5000;
let bet_inputs = document.querySelectorAll('.bet_input');

window.onload = function () {
  document.querySelector(".stack").innerHTML = `Your stack: £${stack}`;
  document.querySelectorAll('.betting_amount').forEach(x => {
    x.innerHTML = 'Your bet: £';
  });
  updateWheelSize();
  bet_inputs.forEach(x => {
    x.min = '0';
  });
}
let total_r = 0;
let not_spinning = true;

function spinWheel() {
  if (not_spinning) {  
    let total_bet = 0;
    let bets = [];
    bet_inputs.forEach(x => {
      bets.push(x.value);
      total_bet += parseInt(x.value);
    });
    console.log(total_bet, bets);

    if (total_bet <= stack) {
      document.querySelector('.stack').innerHTML = `Your stack: £${stack}`;
      const max = 1860;
      const min = 1500;
      const rotation = Math.trunc(Math.floor(Math.random() * (max - min + 1)) + min);
      total_r += rotation;
      document.querySelector('.wheel').style.transform = `rotate(${total_r}deg)`;

      find_slot(total_r);

      stack -= total_bet;

      //wait 4s so the stack updates after the spin, not before the spin finishes.
      not_spinning = false;
      setTimeout(updateStack, 4000)
      function updateStack() {
        if (outcome['number']%2 === 0) {
          stack += parseInt(bets[2]) * 2;
        } else {
          stack += parseInt(bets[3]) * 2;
        };
        if (outcome['color'] === 'red') {
          stack += parseInt(bets[0]) * 2;
        } else if (outcome['color'] === 'black') {
          stack += parseInt(bets[1]) * 2;
        };
        document.querySelector('.stack').innerHTML = `Your stack: ${stack}`;
        change_max_bets();
        not_spinning = true;
    }
    } else {
      showNotification("Bet is too high...");
    }
  }

  function change_max_bets() {
    max_bet = stack;
    bet_inputs.forEach(x => {
      x.max = `${max_bet}`;
      x.min = '0';
      if (stack === 0) {
        const spin_btn = document.querySelector('.spin_btn');
        spin_btn.disabled = true;
        spin_btn.innerHTML = 'Your stack is empty...';
        spin_btn.style.backgroundColor = 'red';
        spin_btn.style.boxShadow = 'none';
        spin_btn.style.color = 'white';
      }
    })
    show_value('red'); show_value('black'); show_value('even'); show_value('odd');
  }
}

let degrees_per_segment = 9.72972972972972972972972972972972972972972972972972972973;
let slots = [
  { number: 0, color: 'green', index: 0 },
  { number: 32, color: 'red', index: 1 },
  { number: 15, color: 'black', index: 2 },
  { number: 19, color: 'red', index: 3 },
  { number: 4, color: 'black', index: 4 },
  { number: 21, color: 'red', index: 5 },
  { number: 2, color: 'black', index: 6 },
  { number: 25, color: 'red', index: 7 },
  { number: 17, color: 'black', index: 8 },
  { number: 34, color: 'red', index: 9 },
  { number: 6, color: 'black', index: 10 },
  { number: 27, color: 'red', index: 11 },
  { number: 13, color: 'black', index: 12 },
  { number: 36, color: 'red', index: 13 },
  { number: 11, color: 'black', index: 14 },
  { number: 30, color: 'red', index: 15 },
  { number: 8, color: 'black', index: 16 },
  { number: 23, color: 'red', index: 17 },
  { number: 10, color: 'black', index: 18 },
  { number: 5, color: 'red', index: 19 },
  { number: 24, color: 'black', index: 20 },
  { number: 16, color: 'red', index: 21 },
  { number: 33, color: 'black', index: 22 },
  { number: 1, color: 'red', index: 23 },
  { number: 20, color: 'black', index: 24 },
  { number: 14, color: 'red', index: 25 },
  { number: 31, color: 'black', index: 26 },
  { number: 9, color: 'red', index: 27 },
  { number: 22, color: 'black', index: 28 },
  { number: 18, color: 'red', index: 29 },
  { number: 29, color: 'black', index: 30 },
  { number: 7, color: 'red', index: 31 },
  { number: 28, color: 'black', index: 32 },
  { number: 12, color: 'red', index: 33 },
  { number: 35, color: 'black', index: 34 },
  { number: 3, color: 'red', index: 35 },
  { number: 26, color: 'black', index: 36 }
];

let outcome;
function find_slot(deg) {
  console.log(deg);
  deg = deg % 360;
  var index = deg / degrees_per_segment;
  index = Math.round(index);
  console.log(index);
  if (index!=0 && index!=36) {
    index = 37 - index;
  }
  outcome = slots[index];
  console.log(outcome);
}

function show_value(arg) {
  const value = parseInt(document.getElementById(`bet_input_${arg}`).value);
  document.getElementById(`betting_amount_${arg}`).innerHTML = `Your bet is: £${value}`;
}

function showNotification(text) {
  var notification = document.getElementById('notification');
  notification.innerHTML = text;
  notification.style.display = 'block';

  setTimeout(function() {
    notification.style.display = 'none';
  }, 3000);
}