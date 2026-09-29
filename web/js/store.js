// App data kept on the device (localStorage). Big files (drawings, recordings) live in db.js.
import { local, uid } from './kit.js';
import { currentUserId } from './profiles.js';

// Each kid's own data is saved under their profile id; prizes and the PIN are shared.
const mine = {
  get: (key, fallback) => local.get(`u.${currentUserId()}.${key}`, fallback),
  set: (key, value) => local.set(`u.${currentUserId()}.${key}`, value),
};

export const DEFAULT_PIN = '1234';

export const DEFAULT_PRIZES = [
  { id: 'screen-30', emoji: '📺', title: '30 minutes of screen time', cost: 20 },
  { id: 'pick-dinner', emoji: '🍕', title: 'Choose what we eat for dinner', cost: 30 },
  { id: 'park-trip', emoji: '🛝', title: 'A trip to the playground', cost: 40 },
  { id: 'small-toy', emoji: '🧸', title: 'A small toy', cost: 60 },
];

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

// ---------- Stars ----------
export function starHistory() {
  return mine.get('stars', []);
}

export function starBalance() {
  return starHistory().reduce((sum, entry) => sum + entry.amount, 0);
}

function addStarEntry(amount, reason) {
  const history = starHistory();
  history.push({ id: uid(), at: new Date().toISOString(), amount, reason });
  mine.set('stars', history);
  emit('jia:stars', { balance: starBalance(), change: amount });
}

export function earnStars(amount, reason) {
  addStarEntry(Math.abs(amount), reason);
}

export function spendStars(amount, reason) {
  if (starBalance() < amount) return false;
  addStarEntry(-Math.abs(amount), reason);
  return true;
}

// ---------- Challenges ----------
export function challengeLog() {
  return mine.get('challengeLog', []);
}

export function logChallenge(challenge, details = {}) {
  const log = challengeLog();
  log.push({ id: uid(), challengeId: challenge.id, title: challenge.title, at: new Date().toISOString(), stars: challenge.stars, details });
  mine.set('challengeLog', log);
  earnStars(challenge.stars, `Challenge: ${challenge.title}`);
}

export function timesCompleted(challengeId) {
  return challengeLog().filter((e) => e.challengeId === challengeId).length;
}

export function completedToday(challengeId, now = new Date()) {
  const today = now.toDateString();
  return challengeLog().some((e) => e.challengeId === challengeId && new Date(e.at).toDateString() === today);
}

// ---------- Prizes ----------
export function prizes() {
  return local.get('prizes', DEFAULT_PRIZES);
}

export function savePrizes(list) {
  local.set('prizes', list);
  emit('jia:prizes');
}

export function claims(userId = currentUserId()) {
  return local.get(`u.${userId}.claims`, []);
}

export function claimPrize(prize) {
  if (!spendStars(prize.cost, `Prize: ${prize.title}`)) return false;
  const list = claims();
  list.unshift({ id: uid(), prizeId: prize.id, emoji: prize.emoji, title: prize.title, cost: prize.cost, at: new Date().toISOString(), status: 'waiting' });
  mine.set('claims', list);
  emit('jia:prizes');
  return true;
}

export function markClaimGiven(claimId, userId = currentUserId()) {
  local.set(`u.${userId}.claims`, claims(userId).map((c) => (c.id === claimId ? { ...c, status: 'given', givenAt: new Date().toISOString() } : c)));
  emit('jia:prizes');
}

// ---------- Notes ----------
export function notes() {
  return mine.get('notes', []);
}

export function saveNote(note) {
  const list = notes();
  const now = new Date().toISOString();
  const index = list.findIndex((n) => n.id === note.id);
  if (index >= 0) list[index] = { ...list[index], ...note, updatedAt: now };
  else list.unshift({ ...note, id: note.id || uid(), createdAt: now, updatedAt: now });
  mine.set('notes', list);
}

export function deleteNote(id) {
  mine.set('notes', notes().filter((n) => n.id !== id));
}

// ---------- Book logs ----------
export function books() {
  return mine.get('books', []);
}

export function addBook(book) {
  const list = books();
  list.unshift({ ...book, id: uid(), at: new Date().toISOString() });
  mine.set('books', list);
}

// ---------- Grown-up PIN ----------
export function parentPin() {
  return local.get('parentPin', DEFAULT_PIN);
}

export function setParentPin(pin) {
  local.set('parentPin', pin);
}
