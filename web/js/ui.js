// App-shell UI pieces: sheets (dialogs), toasts, confirm, grown-up PIN gate, star celebration.
import { el, confetti, sfx } from './kit.js';
import { parentPin, DEFAULT_PIN } from './store.js';

// Things that the Android back button (or Escape) should close, top-most last.
const backStack = [];

export function pushBack(closer) {
  backStack.push(closer);
  return () => {
    const i = backStack.lastIndexOf(closer);
    if (i >= 0) backStack.splice(i, 1);
  };
}

/** Closes the top-most sheet/page. Returns true if something was closed. */
export function closeTop() {
  const closer = backStack.pop();
  if (!closer) return false;
  closer();
  return true;
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeTop();
});

/**
 * Open a bottom sheet dialog. `content` is a node (or a function receiving `close`).
 * Returns { close, body }.
 */
export function openSheet({ title, content, onClose, className = '' }) {
  let removeBack;
  const close = () => {
    removeBack?.();
    backdrop.classList.add('closing');
    setTimeout(() => backdrop.remove(), 180);
    onClose?.();
  };
  const body = el('div.sheet-body');
  const sheet = el('div.sheet' + (className ? '.' + className : ''), { role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    el('div.sheet-head', {},
      el('h2', {}, title),
      el('button.icon-btn', { 'aria-label': 'Close', onclick: () => close() }, '✖'),
    ),
    body,
  );
  const backdrop = el('div.sheet-backdrop', {
    onclick: (event) => { if (event.target === backdrop) close(); },
  }, sheet);
  body.append(typeof content === 'function' ? content(close) : content);
  document.body.append(backdrop);
  removeBack = pushBack(close);
  return { close, body };
}

export function toast(message) {
  const node = el('div.toast.bounce-in', { role: 'status' }, message);
  document.body.append(node);
  setTimeout(() => node.remove(), 2600);
}

export function confirmDialog({ title, text, yes = 'Yes', no = 'No', danger = false }) {
  return new Promise((resolve) => {
    let answered = false;
    const { close } = openSheet({
      title,
      onClose: () => { if (!answered) resolve(false); },
      content: (closeSheet) => el('div', {},
        text ? el('p', {}, text) : null,
        el('div.row-actions', {},
          el('button.btn.white', { onclick: () => { answered = true; resolve(false); closeSheet(); } }, no),
          el('button.btn' + (danger ? '.berry' : '.leaf'), { onclick: () => { answered = true; resolve(true); closeSheet(); } }, yes),
        ),
      ),
    });
    return close;
  });
}

/** Ask for the grown-up PIN. Resolves true when the right PIN is entered. */
export function askGrownUp(reason = 'A grown-up needs to check this.') {
  return new Promise((resolve) => {
    let entered = '';
    let done = false;
    const dots = el('div.pin-dots', { 'aria-live': 'polite' });
    const renderDots = () => {
      dots.replaceChildren(...[0, 1, 2, 3].map((i) => el('span' + (i < entered.length ? '.on' : ''))));
    };
    renderDots();

    const { close } = openSheet({
      title: '👩 Grown-up check',
      className: 'pin-sheet',
      onClose: () => { if (!done) resolve(false); },
      content: (closeSheet) => {
        const press = (digit) => {
          if (entered.length >= 4) return;
          entered += digit;
          renderDots();
          if (entered.length === 4) {
            if (entered === parentPin()) {
              done = true;
              resolve(true);
              closeSheet();
            } else {
              sfx.bad();
              dots.classList.remove('shake');
              void dots.offsetWidth;
              dots.classList.add('shake');
              entered = '';
              setTimeout(renderDots, 250);
            }
          }
        };
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k) => {
          if (!k) return el('span');
          return el('button.key', {
            'aria-label': k === '⌫' ? 'Delete' : k,
            onclick: () => {
              if (k === '⌫') { entered = entered.slice(0, -1); renderDots(); } else press(k);
            },
          }, k);
        });
        const hint = parentPin() === DEFAULT_PIN
          ? el('p.hint', {}, `First time? The PIN is ${DEFAULT_PIN}. Change it in ⚙️ Grown-ups.`)
          : null;
        return el('div', {}, el('p', {}, reason), dots, el('div.pin-pad', {}, keys), hint);
      },
    });
    return close;
  });
}

export function celebrate(stars, title = 'Challenge complete!') {
  sfx.win();
  confetti();
  openSheet({
    title: '🎉 Hooray!',
    content: (close) => el('div.celebrate', {},
      el('div.big-star.bounce-in', {}, '⭐'),
      el('h3', {}, title),
      el('p', {}, `You earned ${stars} stars!`),
      el('button.btn.leaf.block', { onclick: close }, 'Yay! 🙌'),
    ),
  });
}
