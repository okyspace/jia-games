// Math Sprint challenge: 3 timed rounds – addition, subtraction, then multiplication.
// Answer every question in a round before the timer runs out. A wrong answer must be fixed
// before moving on. If time runs out, that round starts again. Finish all 3 to earn the stars.
import { el, sfx, confetti, showOverlay, randInt, reportChallengeComplete } from '../../js/kit.js';

const CHALLENGE_ID = 'math-sprint';

export const ROUNDS = [
  { name: 'Adding', symbol: '+', emoji: '➕', questions: 10, seconds: 120, make: () => { const a = randInt(2, 60); const b = randInt(2, 99 - a); return { a, b, answer: a + b }; } },
  { name: 'Taking away', symbol: '−', emoji: '➖', questions: 10, seconds: 120, make: () => { const a = randInt(10, 99); const b = randInt(1, a); return { a, b, answer: a - b }; } },
  { name: 'Times tables', symbol: '×', emoji: '✖️', questions: 10, seconds: 120, make: () => { const a = randInt(2, 10); const b = randInt(2, 10); return { a, b, answer: a * b }; } },
];

const root = document.getElementById('game');
let roundIndex = 0;
let round = null;
let clock = null;

function intro() {
  root.replaceChildren(
    el('h1.center', {}, '🧮 Math Sprint'),
    el('div.card.intro', {},
      el('p', {}, 'Finish 3 rounds before the timer runs out:'),
      el('ol', {}, ROUNDS.map((r) => el('li', {}, `${r.emoji} ${r.name}: ${r.questions} questions in ${r.seconds / 60} minutes`))),
      el('p', {}, 'Finish all 3 rounds to win ⭐ 10 stars!')),
    el('button.btn.leaf.block', { onclick: () => startRound(0) }, 'Start! 🚀'),
  );
}

function startRound(index) {
  roundIndex = index;
  const spec = ROUNDS[index];
  round = { spec, number: 0, typed: '', q: spec.make(), deadline: Date.now() + spec.seconds * 1000, mistakes: 0 };

  const dots = el('div.rounds', {}, ROUNDS.map((r, i) => el('span.round-dot' + (i < index ? '.done' : i === index ? '.now' : ''), {}, `${r.emoji} ${i + 1}`)));
  const count = el('span.pill', {});
  const timeLeft = el('span.pill', {});
  const bar = el('div');
  const timer = el('div.timer', {}, bar);
  const sum = el('div.sum', { 'aria-live': 'polite' });
  const answer = el('div.answer', { 'aria-label': 'Your answer' });
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✔'].map((k) => el('button.key' + (k === '✔' ? '.go' : ''), {
    'aria-label': k === '⌫' ? 'Delete' : k === '✔' ? 'Check' : k,
    onclick: () => input(k),
  }, k));

  root.replaceChildren(
    dots,
    el('div.hud', {}, el('span.pill', {}, `${spec.emoji} ${spec.name}`), count, timeLeft),
    timer,
    sum,
    answer,
    el('div.numpad', {}, keys),
  );
  round.ui = { count, timeLeft, bar, timer, sum, answer };
  showQuestion();

  clearInterval(clock);
  clock = setInterval(tickClock, 250);
  tickClock();
}

function showQuestion() {
  const { spec, q, number, typed, ui } = round;
  ui.count.textContent = `Question ${number + 1} / ${spec.questions}`;
  ui.sum.textContent = `${q.a} ${spec.symbol} ${q.b} = ?`;
  ui.answer.textContent = typed;
}

function tickClock() {
  if (!round) return;
  const left = Math.max(0, round.deadline - Date.now());
  const total = round.spec.seconds * 1000;
  round.ui.bar.style.width = `${(left / total) * 100}%`;
  round.ui.timer.classList.toggle('low', left < 20000);
  round.ui.timeLeft.textContent = `⏱️ ${Math.ceil(left / 1000)}s`;
  if (left === 0) timeUp();
}

function timeUp() {
  clearInterval(clock);
  const index = roundIndex;
  round = null;
  sfx.bad();
  showOverlay({
    emoji: '⏰',
    title: "Time's up!",
    text: 'So close! Try this round again. You can do it!',
    actions: [{ label: 'Try again 💪', className: 'leaf', onClick: () => startRound(index) }],
  });
}

function input(key) {
  if (!round || document.querySelector('.overlay')) return;
  if (key === '⌫') {
    round.typed = round.typed.slice(0, -1);
  } else if (key === '✔') {
    check();
    return;
  } else if (round.typed.length < 4) {
    round.typed += key;
  }
  round.ui.answer.textContent = round.typed;
}

function check() {
  if (!round.typed) return;
  if (Number(round.typed) === round.q.answer) {
    sfx.good();
    round.number++;
    round.typed = '';
    if (round.number >= round.spec.questions) {
      roundDone();
      return;
    }
    round.q = round.spec.make();
    showQuestion();
  } else {
    sfx.bad();
    round.mistakes++;
    round.typed = '';
    round.ui.answer.textContent = '';
    round.ui.answer.classList.remove('shake');
    void round.ui.answer.offsetWidth;
    round.ui.answer.classList.add('shake');
  }
}

function roundDone() {
  clearInterval(clock);
  const index = roundIndex;
  round = null;
  if (index + 1 < ROUNDS.length) {
    sfx.win();
    showOverlay({
      emoji: '🌟',
      title: `Round ${index + 1} done!`,
      text: `Next: ${ROUNDS[index + 1].emoji} ${ROUNDS[index + 1].name}`,
      actions: [{ label: 'Next round ➡️', className: 'leaf', onClick: () => startRound(index + 1) }],
    });
  } else {
    sfx.win();
    confetti();
    showOverlay({
      emoji: '🏆',
      title: 'Math Sprint complete!',
      text: 'You finished all 3 rounds!',
      actions: [{ label: 'Collect my stars ⭐', className: 'leaf', onClick: () => reportChallengeComplete(CHALLENGE_ID) }],
    });
  }
}

document.addEventListener('keydown', (event) => {
  if (/^[0-9]$/.test(event.key)) input(event.key);
  else if (event.key === 'Backspace') input('⌫');
  else if (event.key === 'Enter') input('✔');
});

intro();
