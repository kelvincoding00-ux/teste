const totalSeconds = 180;
let seconds = [totalSeconds, totalSeconds, totalSeconds];
let running = [false, false, false];
let lastUpdate = [Date.now(), Date.now(), Date.now()];
let warnings = 0;
let pauseTimers = [false, false, false];

const warningLabel = document.getElementById('warnings');
const timers = document.querySelectorAll('.timer');

// 🎧 Variáveis para áudio
let audioCtx = null;

// 🧭 Inicializa o AudioContext na primeira interação
document.addEventListener('click', () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    console.log('✅ AudioContext inicializado');
  }
});

// 🔔 Função para tocar um beep curto
function playBeep() {
  if (!audioCtx) return; // ainda não foi inicializado
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';       // tipo do som (pode trocar para 'square', 'sawtooth', etc.)
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // frequência em Hz (880 = tom agudo)

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // volume inicial
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4); // fade out

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.4); // beep de 0.4s
}

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

// ⏸️ Pausa 10s e depois retoma
function pauseAndResume(i) {
  pauseTimers[i] = true;
  setTimeout(() => {
    pauseTimers[i] = false;
    running[i] = true;
    lastUpdate[i] = Date.now();
  }, 10000);
}

// ⏳ Loop dos timers
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
          playBeep(); // 🔔 toca beep de 0.4s
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
