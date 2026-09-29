// Challenges tab: cards read from web/challenges/challenges.json.
// Finishing a challenge earns stars. Some challenges stay locked until others are done ("requires").
import { el } from '../kit.js';
import { completedToday, timesCompleted, logChallenge } from '../store.js';
import { celebrate, toast } from '../ui.js';
import { openPage } from '../launcher.js';
import { startBookLog, startChecklist, startRecording } from '../challenge-types.js';

let container;
let challenges = [];

export async function render(target) {
  container = target;
  const response = await fetch('challenges/challenges.json');
  challenges = (await response.json()).challenges;
  draw();
  window.addEventListener('jia:stars', draw);
}

export function onShow() {
  draw();
}

/** Status of a challenge right now: 'locked' | 'done' | 'ready'. */
export function statusOf(challenge) {
  const needs = challenge.requires || [];
  if (needs.some((id) => timesCompleted(id) === 0)) return 'locked';
  if (challenge.repeat === 'once' && timesCompleted(challenge.id) > 0) return 'done';
  if (challenge.repeat === 'daily' && completedToday(challenge.id)) return 'done';
  return 'ready';
}

function titleOf(id) {
  return challenges.find((c) => c.id === id)?.title || id;
}

function draw() {
  if (!container) return;
  const cards = challenges.map((challenge, index) => {
    const status = statusOf(challenge);
    const count = timesCompleted(challenge.id);
    let action;
    if (status === 'locked') {
      action = el('span.pill', {}, `🔒 Finish “${(challenge.requires || []).map(titleOf).join('”, “')}” first`);
    } else if (status === 'done') {
      action = el('span.pill.done-tag', {}, challenge.repeat === 'daily' ? '✅ Done today! Come back tomorrow' : '✅ Done!');
    } else {
      action = el('button.btn.small', { onclick: () => start(challenge) }, 'Start ▶');
    }
    return el('article.challenge' + (status === 'locked' ? '.locked' : ''), {
      style: { '--c-color': challenge.color },
      'data-challenge': challenge.id,
    },
    el('div.c-emoji', { 'aria-hidden': 'true' }, challenge.emoji),
    el('div.c-main', {},
      el('h3', {}, `${index + 1}. ${challenge.title}`),
      el('p', {}, challenge.description),
      el('div.c-meta', {},
        el('span.pill.stars-tag', {}, `⭐ ${challenge.stars}`),
        count ? el('span.pill', {}, `Done ${count}×`) : null,
        action)));
  });

  // A teaser card for challenges that unlock more.
  const teasers = challenges.filter((c) => c.unlocksMore).map((c) => {
    const unlocked = timesCompleted(c.id) > 0;
    return el('article.challenge' + (unlocked ? '' : '.locked'), { style: { '--c-color': '#FFFFFF' } },
      el('div.c-emoji', { 'aria-hidden': 'true' }, unlocked ? '🗝️' : '🔒'),
      el('div.c-main', {},
        el('h3', {}, unlocked ? 'You unlocked more challenges!' : 'Secret challenges'),
        el('p', {}, unlocked
          ? 'Ask a grown-up to add new challenges for you.'
          : `Finish “${c.title}” to unlock more challenges.`)));
  });

  container.replaceChildren(
    el('div.tab-title', {}, el('div', {}, el('h2', {}, '🏆 Challenges'), el('p', {}, 'Finish challenges to earn ⭐ stars for prizes!'))),
    ...cards,
    ...teasers,
  );
}

function start(challenge) {
  const finish = (details) => {
    logChallenge(challenge, details);
    celebrate(challenge.stars, `${challenge.emoji} ${challenge.title} complete!`);
    draw();
  };
  switch (challenge.type) {
    case 'web':
      openPage({ title: `${challenge.emoji} ${challenge.title}`, url: challenge.entry, color: challenge.color, challengeId: challenge.id, onComplete: finish });
      break;
    case 'book-log':
      startBookLog(challenge, finish);
      break;
    case 'checklist':
      startChecklist(challenge, finish);
      break;
    case 'recording':
      startRecording(challenge, finish);
      break;
    default:
      toast('This challenge type is not supported yet.');
  }
}
