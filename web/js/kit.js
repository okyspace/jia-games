// Small helpers shared by the app shell, games and challenge pages.

/** Create an element: el('button.btn.pink', {onclick}, 'Hi', childEl) */
export function el(spec, props = {}, ...children) {
  const [tag, ...classes] = spec.split('.');
  const node = document.createElement(tag || 'div');
  if (classes.length) node.className = classes.join(' ');
  for (const [key, value] of Object.entries(props || {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
    else if (key === 'style' && typeof value === 'object') {
      for (const [prop, v] of Object.entries(value)) {
        if (prop.startsWith('--')) node.style.setProperty(prop, v);
        else node.style[prop] = v;
      }
    }
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key in node && typeof value !== 'string') node[key] = value;
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** JSON in localStorage, namespaced with "jia." and safe when storage is unavailable. */
export const local = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem('jia.' + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem('jia.' + key, JSON.stringify(value));
    } catch {
      /* storage full or blocked: keep playing */
    }
  },
};

export function confetti(emojis = ['⭐', '🎉', '🌟', '🎈', '✨'], count = 28) {
  for (let i = 0; i < count; i++) {
    const bit = document.createElement('div');
    bit.className = 'confetti-bit';
    bit.textContent = emojis[i % emojis.length];
    bit.style.left = Math.random() * 100 + 'vw';
    bit.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
    bit.style.animationDelay = Math.random() * 0.4 + 's';
    document.body.append(bit);
    setTimeout(() => bit.remove(), 3800);
  }
}

let audioCtx;
function tone(freq, duration, type = 'sine', delay = 0, volume = 0.12) {
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + duration);
  } catch {
    /* no audio available */
  }
}

export const sfx = {
  good() { tone(660, 0.12, 'triangle'); tone(880, 0.16, 'triangle', 0.08); },
  bad() { tone(180, 0.22, 'square', 0, 0.06); },
  tap() { tone(520, 0.06, 'triangle', 0, 0.08); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', i * 0.12)); },
};

/** Show a message overlay with buttons. Returns the overlay element. */
export function showOverlay({ emoji, title, text, actions = [] }) {
  const overlay = el('div.overlay', { role: 'dialog', 'aria-modal': 'true' },
    el('div.card.bounce-in',
      {},
      emoji ? el('div.big-emoji', {}, emoji) : null,
      el('h2', {}, title),
      text ? el('p', {}, text) : null,
      el('div.actions', {}, actions.map(({ label, className = '', onClick }) =>
        el('button.btn' + (className ? '.' + className : ''), {
          onclick: () => { overlay.remove(); onClick?.(); },
        }, label))),
    ));
  document.body.append(overlay);
  overlay.querySelector('button')?.focus();
  return overlay;
}

/** Called by a challenge page when the kid has finished it. The app shell awards the stars. */
export function reportChallengeComplete(challengeId, details = {}) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'jia:challenge-complete', challengeId, details }, location.origin);
  }
}

// ---------- Pause support for games ----------
// During a break the app sends {type: 'jia:pause'} / {type: 'jia:resume'} to the open game.
// Games should use gameNow() instead of Date.now() for their clocks, so paused time doesn't count.
let pausedAt = null;
let pausedTotal = 0;

export function gameNow() {
  return Date.now() - pausedTotal - (pausedAt === null ? 0 : Date.now() - pausedAt);
}

export function isPaused() {
  return pausedAt !== null;
}

window.addEventListener('message', (event) => {
  if (event.origin !== location.origin || event.source !== window.parent) return;
  if (event.data?.type === 'jia:pause' && pausedAt === null) pausedAt = Date.now();
  if (event.data?.type === 'jia:resume' && pausedAt !== null) {
    pausedTotal += Date.now() - pausedAt;
    pausedAt = null;
  }
});

// Ignore keyboard input while paused (taps are already blocked by the break screen).
window.addEventListener('keydown', (event) => {
  if (pausedAt !== null) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}, true);

export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
