// Key Hero: learn where the keys are on a keyboard, row by row.
// Works with a real keyboard or by tapping the on-screen keyboard.
import { el, local, sfx, confetti, showOverlay, shuffle, gameNow } from '../../js/kit.js';

const ROWS = ['1234567890', 'qwertyuiop', 'asdfghjkl;', 'zxcvbnm,.'];

// Which finger presses each key (touch typing), with a colour per finger.
const FINGERS = {
  'left pinky': { color: '#FFC9DE', keys: '1qaz' },
  'left ring': { color: '#FFE0B8', keys: '2wsx' },
  'left middle': { color: '#FFF3A3', keys: '3edc' },
  'left pointer': { color: '#D4F7C5', keys: '45rtfgvb' },
  'right pointer': { color: '#C9ECFF', keys: '67yuhjnm' },
  'right middle': { color: '#E5DBFF', keys: '8ik,' },
  'right ring': { color: '#FFD6D6', keys: '9ol.' },
  'right pinky': { color: '#D8F3EE', keys: '0p;' },
};
const fingerOf = (key) => Object.entries(FINGERS).find(([, f]) => f.keys.includes(key));

const WORDS = ['cat', 'dog', 'sun', 'fish', 'jump', 'play', 'star', 'book', 'tree', 'milk', 'frog', 'cake', 'rain', 'moon', 'duck', 'kite', 'lion', 'hat', 'red', 'blue'];

export const LEVELS = [
  { id: 'home', title: 'Home row', emoji: '🏠', keys: 'fjdksla;', count: 20, tip: 'Rest your pointer fingers on F and J. Feel the little bumps!' },
  { id: 'home-plus', title: 'Home row +', emoji: '🏡', keys: 'asdfghjkl;', count: 20, tip: 'G and H are pressed by your pointer fingers.' },
  { id: 'top', title: 'Top row', emoji: '⬆️', keys: 'qwertyuiop', count: 20, tip: 'Reach up, then go back home.' },
  { id: 'bottom', title: 'Bottom row', emoji: '⬇️', keys: 'zxcvbnm', count: 20, tip: 'Reach down, then go back home.' },
  { id: 'numbers', title: 'Numbers', emoji: '🔢', keys: '1234567890', count: 20, tip: 'Numbers are far up. Take your time!' },
  { id: 'letters', title: 'All letters', emoji: '🔤', keys: 'abcdefghijklmnopqrstuvwxyz', count: 26, tip: 'Mix it up!' },
  { id: 'words', title: 'Words', emoji: '📝', words: true, count: 10, tip: 'Type the whole word, one letter at a time.' },
];

const root = document.getElementById('game');
let state = null;
const keyButtons = new Map();

function progress() {
  return local.get('typing.progress', {}); // levelId -> best stars (1-3)
}

function menu() {
  state = null;
  const done = progress();
  root.replaceChildren(
    el('h1.center', {}, '⌨️ Key Hero'),
    el('p.center', {}, 'Learn where every key lives. Pick a level!'),
    el('div.levels', {}, LEVELS.map((level, i) => {
      const unlocked = i === 0 || done[LEVELS[i - 1].id];
      const stars = done[level.id] || 0;
      return el('button.btn.level-btn' + (stars ? '.leaf' : unlocked ? '.white' : ''), {
        disabled: !unlocked,
        'data-level': level.id,
        onclick: () => play(level),
      },
      el('span', {}, `${level.emoji} ${level.title}`),
      el('small', {}, unlocked ? (stars ? '⭐'.repeat(stars) : 'Not played yet') : '🔒 Finish the level before'));
    })),
  );
}

function makeTargets(level) {
  if (level.words) return shuffle(WORDS).slice(0, level.count);
  const keys = [...level.keys];
  const targets = [];
  while (targets.length < level.count) targets.push(...shuffle(keys));
  return targets.slice(0, level.count);
}

