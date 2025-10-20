const totalSeconds = 180;
let seconds = [totalSeconds, totalSeconds, totalSeconds];
let running = [false, false, false];
let lastUpdate = [Date.now(), Date.now(), Date.now()];
let warnings = 0;
let pauseTimers = [false, false, false];

const warningLabel = document.getElementById('warnings');
const timers = document.querySelectorAll('.timer');

// 🎧 AudioContext para beep local (quando aba está ativa)
let audioCtx = null;

// Inicializa áudio e solicita permissão de notificação
document.addEventListener('click', () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    console.log('✅ AudioContext iniciado');
  }

  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission().then(p => {
      console.log('Permissão de notificação:', p);
    });
  }
});

// 🔔 Beep local — só toca se aba estiver ativa
function playBeep() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
}

// 📨 Notificação com som padrão do Chrome / SO
function sendSystemNotification(message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Timer App', {
      body: message,
      silent: false // ✅ habilita som padrão do sistema
    });
  }
}

// Alerta sonoro (sistema + beep local se aba ativa)
function sendAlert(message) {
  sendSystemNotification(message);
  if (document.visibilityState === 'visible') {
    playBeep();
  }
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

// Atualiza exibição de tempo
function updateDisplay(i) {
  const mins = Math.floor(seconds[i] / 60);
  const secs = seconds[i] % 60;
  timers[i].querySelector('.time').textContent =
    `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Pausa 10 s e retoma
function pauseAndResume(i) {
  pauseTimers[i] = true;
  setTimeout(() => {
    pauseTimers[i] = false;
    running[i] = true;
    lastUpdate[i] = Date.now();
  }, 10000);
}

// Loop principal dos timers
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
