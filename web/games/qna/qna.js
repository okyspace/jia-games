// Quiz Maker: kids write their own questions (with answers) and test each other.
// A question with wrong answers becomes multiple choice; without them, you type the answer.
// Questions are shared by every player on this device.
import { el, local, uid, sfx, confetti, showOverlay, shuffle } from '../../js/kit.js';
import { currentProfile } from '../../js/profiles.js';

const QUIZ_LENGTH = 10;
const STARTERS = [
  { question: 'How many legs does a spider have?', answer: '8', wrong: ['6', '10', '4'] },
  { question: 'What do bees make?', answer: 'Honey', wrong: ['Milk', 'Bread', 'Juice'] },
  { question: 'Which planet is called the Red Planet?', answer: 'Mars', wrong: ['Venus', 'Jupiter', 'Earth'] },
  { question: 'How many days are there in a week?', answer: '7', wrong: [] },
  { question: 'What colour do you get when you mix blue and yellow?', answer: 'Green', wrong: [] },
].map((q, i) => ({ ...q, id: 'starter-' + i, author: 'Jia Games' }));

const root = document.getElementById('game');

export function normalise(text) {
  return String(text).trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/, '');
}

function questions() {
  return local.get('qna.questions', STARTERS);
}

function saveQuestions(list) {
  local.set('qna.questions', list);
}

function menu() {
  const count = questions().length;
  root.replaceChildren(
    el('h1.center', {}, '❓ Quiz Maker'),
    el('p.center', {}, 'Make your own questions and test your friends and family!'),
    el('div.menu-buttons', {},
      el('button.btn.leaf', { disabled: count === 0, onclick: play }, `▶️ Play the quiz (${Math.min(count, QUIZ_LENGTH)} questions)`),
      el('button.btn.grape', { onclick: () => edit() }, '➕ Add a question'),
      el('button.btn.white', { onclick: list }, `📋 All questions (${count})`)),
  );
}

function edit(existing = null) {
  const question = el('textarea', { 'aria-label': 'Question', placeholder: 'e.g. What is the biggest animal?' }, existing?.question || '');
  const answer = el('input', { 'aria-label': 'Correct answer', placeholder: 'e.g. Blue whale', value: existing?.answer || '' });
  const wrong = [0, 1, 2].map((i) => el('input', { 'aria-label': `Wrong answer ${i + 1}`, placeholder: `Wrong answer ${i + 1} (optional)`, value: existing?.wrong?.[i] || '' }));
  const error = el('p.hint', { role: 'alert', style: { color: '#c92a2a' } });

  const save = (event) => {
    event.preventDefault();
    const item = {
      id: existing?.id || uid(),
      question: question.value.trim(),
      answer: answer.value.trim(),
      wrong: wrong.map((w) => w.value.trim()).filter(Boolean),
      author: existing?.author || currentProfile()?.name || 'Someone',
    };
    if (!item.question) { error.textContent = 'Write a question first.'; return; }
    if (!item.answer) { error.textContent = 'What is the right answer?'; return; }
    if (item.wrong.some((w) => normalise(w) === normalise(item.answer))) { error.textContent = 'A wrong answer is the same as the right answer!'; return; }
    const all = questions();
    const index = all.findIndex((q) => q.id === item.id);
    if (index >= 0) all[index] = item; else all.push(item);
    saveQuestions(all);
    sfx.good();
    showOverlay({
      emoji: '✅',
      title: 'Question saved!',
      actions: [
        { label: 'Menu', className: 'white', onClick: menu },
        { label: 'Add another', className: 'grape', onClick: () => edit() },
      ],
    });
  };

  root.replaceChildren(
    el('div.hud', {}, el('button.btn.small.white', { onclick: menu }, '⬅ Menu')),
    el('h2.center', {}, existing ? '✏️ Change question' : '➕ New question'),
    el('form.card', { onsubmit: save },
      el('label.field', {}, '❓ Question', question),
      el('label.field', {}, '✅ Right answer', answer),
      el('div.field', {}, '❌ Wrong answers', el('span.hint', {}, 'Add some to make it multiple choice. Leave empty to make players type the answer.'), ...wrong),
      error,
      el('button.btn.leaf.block', { type: 'submit' }, '💾 Save question')),
  );
}

