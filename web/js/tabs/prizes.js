// Claim Prizes tab: spend stars on prizes. Grown-ups can add or remove prizes.
import { el, uid, confetti, sfx } from '../kit.js';
import { prizes, savePrizes, claims, claimPrize, starBalance } from '../store.js';
import { openSheet, confirmDialog, askGrownUp, toast } from '../ui.js';

let container;

export function render(target) {
  container = target;
  draw();
  window.addEventListener('jia:stars', draw);
  window.addEventListener('jia:prizes', draw);
}

export function onShow() {
  draw();
}

function draw() {
  if (!container) return;
  const balance = starBalance();
  const tiles = prizes().map((prize) => {
    const short = prize.cost - balance;
    return el('div.tile', { style: { '--tile-color': short > 0 ? '#FFFFFF' : '#FFF4D6' }, 'data-prize': prize.id },
      el('span.badge', {}, `⭐ ${prize.cost}`),
      el('span.tile-emoji', { 'aria-hidden': 'true' }, prize.emoji),
      el('span.tile-title', {}, prize.title),
      short > 0
        ? el('span.tile-desc', {}, `${short} more ⭐ to go`)
        : el('button.btn.small.pink', { onclick: () => claim(prize) }, 'Claim 🎁'));
  });

  const myClaims = claims();
  container.replaceChildren(
    el('div.tab-title', {},
      el('div', {}, el('h2', {}, '🎁 Claim Prizes'), el('p', {}, `You have ⭐ ${balance} stars to spend.`)),
      el('button.btn.small.white', { onclick: editPrizes }, '✏️ Edit prizes')),
    tiles.length ? el('div.grid', {}, tiles) : el('div.empty', {}, el('div.big', {}, '🎁'), 'No prizes yet. Ask a grown-up to add some!'),
    el('h3.section-title', {}, '🧾 My claimed prizes'),
    myClaims.length
      ? el('div.stack', {}, myClaims.map((c) => el('div.list-row', {},
        el('span', {}, `${c.emoji} ${c.title}`, el('br'), el('small.hint', {}, new Date(c.at).toLocaleDateString())),
        el('span.pill' + (c.status === 'given' ? '.done-tag' : ''), {}, c.status === 'given' ? 'Received ✅' : 'Waiting ⏳'))))
      : el('p.hint', {}, 'Nothing claimed yet. Keep collecting stars!'),
  );
}

async function claim(prize) {
  const yes = await confirmDialog({
    title: `${prize.emoji} Claim this prize?`,
    text: `“${prize.title}” costs ⭐ ${prize.cost}. You will have ⭐ ${starBalance() - prize.cost} left.`,
    yes: 'Claim it!',
    no: 'Not now',
  });
  if (!yes) return;
  if (claimPrize(prize)) {
    sfx.win();
    confetti(['🎁', '⭐', '🎉']);
    toast('Claimed! Show a grown-up to get your prize 🎉');
  } else {
    toast('Not enough stars yet.');
  }
}

async function editPrizes() {
  if (!(await askGrownUp('Grown-ups can add or remove prizes.'))) return;
  openSheet({
    title: '✏️ Edit prizes',
    content: () => {
      const list = el('div.stack');
      const renderList = () => {
        list.replaceChildren(...prizes().map((p) => el('div.list-row', {},
          el('span', {}, `${p.emoji} ${p.title} — ⭐ ${p.cost}`),
          el('button.btn.small.berry', {
            'aria-label': `Remove ${p.title}`,
            onclick: () => { savePrizes(prizes().filter((x) => x.id !== p.id)); renderList(); },
          }, '🗑️'))));
      };
      renderList();
      const emoji = el('input', { placeholder: '🎁', maxlength: '4', 'aria-label': 'Emoji', style: { maxWidth: '70px' } });
      const title = el('input', { placeholder: 'Prize name', 'aria-label': 'Prize name' });
      const cost = el('input', { type: 'number', min: '1', placeholder: 'Stars', 'aria-label': 'Stars needed', style: { maxWidth: '90px' } });
      const add = el('button.btn.small.leaf', {
        onclick: () => {
          const stars = Number(cost.value);
          if (!title.value.trim() || !(stars > 0)) { toast('Add a name and how many stars it costs'); return; }
          savePrizes([...prizes(), { id: uid(), emoji: emoji.value.trim() || '🎁', title: title.value.trim(), cost: Math.round(stars) }]);
          emoji.value = title.value = cost.value = '';
          renderList();
        },
      }, 'Add');
      return el('div.stack', {}, list, el('h3', {}, '➕ New prize'), el('div.inline-form', {}, emoji, title, cost), add);
    },
  });
}
