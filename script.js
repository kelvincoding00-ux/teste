const totalSeconds = 180;
let seconds = [totalSeconds, totalSeconds, totalSeconds];
let running = [false, false, false];
let lastUpdate = [Date.now(), Date.now(), Date.now()];
let warnings = 0;
let pauseTimers = [false, false, false]; // NOVO

const warningLabel = document.getElementById('warnings');
const bellSound = document.getElementById('bell');
const timers = document.querySelectorAll('.timer');

timers.forEach((timer, i) => {
  const timeDisplay = timer.querySelector('.time');
  const startBtn = timer.querySelector('.start-btn');
  const endBtn = timer.querySelector('.end-btn');
  const msgBtn = timer.querySelector('.message-btn');

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
    pauseAndResume(i); // pausa 10 segundos e retoma
  });

  msgBtn.addEventListener('click', () => {
    running[i] = false;
    seconds[i] = totalSeconds;
    updateDisplay(i);
    pauseAndResume(i); // pausa 10 segundos e retoma
  });

  updateDisplay(i);
});

function updateDisplay(i) {
  const mins = Math.floor(seconds[i] / 60);
  const secs = seconds[i] % 60;
  timers[i].querySelector('.time').textContent =
    `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

function pauseAndResume(i) {
  pauseTimers[i] = true;
  setTimeout(() => {
    pauseTimers[i] = false;
    running[i] = true;
    lastUpdate[i] = Date.now();
  }, 10000); // 10 segundos
}

// manter o AudioContext ativo mesmo em background
let audioCtx;
document.addEventListener('click', () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(bellSound);
    source.connect(audioCtx.destination);
  }
});

function updateTimers() {
  const now = Date.now();
  for (let i = 0; i < 3; i++) {
    if (running[i] && !pauseTimers[i]) {
      const elapsed = Math.floor((now - lastUpdate[i]) / 1000);
      if (elapsed >= 1) {
        seconds[i] = Math.max(0, seconds[i] - elapsed);
        lastUpdate[i] = now;
        updateDisplay(i);

        if (seconds[i] === 60) {
          bellSound.currentTime = 0;
          bellSound.play().catch(() => {});
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
