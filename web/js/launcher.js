// Opens a game or challenge page full-screen inside the app, with a Back bar on top.
import { el } from './kit.js';
import { pushBack } from './ui.js';

let current = null;

/**
 * @param {object} opts
 * @param {string} opts.title   Shown in the top bar.
 * @param {string} opts.url     Page to open, relative to the app root (e.g. "games/maze/index.html").
 * @param {string} [opts.color] Top bar colour.
 * @param {string} [opts.challengeId] If set, the page may report this challenge as complete.
 * @param {(details: object) => void} [opts.onComplete]
 */
export function openPage({ title, url, color, challengeId, onComplete }) {
  closePage();
  const frame = el('iframe.page-frame', { src: url, title, allow: 'microphone; autoplay' });
  const close = () => {
    removeBack();
    window.removeEventListener('message', onMessage);
    view.remove();
    current = null;
  };
  const onMessage = (event) => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
    const data = event.data || {};
    if (data.type === 'jia:challenge-complete' && challengeId && data.challengeId === challengeId) {
      close();
      onComplete?.(data.details || {});
    }
    if (data.type === 'jia:close') close();
  };
  const view = el('div.page-view', { role: 'dialog', 'aria-label': title },
    el('div.page-bar', { style: { background: color || 'var(--sun)' } },
      el('button.btn.white.small', { onclick: close, 'aria-label': 'Back' }, '⬅ Back'),
      el('h2', {}, title),
    ),
    frame,
  );
  window.addEventListener('message', onMessage);
  document.body.append(view);
  const removeBack = pushBack(close);
  current = { close, frame };
  return current;
}

export function closePage() {
  current?.close();
}
