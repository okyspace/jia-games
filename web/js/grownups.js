// Grown-ups area (behind the PIN): app logo, players, prizes to hand out, progress report, PIN.
import { el } from './kit.js';
import { openSheet, askGrownUp, toast, confirmDialog } from './ui.js';
import { setParentPin, starHistory, claims, markClaimGiven } from './store.js';
import { profiles, resetPassword, deleteProfile, currentUserId, appLogo, setAppLogo, readImageFile } from './profiles.js';
import { saveReport, REPORT_FILE } from './report.js';
import { isAndroid } from './native.js';

function pickImage() {
  return new Promise((resolve) => {
    const input = el('input', { type: 'file', accept: 'image/*' });
    input.addEventListener('change', () => resolve(input.files[0] || null));
    input.click();
  });
}

async function uploadLogo() {
  const file = await pickImage();
  if (!file) return false;
  try {
    setAppLogo(await readImageFile(file, 256, 'contain'));
    toast('New logo saved 🎨');
    return true;
  } catch (e) {
    toast(e.message);
    return false;
  }
}

/** Tap on the logo: a grown-up can upload a new one. */
export async function changeLogo() {
  if (!(await askGrownUp('Grown-ups can change the app logo.'))) return;
  await uploadLogo();
}

export async function openGrownUps() {
  if (!(await askGrownUp('Grown-ups only! Please enter the PIN.'))) return;
  openSheet({ title: '⚙️ Grown-ups', content: () => grownUpsContent() });
}

function grownUpsContent() {
  const wrap = el('div.stack');

  // App logo
  const logoPreview = el('div.logo-preview');
  const drawLogo = () => logoPreview.replaceChildren(appLogo() ? el('img', { src: appLogo(), alt: 'App logo' }) : el('span', {}, '🦊'));
  drawLogo();
  wrap.append(
    el('h3', {}, '🖼️ App logo'),
    el('div.list-row', {},
      logoPreview,
      el('div.inline-form', {},
        el('button.btn.small.grape', { onclick: async () => { if (await uploadLogo()) drawLogo(); } }, 'Upload'),
        el('button.btn.small.white', { onclick: () => { setAppLogo(null); drawLogo(); } }, 'Reset'))),
  );

  // Prizes waiting to be handed over, for every player
  const claimList = el('div.stack');
  const renderClaims = () => {
    const pending = profiles().flatMap((p) => claims(p.id).filter((c) => c.status === 'waiting').map((c) => ({ ...c, player: p })));
    claimList.replaceChildren(
      ...(pending.length
        ? pending.map((c) => el('div.list-row', {},
          el('span', {}, `${c.emoji} ${c.title}`, el('br'), el('small.hint', {}, `for ${c.player.name}`)),
          el('button.btn.small.leaf', { onclick: () => { markClaimGiven(c.id, c.player.id); renderClaims(); toast('Marked as given 🎁'); } }, 'Given ✓')))
        : [el('p.hint', {}, 'No prizes waiting.')]),
    );
  };
  renderClaims();
  wrap.append(el('h3', {}, '🎁 Prizes to hand out'), claimList);

  // Players
  const playerList = el('div.stack');
  const renderPlayers = () => {
    playerList.replaceChildren(...profiles().map((p) => {
      const newPass = el('input', { type: 'password', placeholder: 'New password', 'aria-label': `New password for ${p.name}` });
      return el('div.list-row.player-row', {},
        el('strong', {}, p.name + (p.id === currentUserId() ? ' (playing now)' : '')),
        el('div.inline-form', {},
          newPass,
          el('button.btn.small.white', {
            onclick: async () => {
              try {
                await resetPassword(p.id, newPass.value);
                newPass.value = '';
                toast(`Password changed for ${p.name}`);
              } catch (e) { toast(e.message); }
            },
          }, 'Set'),
          el('button.btn.small.berry', {
            'aria-label': `Delete ${p.name}`,
            onclick: async () => {
              const yes = await confirmDialog({ title: `Delete ${p.name}?`, text: 'Their stars and notes on this phone will be hidden.', yes: 'Delete', no: 'Keep', danger: true });
              if (!yes) return;
              const wasMe = p.id === currentUserId();
              deleteProfile(p.id);
              if (wasMe) location.reload();
              else renderPlayers();
            },
          }, '🗑️')));
    }));
  };
  renderPlayers();
  wrap.append(el('h3', {}, '👧 Players'), playerList);

  // Progress report
  wrap.append(
    el('h3', {}, '📄 Progress report'),
    el('p.hint', {}, isAndroid
      ? `Saved on this phone as Download/JiaGames/${REPORT_FILE} and updated every time stars change.`
      : `Downloads ${REPORT_FILE} with every player's challenges, stars and prizes.`),
    el('button.btn.small.mint', {
      onclick: async () => toast((await saveReport({ manual: true })) ? 'Report saved 📄' : 'Could not save the report'),
    }, 'Save report now'),
  );

  // Change PIN
  const pinInput = el('input', { type: 'password', inputmode: 'numeric', maxlength: '4', pattern: '[0-9]*', placeholder: '4 digits', 'aria-label': 'New PIN' });
  wrap.append(
    el('h3', {}, '🔒 Change grown-up PIN'),
    el('div.inline-form', {},
      pinInput,
      el('button.btn.small.grape', {
        onclick: () => {
          if (!/^\d{4}$/.test(pinInput.value)) { toast('The PIN needs 4 digits'); return; }
          setParentPin(pinInput.value);
          pinInput.value = '';
          toast('PIN changed ✅');
        },
      }, 'Save'),
    ),
  );

  // Star history of the player who is signed in
  const history = starHistory().slice().reverse().slice(0, 50);
  wrap.append(
    el('h3', {}, '⭐ Star history (this player)'),
    history.length
      ? el('div.stack', {}, history.map((h) => el('div.list-row', {},
        el('span', {}, h.reason, el('br'), el('small.hint', {}, new Date(h.at).toLocaleString())),
        el('strong', { style: { color: h.amount > 0 ? '#2f9e44' : '#e03131' } }, (h.amount > 0 ? '+' : '') + h.amount))))
      : el('p.hint', {}, 'No stars yet.'),
  );
  return wrap;
}
