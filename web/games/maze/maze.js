// Mouse Maze: guide the mouse to the cheese. Each level makes the maze a bit bigger.
import { local, sfx, confetti, showOverlay, formatTime } from '../../js/kit.js';

const START_SIZE = 5;
const MAX_SIZE = 18;
const DIRS = {
  up: { dx: 0, dy: -1, wall: 'n' },
  down: { dx: 0, dy: 1, wall: 's' },
  left: { dx: -1, dy: 0, wall: 'w' },
  right: { dx: 1, dy: 0, wall: 'e' },
};
const OPPOSITE = { n: 's', s: 'n', e: 'w', w: 'e' };

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const ui = {
  level: document.getElementById('level'),
  moves: document.getElementById('moves'),
  time: document.getElementById('time'),
  best: document.getElementById('best'),
};

let level = 1;
let size;
let grid; // grid[y][x] = { n, s, e, w } (true = wall)
let player;
let trail;
let moves;
let startTime;
let won;

/** Build a perfect maze (exactly one path between any two cells) with a depth-first search. */
export function makeMaze(n) {
  const cells = Array.from({ length: n }, () => Array.from({ length: n }, () => ({ n: true, s: true, e: true, w: true, seen: false })));
  const stack = [{ x: 0, y: 0 }];
  cells[0][0].seen = true;
  while (stack.length) {
    const { x, y } = stack[stack.length - 1];
    const options = Object.values(DIRS)
      .map((d) => ({ ...d, nx: x + d.dx, ny: y + d.dy }))
      .filter(({ nx, ny }) => nx >= 0 && ny >= 0 && nx < n && ny < n && !cells[ny][nx].seen);
    if (!options.length) {
      stack.pop();
      continue;
    }
    const pick = options[Math.floor(Math.random() * options.length)];
    cells[y][x][pick.wall] = false;
    cells[pick.ny][pick.nx][OPPOSITE[pick.wall]] = false;
    cells[pick.ny][pick.nx].seen = true;
    stack.push({ x: pick.nx, y: pick.ny });
  }
  return cells.map((row) => row.map(({ n: north, s, e, w }) => ({ n: north, s, e, w })));
}

function startLevel() {
  size = Math.min(START_SIZE + level - 1, MAX_SIZE);
  grid = makeMaze(size);
  player = { x: 0, y: 0 };
  trail = [{ x: 0, y: 0 }];
  moves = 0;
  startTime = Date.now();
  won = false;
  ui.level.textContent = `Level ${level}`;
  ui.best.textContent = `🏅 Best: ${local.get('maze.bestLevel', 1)}`;
  updateHud();
  draw();
}

function updateHud() {
  ui.moves.textContent = `👣 ${moves}`;
  ui.time.textContent = `⏱️ ${formatTime((Date.now() - startTime) / 1000)}`;
}

function resize() {
  const box = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(box.width * ratio);
  canvas.height = Math.round(box.height * ratio);
  draw();
}

function draw() {
  if (!grid) return;
  const W = canvas.width;
  const cell = W / size;
  ctx.clearRect(0, 0, W, W);

  // Trail of footprints
  ctx.fillStyle = '#ffd23f88';
  for (const t of trail) {
    ctx.beginPath();
    ctx.arc((t.x + 0.5) * cell, (t.y + 0.5) * cell, cell * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }

  // Walls
  ctx.strokeStyle = '#6b4f2a';
  ctx.lineWidth = Math.max(3, cell * 0.12);
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const c = grid[y][x];
      const px = x * cell;
      const py = y * cell;
      if (c.n) { ctx.moveTo(px, py); ctx.lineTo(px + cell, py); }
      if (c.w) { ctx.moveTo(px, py); ctx.lineTo(px, py + cell); }
      if (y === size - 1 && c.s) { ctx.moveTo(px, py + cell); ctx.lineTo(px + cell, py + cell); }
      if (x === size - 1 && c.e) { ctx.moveTo(px + cell, py); ctx.lineTo(px + cell, py + cell); }
    }
  }
  ctx.stroke();

  // Cheese and mouse
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${cell * 0.7}px serif`;
  ctx.fillText('🧀', (size - 0.5) * cell, (size - 0.5) * cell);
  ctx.fillText('🐭', (player.x + 0.5) * cell, (player.y + 0.5) * cell);
}

function move(dirName) {
  if (won) return;
  const dir = DIRS[dirName];
  if (grid[player.y][player.x][dir.wall]) {
    sfx.bad();
    return;
  }
  player = { x: player.x + dir.dx, y: player.y + dir.dy };
  trail.push(player);
  moves++;
  sfx.tap();
  updateHud();
  draw();
  if (player.x === size - 1 && player.y === size - 1) win();
}

function win() {
  won = true;
  const seconds = (Date.now() - startTime) / 1000;
  local.set('maze.bestLevel', Math.max(local.get('maze.bestLevel', 1), level + 1));
  sfx.win();
  confetti(['🧀', '🐭', '⭐', '🎉']);
  showOverlay({
    emoji: '🧀',
    title: `Level ${level} done!`,
    text: `Yum! You found the cheese in ${moves} moves and ${formatTime(seconds)}.`,
    actions: [
      { label: 'Play again', className: 'white', onClick: startLevel },
      { label: 'Next level ➡️', className: 'leaf', onClick: () => { level++; startLevel(); } },
    ],
  });
}

// Controls: keyboard, on-screen arrows, swipe.
const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
document.addEventListener('keydown', (event) => {
  const dir = KEYS[event.key];
  if (dir && !document.querySelector('.overlay')) {
    event.preventDefault();
    move(dir);
  }
});
document.querySelectorAll('[data-dir]').forEach((button) => button.addEventListener('click', () => move(button.dataset.dir)));

let swipeStart = null;
canvas.addEventListener('pointerdown', (e) => { swipeStart = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointerup', (e) => {
  if (!swipeStart) return;
  const dx = e.clientX - swipeStart.x;
  const dy = e.clientY - swipeStart.y;
  swipeStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
  move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
});

setInterval(() => { if (!won && grid) updateHud(); }, 1000);
window.addEventListener('resize', resize);

// Read-only peek used by the automated tests.
window.mazeGame = { get grid() { return grid; }, get player() { return player; }, get size() { return size; } };

level = 1;
startLevel();
resize();
