// Draw tab: finger painting with crayons, brush sizes, eraser, undo; drawings are saved in the app
// (and can be copied to the phone's gallery).
import { el, uid } from '../kit.js';
import { putItem, listItems, deleteItem } from '../db.js';
import { currentUserId } from '../profiles.js';
import { saveImageToDevice, isAndroid } from '../native.js';
import { openSheet, toast, confirmDialog } from '../ui.js';

const CRAYONS = ['#2B2D42', '#FF6B6B', '#FF8C42', '#FFD23F', '#7ED957', '#4ECDC4', '#3A86FF', '#A78BFA', '#FF6B9D', '#8D5524', '#FFFFFF'];
const SIZES = [{ label: '•', size: 4 }, { label: '●', size: 10 }, { label: '⬤', size: 22 }];
const WIDTH = 1200;
const HEIGHT = 900;

let canvas;
let ctx;
let color = CRAYONS[1];
let size = SIZES[1].size;
let erasing = false;
let undoStack = [];
let gallery;
let editingId = null;
let dirty = false;

export function render(container) {
  canvas = el('canvas', { width: WIDTH, height: HEIGHT, 'aria-label': 'Drawing area' });
  ctx = canvas.getContext('2d');
  clearCanvas();

  const crayons = CRAYONS.map((c) => el('button.crayon', {
    style: { background: c },
    'aria-label': `Colour ${c}`,
    onclick: () => { color = c; erasing = false; refreshTools(); },
  }));
  const sizeButtons = SIZES.map((s) => el('button.tool', { 'aria-label': `Brush size ${s.size}`, onclick: () => { size = s.size; refreshTools(); } }, s.label));
  const eraser = el('button.tool', { 'aria-label': 'Eraser', onclick: () => { erasing = true; refreshTools(); } }, '🧽');
  const refreshTools = () => {
    crayons.forEach((b, i) => b.classList.toggle('selected', !erasing && CRAYONS[i] === color));
    sizeButtons.forEach((b, i) => b.classList.toggle('selected', SIZES[i].size === size));
    eraser.classList.toggle('selected', erasing);
  };
  refreshTools();

  setupPointer();

  gallery = el('div.gallery');
  container.append(
    el('div.tab-title', {},
      el('div', {}, el('h2', {}, '🎨 Draw'), el('p', {}, 'Draw anything you like, then save it!')),
      el('div.inline-form', {},
        el('button.btn.small.white', { onclick: newDrawing, 'aria-label': 'New drawing' }, '📄 New'),
        el('button.btn.small.leaf', { onclick: save }, '💾 Save'))),
    el('div.draw-wrap', {},
      el('div.toolbar', {}, crayons),
      el('div.toolbar', {}, sizeButtons, eraser,
        el('button.tool', { 'aria-label': 'Undo', onclick: undo }, '↩️'),
        el('button.tool', { 'aria-label': 'Clear', onclick: async () => {
          if (await confirmDialog({ title: 'Clear the page?', yes: 'Clear', no: 'Keep', danger: true })) { snapshot(); clearCanvas(); }
        } }, '🗑️')),
      el('div.draw-canvas-box', {}, canvas)),
    el('h3.section-title', {}, '🖼️ My drawings'),
    gallery,
  );
  loadGallery();
}

function clearCanvas() {
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  dirty = true;
}

function snapshot() {
  undoStack.push(ctx.getImageData(0, 0, WIDTH, HEIGHT));
  if (undoStack.length > 20) undoStack.shift();
}

function undo() {
  const last = undoStack.pop();
  if (last) ctx.putImageData(last, 0, 0);
}

function setupPointer() {
  let drawing = false;
  let last = null;
  const point = (event) => {
    const rect = canvas.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * WIDTH, y: ((event.clientY - rect.top) / rect.height) * HEIGHT };
  };
  const stroke = (from, to) => {
    ctx.strokeStyle = erasing ? '#FFFFFF' : color;
    ctx.lineWidth = erasing ? size * 2.5 : size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };
  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    snapshot();
    drawing = true;
    dirty = true;
    last = point(event);
    stroke(last, { x: last.x + 0.01, y: last.y });
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drawing) return;
    const p = point(event);
    stroke(last, p);
    last = p;
  });
  const end = () => { drawing = false; last = null; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
}

function toBlob() {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

async function save() {
  const blob = await toBlob();
  const id = editingId || uid();
  await putItem('drawings', { id, userId: currentUserId(), createdAt: new Date().toISOString(), blob });
  editingId = id;
  dirty = false;
  toast('Drawing saved 🎨');
  loadGallery();
}

async function newDrawing() {
  if (dirty && !(await confirmDialog({ title: 'Start a new drawing?', text: 'Anything not saved will be lost.', yes: 'New page', no: 'Go back' }))) return;
  undoStack = [];
  editingId = null;
  clearCanvas();
  dirty = false;
}

async function loadGallery() {
  const items = await listItems('drawings', currentUserId());
  gallery.querySelectorAll('img').forEach((img) => URL.revokeObjectURL(img.src));
  gallery.replaceChildren(...(items.length
    ? items.map((item) => el('button', { onclick: () => view(item), 'aria-label': 'Open drawing' },
      el('img', { src: URL.createObjectURL(item.blob), alt: '' })))
    : [el('p.hint', {}, 'No drawings saved yet.')]));
}

function view(item) {
  const url = URL.createObjectURL(item.blob);
  openSheet({
    title: '🖼️ My drawing',
    onClose: () => URL.revokeObjectURL(url),
    content: (close) => el('div', {},
      el('img.viewer-img', { src: url, alt: 'Saved drawing' }),
      el('div.row-actions', {},
        el('button.btn.small.berry', { onclick: async () => {
          if (!(await confirmDialog({ title: 'Delete this drawing?', yes: 'Delete', no: 'Keep', danger: true }))) return;
          await deleteItem('drawings', item.id);
          if (editingId === item.id) editingId = null;
          close();
          loadGallery();
        } }, '🗑️ Delete'),
        el('button.btn.small.mint', { onclick: async () => {
          const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(item.blob);
          });
          const ok = await saveImageToDevice(dataUrl, 'jia-drawing-' + item.id);
          toast(ok ? (isAndroid ? 'Saved to your Pictures 📱' : 'Downloaded 📥') : 'Could not save to the phone');
        } }, isAndroid ? '📱 Save to phone' : '📥 Download'),
        el('button.btn.small.leaf', { onclick: () => {
          const img = new Image();
          img.onload = () => {
            snapshot();
            ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
            editingId = item.id;
            dirty = false;
            close();
          };
          img.src = url;
        } }, '✏️ Keep drawing'))),
  });
}
