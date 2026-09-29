// Notes tab: kids write their own sticky notes.
import { el } from '../kit.js';
import { notes, saveNote, deleteNote } from '../store.js';
import { openSheet, confirmDialog } from '../ui.js';

const COLORS = ['#FFF3A3', '#FFD1E3', '#C9ECFF', '#D4F7C5', '#E5DBFF', '#FFE0C2'];
const COLOR_NAMES = ['Yellow', 'Pink', 'Blue', 'Green', 'Purple', 'Orange'];
let container;

export function render(target) {
  container = target;
  draw();
}

function draw() {
  const list = notes();
  container.replaceChildren(
    el('div.tab-title', {},
      el('div', {}, el('h2', {}, '📝 My Notes'), el('p', {}, 'Write down ideas, stories and secrets!')),
      el('button.btn.leaf', { onclick: () => edit() }, '➕ New note')),
    list.length
      ? el('div.notes-grid', {}, list.map((note) => el('button.note', {
        style: { '--note-color': note.color },
        onclick: () => edit(note),
      },
      el('h3', {}, note.title || 'Untitled'),
      el('p', {}, note.body),
      el('small', {}, new Date(note.updatedAt).toLocaleDateString()))))
      : el('div.empty', {}, el('div.big', {}, '✏️'), el('p', {}, 'No notes yet. Tap “New note” to write one!')),
  );
}

function edit(note = null) {
  let color = note?.color || COLORS[0];
  openSheet({
    title: note ? '✏️ Edit note' : '📝 New note',
    content: (close) => {
      const title = el('input', { placeholder: 'Title', value: note?.title || '', 'aria-label': 'Title' });
      const body = el('textarea', { placeholder: 'Write here…', 'aria-label': 'Note', style: { minHeight: '200px' } }, note?.body || '');
      const dots = COLORS.map((c) => el('button.color-dot' + (c === color ? '.selected' : ''), {
        type: 'button',
        style: { background: c },
        'aria-label': `${COLOR_NAMES[COLORS.indexOf(c)]} paper`,
        onclick: () => { color = c; dots.forEach((d) => d.classList.toggle('selected', d === dot(c))); },
      }));
      const dot = (c) => dots[COLORS.indexOf(c)];
      const save = () => {
        if (!title.value.trim() && !body.value.trim()) { close(); return; }
        saveNote({ id: note?.id, title: title.value.trim(), body: body.value, color });
        close();
        draw();
      };
      const remove = async () => {
        if (await confirmDialog({ title: 'Delete this note?', text: 'It will be gone forever.', yes: 'Delete', no: 'Keep it', danger: true })) {
          deleteNote(note.id);
          close();
          draw();
        }
      };
      return el('div', {},
        el('label.field', {}, 'Title', title),
        el('label.field', {}, 'Note', body),
        el('div.field', {}, 'Colour', el('div.color-choices', {}, dots)),
        el('div.row-actions', {},
          note ? el('button.btn.berry', { onclick: remove }, '🗑️ Delete') : null,
          el('button.btn.leaf', { onclick: save }, '💾 Save')));
    },
  });
}
