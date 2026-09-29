// Things to do during the 30-minute break (see wellbeing.js): the kid picks one.
//   🌳 Move & look far · 🧮 Quick maths · 🔬 Science · 🏛️ History · 🧘 Relax (music, eyes closed) · 👀 Eye exercise
// Content lives in web/breaks/*.json so more questions/facts can be added without code.
import { el, shuffle, randInt, sfx } from './kit.js';

export const ACTIVITIES = [
  { id: 'move', emoji: '🌳', label: 'Move & look far' },
  { id: 'math', emoji: '🧮', label: 'Quick maths' },
  { id: 'science', emoji: '🔬', label: 'Science' },
  { id: 'history', emoji: '🏛️', label: 'History' },
  { id: 'relax', emoji: '🧘', label: 'Relax' },
  { id: 'eyes', emoji: '👀', label: 'Eye exercise' },
];

const jsonCache = {};
async function loadJson(path) {
  jsonCache[path] ||= fetch(path).then((r) => r.json());
  return jsonCache[path];
}

/**
 * Show the activity chooser (or start one straight away) inside `container`.
 * Returns a cleanup function (stops music and timers).
 */
export function mountBreakActivities(container, { startWith = null } = {}) {
  let cleanup = () => {};
  const stop = () => { cleanup(); cleanup = () => {}; };

  const chooser = () => {
    stop();
    container.replaceChildren(
      el('p.break-ask', {}, 'Pick something to do on your break:'),
      el('div.break-choices', {}, ACTIVITIES.map((a) => el('button.break-choice', {
        'data-activity': a.id,
        onclick: () => start(a.id),
      }, el('span', { 'aria-hidden': 'true' }, a.emoji), a.label))));
  };

  const start = async (id) => {
    stop();
    const body = el('div.break-activity', { 'data-activity': id });
    const back = el('button.link-btn', { onclick: chooser }, '⬅ Pick something else');
    container.replaceChildren(body, back);
    cleanup = (await RENDERERS[id](body)) || (() => {});
  };

  if (startWith) start(startWith);
  else chooser();
  return () => stop();
}

// ---------- Activities ----------

const RENDERERS = {
  move(body) {
    body.append(
      el('h3', {}, '🌳 Move & look far'),
      el('ul.break-tips', {},
        el('li', {}, '👀 Look far away at trees and plants'),
        el('li', {}, '🧍 Stand up and stretch high'),
        el('li', {}, '🚶 Walk around the room'),
        el('li', {}, '💧 Have a drink of water')));
  },

  math(body) {
    const makeQuestion = () => {
      const kind = randInt(0, 2);
      if (kind === 0) { const a = randInt(5, 50); const b = randInt(5, 49); return { text: `${a} + ${b}`, answer: a + b }; }
      if (kind === 1) { const a = randInt(20, 99); const b = randInt(1, a); return { text: `${a} − ${b}`, answer: a - b }; }
      const a = randInt(2, 10); const b = randInt(2, 10);
      return { text: `${a} × ${b}`, answer: a * b };
    };
    const choicesFor = (answer) => {
      const options = new Set([answer]);
      while (options.size < 3) options.add(Math.max(0, answer + randInt(-10, 10)));
      return shuffle([...options]);
    };
    return quiz(body, '🧮 Quick maths', Array.from({ length: 5 }, () => {
      const q = makeQuestion();
      return { q: `${q.text} = ?`, answer: String(q.answer), options: choicesFor(q.answer).map(String) };
    }));
  },

  async science(body) {
    const { questions } = await loadJson('breaks/science.json');
    return quiz(body, '🔬 Science', shuffle(questions).slice(0, 5).map((q) => ({
      q: q.q, answer: q.answer, options: shuffle([q.answer, ...q.wrong]),
    })));
  },

  async history(body) {
    const facts = shuffle((await loadJson('breaks/history.json')).facts);
    let i = 0;
    const card = el('div.fact-card');
    const show = () => {
      const f = facts[i % facts.length];
      card.replaceChildren(el('div.big-emoji', { 'aria-hidden': 'true' }, f.emoji), el('h3', {}, f.title), el('p', {}, f.text));
    };
    body.append(el('h3', {}, '🏛️ Did you know?'), card,
      el('button.btn.small.mint', { onclick: () => { i++; sfx.tap(); show(); } }, 'Another fact ➡️'));
    show();
  },

  relax(body) {
    const circle = el('div.breathe-circle', { 'aria-hidden': 'true' });
    const words = el('p.breathe-words', { 'aria-live': 'polite' }, 'Breathe in…');
    body.append(el('h3', {}, '🧘 Relax'), el('p', {}, 'Close your eyes, listen to the music and breathe slowly. The chime tells you when the break is over.'), circle, words);
    const flip = setInterval(() => { words.textContent = words.textContent.startsWith('Breathe in') ? 'Breathe out…' : 'Breathe in…'; }, 4000);
    const stopMusic = playCalmMusic();
    return () => { clearInterval(flip); stopMusic(); };
  },

  eyes(body) {
    const steps = [
      { emoji: '😉', text: 'Blink fast 10 times, then close your eyes and count to 5.', seconds: 15 },
      { emoji: '🌳', text: 'Look at something far away, like a tree outside, for 20 seconds.', seconds: 20 },
      { emoji: '👆', text: 'Hold a finger near your nose. Look at it, then far away. Switch 5 times.', seconds: 20 },
      { emoji: '🔄', text: 'Roll your eyes slowly in a big circle, 3 times each way.', seconds: 20 },
      { emoji: '🟡', text: 'Follow the moving dot with your eyes only. Keep your head still!', seconds: 20, dot: true },
      { emoji: '🤲', text: 'Rub your hands until warm, then cup them over your closed eyes.', seconds: 15 },
    ];
    let index = 0;
    let timer;
    const stepBox = el('div.eye-step');
    const progress = el('p.hint');
    const show = () => {
      const step = steps[index];
      let left = step.seconds;
      stepBox.replaceChildren(
        el('div.big-emoji', { 'aria-hidden': 'true' }, step.emoji),
        el('p.eye-text', {}, step.text),
        step.dot ? el('div.dot-track', { 'aria-hidden': 'true' }, el('div.dot')) : null,
        el('div.eye-count', {}, String(left)));
      progress.textContent = `Step ${index + 1} of ${steps.length}`;
      clearInterval(timer);
      timer = setInterval(() => {
        left--;
        const count = stepBox.querySelector('.eye-count');
        if (count) count.textContent = String(Math.max(left, 0));
        if (left <= 0) {
          sfx.tap();
          index++;
          if (index < steps.length) show();
          else {
            clearInterval(timer);
            stepBox.replaceChildren(el('div.big-emoji', {}, '🌟'), el('p.eye-text', {}, 'Great job! Your eyes feel fresh now.'));
            progress.textContent = '';
          }
        }
      }, 1000);
    };
    body.append(el('h3', {}, '👀 Eye exercise'), progress, stepBox);
    show();
    return () => clearInterval(timer);
  },
};

