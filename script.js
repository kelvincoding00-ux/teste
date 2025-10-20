const totalSeconds = 180;
let seconds = [totalSeconds, totalSeconds, totalSeconds];
let running = [false, false, false];
let lastUpdate = [Date.now(), Date.now(), Date.now()];
let warnings = 0;
let pauseTimers = [false, false, false];

const warningLabel = document.getElementById('warnings');
const timers = document.querySelectorAll('.timer');

// 🔊 AudioContext global
let audioCtx = null;

// Inicializa áudio e notificação na primeira interação
document.addEventListener('click', async () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    await audioCtx.resume();
    console.log('✅ AudioContext ativo');
  }

  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
});

// 🔔 Beep mesmo em segundo plano
async function playBeep() {
  if (!audioCtx) return;
  await audioCtx.resume(); // força retomar mesmo se a aba estiver em segundo plano

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}

// Notificação visual (sem depender de som do Chrome)
function sendNotification(message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Timer App', {
      body: message,
      silent: true // ⚠️ Chrome ignora som, então deixamos silent e usamos nosso beep
    });
  }
}

// Envia alerta com beep garantido
function sendAlert(message) {
  sendNotification(message);
  playBeep(); // toca sempre, mesmo em background
}

// Configuração dos botões
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
          sendAlert('Falta 1 minuto!');
        } else if (seconds[i] === 0) {
          seconds[i] = totalSeconds;
          warnings++;
          warningLabel.textContent = `Warnings: ${warnings}`;
          updateDisplay(i);
          sendAlert('Tempo esgotado!');
        }
      }
    }
  }
  requestAnimationFrame(updateTimers);
}

updateTimers();
