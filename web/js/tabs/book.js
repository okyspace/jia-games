// My Book tab: the books a kid has logged and their Chinese read-aloud recordings.
import { el } from '../kit.js';
import { books } from '../store.js';
import { listItems, deleteItem } from '../db.js';
import { currentUserId } from '../profiles.js';
import { confirmDialog } from '../ui.js';

let container;
let urls = [];

export function render(target) {
  container = target;
  return draw();
}

export function onShow() {
  return draw();
}

async function draw() {
  urls.forEach((u) => URL.revokeObjectURL(u));
  urls = [];
  const bookList = books();
  const recordings = await listItems('recordings', currentUserId());

  container.replaceChildren(
    el('div.tab-title', {}, el('div', {}, el('h2', {}, '📚 My Book'), el('p', {}, 'Everything you read and recorded.'))),
    el('h3.section-title', {}, `📖 Books I read (${bookList.length})`),
    bookList.length
      ? el('div.stack', {}, bookList.map((b) => el('article.card.book-entry', {},
        el('h3', {}, `📕 ${b.title}`),
        el('p.hint', {}, `by ${b.author} · ${b.pages} pages · ${new Date(b.at).toLocaleDateString()}`),
        el('p', {}, el('span.label', {}, 'The story: '), b.about),
        el('p', {}, el('span.label', {}, 'What I liked: '), b.liked))))
      : el('div.empty', {}, el('div.big', {}, '📖'), el('p', {}, 'Do the “Book Explorer” challenge to add books here.')),
    el('h3.section-title', {}, `🎤 My read-aloud recordings (${recordings.length})`),
    recordings.length
      ? el('div.stack', {}, recordings.map((r) => {
        const url = URL.createObjectURL(r.blob);
        urls.push(url);
        return el('article.card.book-entry', { 'data-recording': r.id },
          el('h3', { lang: 'zh' }, `🎤 ${r.title}`),
          el('p.hint', {}, new Date(r.createdAt).toLocaleString()),
          r.text ? el('p', { lang: 'zh' }, r.text) : null,
          el('audio', { controls: true, src: url }),
          el('div.row-actions', {}, el('button.btn.small.white', {
            onclick: async () => {
              if (await confirmDialog({ title: 'Delete this recording?', yes: 'Delete', no: 'Keep', danger: true })) {
                await deleteItem('recordings', r.id);
                draw();
              }
            },
          }, '🗑️ Delete')));
      }))
      : el('div.empty', {}, el('div.big', {}, '🎤'), el('p', {}, 'Do the “读一读 Read Aloud” challenge to record here.')),
  );
}
