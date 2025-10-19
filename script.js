const totalSeconds = 180;
let seconds = [totalSeconds, totalSeconds, totalSeconds];
let running = [false, false, false];
let lastUpdate = [Date.now(), Date.now(), Date.now()];
let warnings = 0;

const warningLabel = document.getElementById('warnings');
const bellSound = document.getElementById('bell');

const timers = document.querySelectorAll('.timer');

timers.forEach((timer, i) => {
  const timeDisplay = timer.querySelector('.time');
  const startBtn = timer.querySelector('.start-btn');
  const endBtn = timer.querySelector('.end-btn');

  startBtn.addEventListener('click', () => {
    if (!running[i]) {
      running[i] = true;
      lastUpdate[i] = Date.now();
    }
  });

  endBtn.addEventListener('click', () => {
    running[i] = false;
    seconds[i] = totalSeconds;
    updateDisplay(i);
  });

  updateDisplay(i);
});

function updateDisplay(i) {
  const mins = Math.floor(seconds[i] / 60);
  const secs = seconds[i] % 60;
  timers[i].querySelector('.time').textContent = 
    `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

function updateTimers() {
  const now = Date.now();
  for (let i = 0; i < 3; i++) {
    if (running[i]) {
      const elapsed = Math.floor((now - lastUpdate[i]) / 1000);
      if (elapsed >= 1) {
        seconds[i] = Math.max(0, seconds[i] - elapsed);
        lastUpdate[i] = now;
        updateDisplay(i);

        if (seconds[i] === 60) {
          bellSound.play().catch(() => {}); // play sound
        } else if (seconds[i] === 0) {
          seconds[i] = totalSeconds;
          warnings++;
          warningLabel.textContent = `Warnings: ${warnings}`;
          updateDisplay(i);
        }
      }
    }
  }
  requestAnimationFrame(updateTimers);
}

updateTimers();