function play(level) {
  state = { level, targets: makeTargets(level), index: 0, pos: 0, hits: 0, misses: 0, start: gameNow() };
  const targetBox = el('div.target', { 'aria-live': 'polite' });
  const fingerHint = el('div.finger');
  const bar = el('div');
  const score = el('span.pill', {}, '✅ 0  ❌ 0');

  keyButtons.clear();
  const keyboard = el('div.keyboard', {}, ROWS.map((row) => el('div.kb-row', {}, [...row].map((key) => {
    const button = el('button.kb-key', {
      style: { '--finger': fingerOf(key)?.[1].color || '#fff' },
      'aria-label': `Key ${key}`,
      onclick: () => press(key),
    }, key.toUpperCase());
    keyButtons.set(key, button);
    return button;
  }))));

  const legend = el('div.legend', {}, Object.entries(FINGERS).map(([name, f]) => el('span', { style: { '--finger': f.color } }, name)));

  root.replaceChildren(
    el('div.hud', {},
      el('button.btn.small.white', { onclick: menu }, '⬅ Levels'),
      el('span.pill', {}, `${level.emoji} ${level.title}`),
      score),
    el('p.center.hint', {}, level.tip),
    targetBox,
    fingerHint,
    el('div.progress', {}, bar),
    keyboard,
    legend,
  );
  state.ui = { targetBox, fingerHint, bar, score };
  showTarget();
}

function currentKey() {
  const t = state.targets[state.index];
  return t[state.pos];
}

function showTarget() {
  const { targetBox, fingerHint, bar, score } = state.ui;
  const t = state.targets[state.index];
  if (state.level.words) {
    targetBox.replaceChildren(...[...t].map((ch, i) => el('span' + (i < state.pos ? '.done' : i === state.pos ? '.next' : ''), {}, ch)));
  } else {
    targetBox.textContent = t.toUpperCase();
  }
  const key = currentKey();
  const finger = fingerOf(key);
  fingerHint.textContent = finger ? `Use your ${finger[0]} finger 👆` : '';
  keyButtons.forEach((b, k) => b.classList.toggle('target-key', k === key));
  bar.style.width = `${(state.index / state.targets.length) * 100}%`;
  score.textContent = `✅ ${state.hits}  ❌ ${state.misses}`;
}

function flash(key, cls) {
  const button = keyButtons.get(key);
  if (!button) return;
  button.classList.add(cls);
  setTimeout(() => button.classList.remove(cls), 250);
}

function press(key) {
  if (!state || document.querySelector('.overlay')) return;
  if (key === currentKey()) {
    state.hits++;
    flash(key, 'hit');
    sfx.good();
    state.pos++;
    if (state.pos >= state.targets[state.index].length) {
      state.index++;
      state.pos = 0;
    }
    if (state.index >= state.targets.length) {
      finish();
      return;
    }
  } else {
    state.misses++;
    flash(key, 'miss');
    sfx.bad();
    state.ui.targetBox.classList.remove('shake');
    void state.ui.targetBox.offsetWidth;
    state.ui.targetBox.classList.add('shake');
  }
  showTarget();
}

function finish() {
  const { level, hits, misses, start } = state;
  const accuracy = Math.round((hits / (hits + misses)) * 100);
  const minutes = (gameNow() - start) / 60000;
  const kpm = Math.round(hits / Math.max(minutes, 1 / 60));
  const stars = accuracy >= 95 ? 3 : accuracy >= 80 ? 2 : 1;
  const all = progress();
  all[level.id] = Math.max(all[level.id] || 0, stars);
  local.set('typing.progress', all);
  state.ui.bar.style.width = '100%';
  sfx.win();
  confetti(['⌨️', '⭐', '🎉']);
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  showOverlay({
    emoji: '⭐'.repeat(stars),
    title: `${level.title} complete!`,
    text: `Accuracy ${accuracy}% · ${kpm} keys per minute`,
    actions: [
      { label: 'Levels', className: 'white', onClick: menu },
      { label: 'Again', className: 'mint', onClick: () => play(level) },
      nextLevel ? { label: 'Next ➡️', className: 'leaf', onClick: () => play(nextLevel) } : null,
    ].filter(Boolean),
  });
}

document.addEventListener('keydown', (event) => {
  if (!state || event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key.length === 1 && (keyButtons.has(key) || /[a-z0-9]/.test(key))) {
    event.preventDefault();
    press(key);
  }
});

menu();
