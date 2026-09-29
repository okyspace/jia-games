// Healthy-use reminders while the app is open:
//  - every 20 min of use: sit up straight (small banner)
//  - every 30 min of use: 2:30 break screen with a countdown; the open game is paused. The kid
//    picks: move & look far, quick maths, science, history, relax music, or eye exercise
//    (every 2nd break starts with the eye exercise) - see break-activities.js
//  - after 1 hour of continuous use: longer break screen - go and do something else
//  - weekdays from 8:30pm: bedtime routine - pack bag, brush teeth, shower
// "Use" only counts while the app is on screen. Being away for 10+ minutes starts a new session.
// The Android app also posts a bedtime notification when the app is closed (BedtimeReminder.kt).
import { el, local, sfx } from './kit.js';
import { askGrownUp } from './ui.js';
import { postToPage } from './launcher.js';
import { mountBreakActivities } from './break-activities.js';

export const WELLBEING = {
  postureEveryMinutes: 20,
  breakEveryMinutes: 30,
  breakSeconds: 150,
  eyeExerciseEveryNthBreak: 2,
  longBreakAfterMinutes: 60,
  longBreakSeconds: 300,
  newSessionAfterAwayMinutes: 10,
  // Keep in sync with BedtimeReminder.kt
  bedtime: { hour: 20, minute: 30, days: [1, 2, 3, 4, 5] }, // Mon–Fri (0 = Sunday)
};

const MAX_TICK_SECONDS = 5; // bigger gaps mean the app was asleep/hidden: don't count them

let state;
let lastTick = null;
let breakScreen = null;
let banner = null;

function load() {
  const saved = local.get('wellbeing', { activeSeconds: 0, lastSeen: 0, bedtimeShownOn: null });
  if (Date.now() - saved.lastSeen > WELLBEING.newSessionAfterAwayMinutes * 60_000) saved.activeSeconds = 0;
  return saved;
}

function save() {
  state.lastSeen = Date.now();
  local.set('wellbeing', state);
}

export function isBreakShowing() {
  return breakScreen !== null;
}

/** Minutes of continuous use so far (for display/tests). */
export function activeMinutes() {
  return Math.floor((state?.activeSeconds || 0) / 60);
}

function crossed(before, after, everyMinutes) {
  const step = everyMinutes * 60;
  return Math.floor(before / step) < Math.floor(after / step);
}

function tick() {
  const now = Date.now();
  const seconds = lastTick === null ? 0 : (now - lastTick) / 1000;
  lastTick = now;

  if (document.hidden) return; // lastSeen stays at when the kid left
  if (seconds > WELLBEING.newSessionAfterAwayMinutes * 60) state.activeSeconds = 0;
  checkBedtime(new Date(now));
  if (breakScreen || seconds <= 0 || seconds > MAX_TICK_SECONDS) {
    save();
    return;
  }

  const before = state.activeSeconds;
  state.activeSeconds += seconds;
  const after = state.activeSeconds;
  save();

  if (crossed(before, after, WELLBEING.longBreakAfterMinutes)) {
    showBreak({
      kind: 'long',
      emoji: '🌈',
      title: 'Wow, 1 hour of play!',
      text: 'Time to give your eyes and body a rest. Go and do something else for a while:',
      tips: ['📖 Read a book', '⚽ Play outside or move around', '🧩 Build, draw or play with toys', '🤝 Help at home'],
      seconds: WELLBEING.longBreakSeconds,
    });
  } else if (crossed(before, after, WELLBEING.breakEveryMinutes)) {
    state.breakCount = (state.breakCount || 0) + 1;
    save();
    const eyes = state.breakCount % WELLBEING.eyeExerciseEveryNthBreak === 0;
    showBreak({
      kind: 'break',
      emoji: eyes ? '👀' : '🌳',
      title: 'Break time!',
      text: eyes ? 'Your game is paused. Time to rest your eyes!' : 'Your game is paused until the clock reaches 0:00.',
      activities: eyes ? 'eyes' : 'choose',
      seconds: WELLBEING.breakSeconds,
    });
  } else if (crossed(before, after, WELLBEING.postureEveryMinutes)) {
    showPosture();
  }
}

