// Built-in challenge types that run inside the app (not as a separate web page):
//   book-log  – log a book you read (name, author, pages, what it is about, what you liked)
//   checklist – tick every step of a chore, then a grown-up checks
//   recording – read a Chinese paragraph aloud and save the recording into My Book
import { el, uid } from './kit.js';
import { openSheet, askGrownUp, toast } from './ui.js';
import { addBook, books } from './store.js';
import { putItem } from './db.js';
import { currentUserId } from './profiles.js';

function wordCount(text) {
  // Count English words; Chinese characters count one each.
  const cjk = (text.match(/[一-鿿]/g) || []).length;
  const words = text.replace(/[一-鿿]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return words + cjk;
}

async function grownUpOk(challenge) {
  if (!challenge.parentCheck) return true;
  return askGrownUp(`Please check “${challenge.title}” before the stars are given.`);
}

export function startBookLog(challenge, finish) {
  const minPages = challenge.minPages || 50;
  openSheet({
    title: `${challenge.emoji} ${challenge.title}`,
    content: (close) => {
      const title = el('input', { name: 'title', placeholder: 'e.g. Charlotte’s Web', autocomplete: 'off' });
      const author = el('input', { name: 'author', placeholder: 'e.g. E. B. White', autocomplete: 'off' });
      const pages = el('input', { name: 'pages', type: 'number', min: '1', inputmode: 'numeric', placeholder: String(minPages) });
      const about = el('textarea', { name: 'about', placeholder: 'The story is about…' });
      const liked = el('textarea', { name: 'liked', placeholder: 'I liked it because…' });
      const error = el('p.hint', { role: 'alert', style: { color: '#c92a2a' } });

      const submit = async (event) => {
        event.preventDefault();
        const book = {
          title: title.value.trim(),
          author: author.value.trim(),
          pages: Number(pages.value),
          about: about.value.trim(),
          liked: liked.value.trim(),
        };
        let problem = '';
        if (!book.title) problem = 'Write the name of the book.';
        else if (!book.author) problem = 'Write who wrote the book (the author).';
        else if (!(book.pages >= minPages)) problem = `The book needs at least ${minPages} pages.`;
        else if (wordCount(book.about) < 15) problem = 'Tell us a bit more about the story (at least 15 words).';
        else if (wordCount(book.liked) < 5) problem = 'Tell us what you liked (at least 5 words).';
        else if (books().some((b) => b.title.toLowerCase() === book.title.toLowerCase())) problem = 'You already logged this book. Read a new one! 📚';
        error.textContent = problem;
        if (problem) return;
        if (!(await grownUpOk(challenge))) return;
        addBook(book);
        close();
        finish({ bookTitle: book.title });
      };

      return el('form', { onsubmit: submit },
        el('label.field', {}, '📕 Book name', title),
        el('label.field', {}, '✍️ Author', author),
        el('label.field', {}, '📄 Number of pages', pages, el('span.hint', {}, `At least ${minPages} pages.`)),
        el('label.field', {}, '🗺️ What is the story about?', about),
        el('label.field', {}, '💖 What did you like about the book?', liked),
        error,
        el('button.btn.leaf.block', { type: 'submit' }, 'Save to My Book ⭐'));
    },
  });
}

export function startChecklist(challenge, finish) {
  openSheet({
    title: `${challenge.emoji} ${challenge.title}`,
    content: (close) => {
      const done = el('button.btn.leaf.block', { disabled: true }, 'All done! ⭐');
      const boxes = challenge.steps.map((step) => el('input', { type: 'checkbox', onchange: () => {
        done.disabled = !boxes.every((b) => b.checked);
      } }));
      done.addEventListener('click', async () => {
        if (!(await grownUpOk(challenge))) return;
        close();
        finish({});
      });
      return el('div', {},
        el('p', {}, challenge.description),
        el('div.stack.checklist', {}, challenge.steps.map((step, i) => el('label', {}, boxes[i], step))),
        el('div', { style: { height: '16px' } }),
        done);
    },
  });
}

export async function startRecording(challenge, finish) {
  const { paragraphs } = await (await fetch('challenges/chinese-paragraphs.json')).json();
  let chosen = paragraphs[0];
  let recorder = null;
  let stream = null;
  let chunks = [];
  let blob = null;
  let timer = null;

  const stopStream = () => {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    clearInterval(timer);
  };

  openSheet({
    title: `${challenge.emoji} ${challenge.title}`,
    onClose: () => { if (recorder?.state === 'recording') recorder.stop(); stopStream(); },
    content: (close) => {
      const paragraphBox = el('div.paragraph', { lang: 'zh' });
      const ownTitle = el('input', { placeholder: '书名 / Book name', autocomplete: 'off' });
      const ownField = el('label.field.hidden', {}, 'Which book are you reading from?', ownTitle);
      const choose = el('select', {
        'aria-label': 'Choose a paragraph',
        onchange: () => {
          chosen = paragraphs.find((p) => p.id === choose.value) || null;
          ownField.classList.toggle('hidden', !!chosen);
          paragraphBox.classList.toggle('hidden', !chosen);
          if (chosen) paragraphBox.textContent = chosen.text;
        },
      },
      paragraphs.map((p) => el('option', { value: p.id }, `《${p.title}》`)),
      el('option', { value: 'own' }, '📘 My own book'));
      paragraphBox.textContent = chosen.text;

      const clock = el('p.hint', {}, 'Tap the red button and start reading.');
      const player = el('audio.hidden', { controls: true });
      const save = el('button.btn.leaf.block', { disabled: true }, 'Save to My Book ⭐');
      const recordBtn = el('button.record-btn', { 'aria-label': 'Record' }, '🎙️');

      recordBtn.addEventListener('click', async () => {
        if (recorder?.state === 'recording') {
          recorder.stop();
          return;
        }
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          toast('Please allow the microphone to record 🎙️');
          return;
        }
        chunks = [];
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
        recorder.onstop = () => {
          stopStream();
          blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          player.src = URL.createObjectURL(blob);
          player.classList.remove('hidden');
          recordBtn.classList.remove('recording');
          recordBtn.textContent = '🎙️';
          recordBtn.setAttribute('aria-label', 'Record');
          clock.textContent = 'Listen to yourself! Record again or save it.';
          save.disabled = false;
        };
        recorder.start();
        const started = Date.now();
        recordBtn.classList.add('recording');
        recordBtn.textContent = '⏹️';
        recordBtn.setAttribute('aria-label', 'Stop recording');
        clock.textContent = 'Recording… 0s (tap to stop)';
        timer = setInterval(() => {
          clock.textContent = `Recording… ${Math.round((Date.now() - started) / 1000)}s (tap to stop)`;
        }, 500);
      });

      save.addEventListener('click', async () => {
        if (!blob) return;
        const title = chosen ? chosen.title : ownTitle.value.trim();
        if (!title) { toast('Write the book name first 📘'); return; }
        if (!(await grownUpOk(challenge))) return;
        await putItem('recordings', {
          id: uid(),
          userId: currentUserId(),
          createdAt: new Date().toISOString(),
          title,
          text: chosen ? chosen.text : '',
          blob,
          type: blob.type,
        });
        close();
        finish({ recordingTitle: title });
      });

      return el('div.record-box', {},
        el('label.field', {}, 'Choose what to read 选一段', choose),
        paragraphBox,
        ownField,
        el('div', { style: { height: '16px' } }),
        recordBtn,
        clock,
        player,
        el('div', { style: { height: '12px' } }),
        save);
    },
  });
}
