const totalSeconds = 180;
let seconds = [totalSeconds, totalSeconds, totalSeconds];
let running = [false, false, false];
let lastUpdate = [Date.now(), Date.now(), Date.now()];
let warnings = 0;
let pauseTimers = [false, false, false];

const warningLabel = document.getElementById('warnings');
const timers = document.querySelectorAll('.timer');

// Variáveis para áudio
let audioCtx;
let bellBuffer = null;

// Carregar o som para dentro de um buffer
async function loadBellSound() {
  const response = await fetch('bell.wav');
  const arrayBuffer = await response.arrayBuffer();
  bellBuffer = await audioCtx.decodeAudioData(arrayBuffer);
}

// Reproduzir o som usando o AudioContext
function playBell() {
  if (!bellBuffer || !audioCtx) return;
  const source = audioCtx.createBufferSource();
  source.buffer = bellBuffer;
  source.connect(audioCtx.destination);
  source.start();
}

// Inicializar o AudioContext na primeira interação do usuário
document.addEventListener('click', async () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    await loadBellSound();
    console.log('AudioContext inicializado e bell.wav carregado ✅');
  }
});

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
    pauseAndResume(i);
  });

  msgBtn.addEventListener('click', () => {
    running[i] = false;
    seconds[i] = totalSeconds;
    updateDisplay(i);
    pauseAndResume(i);
  });

  updateDisplay(i);
});

function updateDisplay(i) {
  const mins = Math.floor(seconds[i] / 60);
  const secs = seconds[i] % 60;
  timers[i].querySelector('.time').textContent =
    `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function pauseAndResume(i) {
  pauseTimers[i] = true;
  setTimeout(() => {
    pauseTimers[i] = false;
    running[i] = true;
    lastUpdate[i] = Date.now();
  }, 10000);
}

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
          playBell(); // ✅ tocar via AudioContext
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
