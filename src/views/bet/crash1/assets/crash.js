const socket = io();
const multiplierEl = document.getElementById('multiplier');
const cashoutBtn = document.getElementById('cashoutBtn');
let currentMultiplier = 1.00;
let interval;

socket.on('crashMultiplier', (mult) => {
  multiplierEl.textContent = mult.toFixed(2) + 'x';
  currentMultiplier = mult;
});

socket.on('crashEnd', (crashAt) => {
  cashoutBtn.disabled = true;
  alert('Crash di ' + crashAt.toFixed(2) + 'x');
  clearInterval(interval);
});

// Contoh: tombol cashout
cashoutBtn.onclick = () => {
  socket.emit('crashCashout', { multiplier: currentMultiplier });
  cashoutBtn.disabled = true;
};