/** A short multiple-choice quiz. questions: [{q, answer, options}] */
function quiz(body, title, questions) {
  let i = 0;
  let score = 0;
  const box = el('div.break-quiz');
  const show = () => {
    if (i >= questions.length) {
      box.replaceChildren(el('div.big-emoji', {}, score === questions.length ? '🏆' : '🌟'), el('p', {}, `You got ${score} out of ${questions.length}!`));
      return;
    }
    const { q, answer, options } = questions[i];
    let answered = false;
    const buttons = options.map((option) => el('button.btn.white', {
      onclick: () => {
        if (answered) return;
        answered = true;
        const right = option === answer;
        if (right) { score++; sfx.good(); } else sfx.bad();
        buttons.forEach((b) => {
          if (b.textContent === answer) b.classList.add('right');
          else if (b.textContent === option) b.classList.add('wrong');
        });
        setTimeout(() => { i++; show(); }, 900);
      },
    }, option));
    box.replaceChildren(el('p.hint', {}, `Question ${i + 1} of ${questions.length}`), el('p.break-q', {}, q), el('div.break-options', {}, buttons));
  };
  body.append(el('h3', {}, title), box);
  show();
}

/** Soft, slowly changing music made on the fly (no audio files needed). Returns stop(). */
function playCalmMusic() {
  let ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return () => {};
  }
  const master = ctx.createGain();
  master.gain.value = 0.08;
  master.connect(ctx.destination);
  // A calm pentatonic scale (C D E G A) across two octaves.
  const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
  const pad = (freq, start, length) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.6, start + length * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain).connect(master);
    osc.start(start);
    osc.stop(start + length + 0.1);
  };
  const play = () => {
    const t = ctx.currentTime;
    pad(notes[0] / 2, t, 6); // low drone
    pad(notes[randInt(0, notes.length - 1)], t + 0.5, 4);
    pad(notes[randInt(0, notes.length - 1)], t + 2.5, 4);
  };
  play();
  const loop = setInterval(play, 5000);
  return () => {
    clearInterval(loop);
    const t = ctx.currentTime;
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.5);
    setTimeout(() => ctx.close(), 700);
  };
}