function showPosture() {
  banner?.remove();
  sfx.tap();
  banner = el('div.wellbeing-banner.bounce-in', { role: 'status' },
    el('span.wb-emoji', { 'aria-hidden': 'true' }, '🪑'),
    el('div', {},
      el('strong', {}, 'Sit up straight!'),
      el('div', {}, 'Back straight, feet on the floor, screen an arm away.')),
    el('button.btn.small.white', { onclick: () => { banner?.remove(); banner = null; } }, 'OK 👍'));
  document.body.append(banner);
  const mine = banner;
  setTimeout(() => { if (banner === mine) { banner.remove(); banner = null; } }, 20_000);
}

function showBreak({ kind, emoji, title, text, tips = [], activities = null, seconds }) {
  postToPage({ type: 'jia:pause' });
  sfx.win();
  const endsAt = Date.now() + seconds * 1000;
  const clock = el('div.break-clock', { 'aria-live': 'polite' });
  const done = el('button.btn.leaf', { disabled: true }, 'Back to fun ▶');
  const activityBox = el('div.break-activities');
  const stopActivity = activities
    ? mountBreakActivities(activityBox, { startWith: activities === 'choose' ? null : activities })
    : () => {};
  const finish = () => {
    clearInterval(timer);
    stopActivity();
    breakScreen?.remove();
    breakScreen = null;
    lastTick = Date.now();
    postToPage({ type: 'jia:resume' });
  };
  done.addEventListener('click', finish);
  const update = () => {
    const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    clock.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    if (left === 0 && done.disabled) {
      done.disabled = false;
      sfx.good();
    }
  };
  const timer = setInterval(update, 250);
  update();

  breakScreen = el('div.break-screen', { role: 'dialog', 'aria-modal': 'true', 'aria-label': title, 'data-kind': kind },
    el('div.card.bounce-in', {},
      el('div.big-emoji', { 'aria-hidden': 'true' }, emoji),
      el('h2', {}, title),
      el('p', {}, text),
      tips.length ? el('ul.break-tips', {}, tips.map((t) => el('li', {}, t))) : null,
      clock,
      activityBox,
      done,
      el('button.link-btn', {
        onclick: async () => { if (await askGrownUp('Grown-ups can end the break early.')) finish(); },
      }, 'Grown-ups: end break')));
  document.body.append(breakScreen);
}

function checkBedtime(now) {
  const { hour, minute, days } = WELLBEING.bedtime;
  const today = now.toDateString();
  if (state.bedtimeShownOn === today || !days.includes(now.getDay())) return;
  if (now.getHours() * 60 + now.getMinutes() < hour * 60 + minute) return;
  state.bedtimeShownOn = today;
  save();
  showBedtime();
}

function showBedtime() {
  sfx.good();
  const items = ['🎒 Pack my school bag for tomorrow', '🪥 Brush my teeth', '🚿 Take a shower (if not done yet)'];
  const boxes = items.map(() => el('input', { type: 'checkbox' }));
  const sheet = el('div.break-screen.bedtime', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Bedtime routine' },
    el('div.card.bounce-in', {},
      el('div.big-emoji', { 'aria-hidden': 'true' }, '🌙'),
      el('h2', {}, "It's 8:30pm!"),
      el('p', {}, 'Time to get ready for tomorrow:'),
      el('div.stack.checklist', {}, items.map((item, i) => el('label', {}, boxes[i], item))),
      el('div', { style: { height: '14px' } }),
      el('button.btn.grape.block', { onclick: () => sheet.remove() }, 'Okay! Good night soon 🌙')));
  document.body.append(sheet);
}

export function startWellbeing() {
  state = load();
  save();
  lastTick = Date.now();
  setInterval(tick, 1000);
  // Escape must not close the game underneath a break screen.
  window.addEventListener('keydown', (event) => {
    if (breakScreen && event.key === 'Escape') event.stopImmediatePropagation();
  }, true);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    // Back in the app: a long enough time away was a real break.
    if (Date.now() - state.lastSeen > WELLBEING.newSessionAfterAwayMinutes * 60_000) state.activeSeconds = 0;
    lastTick = Date.now();
  });
  checkBedtime(new Date());
}
