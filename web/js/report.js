// Progress report as Markdown, saved on the phone (Download/JiaGames/jia-games-progress.md).
// It lists, for every kid: star balance, challenges done, stars earned and used, prizes claimed.
// On Android it is re-saved automatically whenever stars change, so the file is always current.
import { local } from './kit.js';
import { profiles } from './profiles.js';
import { saveTextToDevice, isAndroid } from './native.js';

export const REPORT_FILE = 'jia-games-progress.md';

const cell = (text) => String(text ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const when = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export function buildReport(now = new Date()) {
  const lines = ['# Jia Games progress', '', `_Updated ${when(now.toISOString())}_`, ''];
  const kids = profiles();
  if (!kids.length) lines.push('No players yet.');

  for (const kid of kids) {
    const stars = local.get(`u.${kid.id}.stars`, []);
    const log = local.get(`u.${kid.id}.challengeLog`, []);
    const claims = local.get(`u.${kid.id}.claims`, []);
    const earned = stars.filter((s) => s.amount > 0).reduce((a, s) => a + s.amount, 0);
    const used = stars.filter((s) => s.amount < 0).reduce((a, s) => a - s.amount, 0);

    lines.push(`## ${kid.name}`, '');
    lines.push(`- ⭐ Stars now: **${earned - used}**`, `- Stars earned: ${earned}`, `- Stars used: ${used}`, `- Challenges done: ${log.length}`, '');

    lines.push('### Challenges done', '');
    if (log.length) {
      lines.push('| When | Challenge | Stars |', '| --- | --- | --- |');
      for (const entry of [...log].reverse()) {
        const title = entry.title || entry.challengeId;
        const extra = entry.details?.bookTitle || entry.details?.recordingTitle;
        lines.push(`| ${when(entry.at)} | ${cell(title)}${extra ? ` (${cell(extra)})` : ''} | +${entry.stars} |`);
      }
    } else lines.push('None yet.');
    lines.push('');

    lines.push('### Stars earned and used', '');
    if (stars.length) {
      lines.push('| When | What | Stars |', '| --- | --- | --- |');
      for (const s of [...stars].reverse()) lines.push(`| ${when(s.at)} | ${cell(s.reason)} | ${s.amount > 0 ? '+' : ''}${s.amount} |`);
    } else lines.push('None yet.');
    lines.push('');

    lines.push('### Prizes claimed', '');
    if (claims.length) {
      lines.push('| When | Prize | Stars | Status |', '| --- | --- | --- | --- |');
      for (const c of claims) lines.push(`| ${when(c.at)} | ${cell(c.emoji)} ${cell(c.title)} | -${c.cost} | ${c.status === 'given' ? 'Received' : 'Waiting'} |`);
    } else lines.push('None yet.');
    lines.push('');
  }
  return lines.join('\n');
}

/** Save the report now (returns a Promise<boolean>). `manual` downloads it in a browser; auto-saves only happen in the Android app. */
export function saveReport({ manual = false } = {}) {
  return saveTextToDevice(REPORT_FILE, buildReport(), 'text/markdown', { download: manual });
}

let timer;
export function startAutoReport() {
  if (!isAndroid) return;
  const soon = () => {
    clearTimeout(timer);
    timer = setTimeout(() => saveReport(), 1500);
  };
  window.addEventListener('jia:stars', soon);
  window.addEventListener('jia:prizes', soon);
}