function list() {
  const all = questions();
  root.replaceChildren(
    el('div.hud', {}, el('button.btn.small.white', { onclick: menu }, '⬅ Menu')),
    el('h2.center', {}, '📋 All questions'),
    all.length
      ? el('div.stack', { style: { display: 'grid', gap: '10px' } }, all.map((q) => el('div.q-row', {},
        el('span', {}, q.question, el('br'), el('small.hint', {}, `by ${q.author}`)),
        el('div.q-actions', {},
          el('button.btn.small.white', { 'aria-label': 'Edit question', onclick: () => edit(q) }, '✏️'),
          el('button.btn.small.berry', {
            'aria-label': 'Delete question',
            onclick: () => { saveQuestions(questions().filter((x) => x.id !== q.id)); list(); },
          }, '🗑️')))))
      : el('p.center', {}, 'No questions yet. Add one!'),
  );
}

function play() {
  const round = shuffle(questions()).slice(0, QUIZ_LENGTH);
  let index = 0;
  let score = 0;

  const show = () => {
    const q = round[index];
    const feedback = el('div.feedback', { 'aria-live': 'polite' });
    const next = el('button.btn.leaf.block.hidden', { onclick: () => { index++; if (index < round.length) show(); else done(); } },
      index + 1 < round.length ? 'Next ➡️' : 'See my score 🏁');
    let answered = false;

    const mark = (correct) => {
      answered = true;
      if (correct) { score++; sfx.good(); feedback.textContent = '🎉 Correct!'; } else { sfx.bad(); feedback.textContent = `😅 The answer is: ${q.answer}`; }
      next.classList.remove('hidden');
      next.focus();
    };

    let answerArea;
    if (q.wrong?.length) {
      const options = shuffle([q.answer, ...q.wrong]);
      answerArea = el('div.answers', {}, options.map((option) => el('button.btn.white', {
        onclick: (event) => {
          if (answered) return;
          const correct = option === q.answer;
          event.currentTarget.classList.add(correct ? 'right' : 'wrong');
          if (!correct) [...answerArea.children].find((b) => b.textContent === q.answer)?.classList.add('right');
          mark(correct);
        },
      }, option)));
    } else {
      const input = el('input', { 'aria-label': 'Your answer', placeholder: 'Type your answer', autocomplete: 'off' });
      answerArea = el('form', {
        onsubmit: (event) => {
          event.preventDefault();
          if (answered || !input.value.trim()) return;
          input.disabled = true;
          mark(normalise(input.value) === normalise(q.answer));
        },
      }, el('label.field', {}, input), el('button.btn.grape.block', { type: 'submit' }, 'Check ✔️'));
      setTimeout(() => input.focus(), 50);
    }

    root.replaceChildren(
      el('div.hud', {},
        el('button.btn.small.white', { onclick: menu }, '⬅ Stop'),
        el('span.pill', {}, `Question ${index + 1} / ${round.length}`),
        el('span.pill', {}, `⭐ ${score}`)),
      el('div.card', {}, el('p.question', {}, q.question), el('p.center.hint', {}, `by ${q.author}`)),
      answerArea,
      feedback,
      next,
    );
  };

  const done = () => {
    const perfect = score === round.length;
    if (score >= round.length / 2) { sfx.win(); confetti(); }
    showOverlay({
      emoji: perfect ? '🏆' : score >= round.length / 2 ? '🌟' : '💪',
      title: `You got ${score} out of ${round.length}!`,
      text: perfect ? 'Perfect score!' : 'Great try! Play again to do even better.',
      actions: [
        { label: 'Menu', className: 'white', onClick: menu },
        { label: 'Play again', className: 'leaf', onClick: play },
      ],
    });
  };

  show();
}

menu();
