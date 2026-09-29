// Memory Match: flip two cards at a time and find all the pairs.
import { el, local, sfx, confetti, showOverlay, shuffle, formatTime, gameNow } from '../../js/kit.js';

const EMOJIS = ['🐶', '🐱', '🐼', '🦊', '🐸', '🐵', '🦁', '🐯', '🐨', '🐷', '🐙', '🦄', '🐢', '🐝', '🦋', '🐳'];
export const DIFFICULTIES = [
  { id: 'easy', label: '😊 Easy', pairs: 6, cols: 3 },
  { id: 'medium', label: '🤔 Medium', pairs: 8, cols: 4 },
  { id: 'hard', label: '🤯 Hard', pairs: 12, cols: 4 },
];

const root = document.getElementById('game');
let game = null;
let tick = null;

function menu() {
  clearInterval(tick);
  const best = local.get('memory.best', {});
  root.replaceChildren(
    el('h1.center', {}, '🃏 Memory Match'),
    el('p.center', {}, 'Flip two cards. Find all the pairs!'),
    el('div.choices', {}, DIFFICULTIES.map((d) => el('button.btn.block', {
      'data-difficulty': d.id,
      onclick: () => start(d),
    }, d.label, best[d.id] ? ` · 🏅 ${best[d.id]} moves` : ''))),
  );
}

function start(difficulty) {
  const faces = shuffle(shuffle(EMOJIS).slice(0, difficulty.pairs).flatMap((e) => [e, e]));
  const moves = el('span.pill', {}, '👆 0 moves');
  const time = el('span.pill', {}, '⏱️ 0:00');
  const found = el('span.pill', {}, `✨ 0 / ${difficulty.pairs}`);
  game = { difficulty, open: [], matched: 0, moves: 0, start: gameNow(), busy: false, ui: { moves, found } };

  const cards = faces.map((face, i) => el('button.mcard', {
    'data-face': face,
    'aria-label': `Card ${i + 1}`,
    onclick: (event) => flip(event.currentTarget),
  }, el('div.inner', {}, el('div.face.back', {}, '❓'), el('div.face.front', {}, face))));

  root.replaceChildren(
    el('div.hud', {}, el('button.btn.small.white', { onclick: menu }, '⬅ Levels'), moves, time, found),
    el('div.cards', { style: { '--cols': difficulty.cols } }, cards),
  );
  clearInterval(tick);
  tick = setInterval(() => { time.textContent = `⏱️ ${formatTime((gameNow() - game.start) / 1000)}`; }, 1000);
}

function flip(card) {
  if (game.busy || card.classList.contains('up') || card.classList.contains('matched')) return;
  card.classList.add('up');
  sfx.tap();
  game.open.push(card);
  if (game.open.length < 2) return;

  game.moves++;
  game.ui.moves.textContent = `👆 ${game.moves} moves`;
  const [a, b] = game.open;
  game.open = [];
  if (a.dataset.face === b.dataset.face) {
    a.classList.add('matched');
    b.classList.add('matched');
    a.setAttribute('aria-label', `Matched ${a.dataset.face}`);
    b.setAttribute('aria-label', `Matched ${b.dataset.face}`);
    game.matched++;
    game.ui.found.textContent = `✨ ${game.matched} / ${game.difficulty.pairs}`;
    sfx.good();
    if (game.matched === game.difficulty.pairs) setTimeout(win, 400);
  } else {
    game.busy = true;
    setTimeout(() => {
      a.classList.remove('up');
      b.classList.remove('up');
      game.busy = false;
    }, 800);
  }
}

function win() {
  clearInterval(tick);
  const { difficulty, moves, start: startedAt } = game;
  const best = local.get('memory.best', {});
  const newBest = !best[difficulty.id] || moves < best[difficulty.id];
  if (newBest) {
    best[difficulty.id] = moves;
    local.set('memory.best', best);
  }
  sfx.win();
  confetti();
  showOverlay({
    emoji: '🏆',
    title: newBest ? 'New best score!' : 'You found them all!',
    text: `${moves} moves in ${formatTime((gameNow() - startedAt) / 1000)}.`,
    actions: [
      { label: 'Change level', className: 'white', onClick: menu },
      { label: 'Play again', className: 'leaf', onClick: () => start(difficulty) },
    ],
  });
}

menu();
