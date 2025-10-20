const totalSeconds = 180;
let seconds = [totalSeconds, totalSeconds, totalSeconds];
let running = [false, false, false];
let lastUpdate = [Date.now(), Date.now(), Date.now()];
let warnings = 0;
let pauseTimers = [false, false, false];

const warningLabel = document.getElementById('warnings');
const timers = document.querySelectorAll('.timer');

// 🔔 Áudio via Oscillator
let audioCtx = null;

document.addEventListener('click', () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    console.log('✅ AudioContext iniciado');
    requestNotificationPermission();
  }
});

// Função beep (fallback)
function playBeep() {
  if (!audioCtx) return;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.4);
}

// 🪟 Notifications API
function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      console.log('🔔 Permissão de notificação:', permission);
    });
  }
}

function sendNotification(message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Timer App', {
      body: message,
      icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827951.png',
      silent: false // para que toque som do sistema
    });
  } else {
    playBeep();
  }
}

// Botões e timers
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
          sendNotification('Falta 1 minuto!');
        } else if (seconds[i] === 0) {
          seconds[i] = totalSeconds;
          warnings++;
          warningLabel.textContent = `Warnings: ${warnings}`;
          updateDisplay(i);
          sendNotification('Tempo esgotado!');
        }
      }
    }
  }
  requestAnimationFrame(updateTimers);
}

updateTimers();
