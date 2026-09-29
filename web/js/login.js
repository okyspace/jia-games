// Main page before the app opens: app logo + "Who is playing?" kid login with photos.
import { el } from './kit.js';
import { profiles, signIn, createProfile, readImageFile, appLogo } from './profiles.js';
import { openSheet, toast } from './ui.js';
import { changeLogo } from './grownups.js';

export function avatar(profile, className = 'avatar') {
  return profile?.photo
    ? el('img.' + className, { src: profile.photo, alt: '' })
    : el('span.' + className + '.avatar-letter', { 'aria-hidden': 'true' }, (profile?.name || '?').slice(0, 1).toUpperCase());
}

export function logoNode(className = 'logo') {
  const logo = appLogo();
  return logo ? el('img.' + className, { src: logo, alt: 'App logo' }) : el('span.' + className + '.logo-default', { 'aria-hidden': 'true' }, '🦊');
}

/** Renders the login page into `root`. Calls onSignedIn() once a kid is in. */
export function renderLogin(root, onSignedIn) {
  const draw = () => {
    const list = profiles();
    root.replaceChildren(el('div.login', {},
      el('button.login-logo', { onclick: () => changeLogo(), 'aria-label': 'App logo (grown-ups can change it)' }, logoNode('logo-big')),
      el('h1', {}, 'Jia Games'),
      el('button.link-btn', { onclick: () => changeLogo() }, '📷 Grown-ups: change logo'),
      el('h2', {}, list.length ? 'Who is playing?' : 'Welcome! Make your player 👇'),
      el('div.profile-grid', {},
        list.map((profile) => el('button.profile-card', { onclick: () => askPassword(profile), 'data-profile': profile.name },
          avatar(profile, 'avatar-big'),
          el('span', {}, profile.name))),
        el('button.profile-card.new', { onclick: newPlayer },
          el('span.avatar-big.avatar-letter', { 'aria-hidden': 'true' }, '➕'),
          el('span', {}, 'New player'))),
    ));
  };

  const askPassword = (profile) => {
    openSheet({
      title: `Hi ${profile.name}! 👋`,
      content: (close) => {
        const password = el('input', { type: 'password', autocomplete: 'current-password', 'aria-label': 'Password', placeholder: 'My password' });
        const error = el('p.hint', { role: 'alert', style: { color: '#c92a2a' } });
        const submit = async (event) => {
          event.preventDefault();
          if (await signIn(profile.id, password.value)) {
            close();
            onSignedIn();
          } else {
            error.textContent = 'Oops, that is not the right password. Try again!';
            password.value = '';
            password.focus();
          }
        };
        setTimeout(() => password.focus(), 50);
        return el('form', { onsubmit: submit },
          el('div.login-avatar', {}, avatar(profile, 'avatar-big')),
          el('label.field', {}, '🔑 Password', password),
          error,
          el('button.btn.leaf.block', { type: 'submit' }, "Let's go! 🚀"),
          el('p.hint', {}, 'Forgot it? A grown-up can reset it in ⚙️ Grown-ups.'));
      },
    });
  };

  const newPlayer = () => {
    let photo = null;
    openSheet({
      title: '🌟 New player',
      content: (close) => {
        const preview = el('div.login-avatar', {}, el('span.avatar-big.avatar-letter', { 'aria-hidden': 'true' }, '📷'));
        const fileInput = el('input.sr-only', {
          type: 'file',
          accept: 'image/*',
          'aria-label': 'My photo',
          onchange: async () => {
            try {
              photo = await readImageFile(fileInput.files[0], 256, 'cover');
              preview.replaceChildren(el('img.avatar-big', { src: photo, alt: 'My photo' }));
            } catch (e) {
              toast(e.message);
            }
          },
        });
        const name = el('input', { autocomplete: 'username', placeholder: 'e.g. Jia', 'aria-label': 'My name' });
        const password = el('input', { type: 'password', autocomplete: 'new-password', 'aria-label': 'Password' });
        const again = el('input', { type: 'password', autocomplete: 'new-password', 'aria-label': 'Password again' });
        const error = el('p.hint', { role: 'alert', style: { color: '#c92a2a' } });
        const submit = async (event) => {
          event.preventDefault();
          if (password.value !== again.value) {
            error.textContent = 'The two passwords are not the same.';
            return;
          }
          try {
            await createProfile({ name: name.value, password: password.value, photo });
            close();
            onSignedIn();
          } catch (e) {
            error.textContent = e.message;
          }
        };
        return el('form', { onsubmit: submit },
          preview,
          el('div', { style: { textAlign: 'center', marginBottom: '14px' } },
            el('button.btn.small.white', { type: 'button', onclick: () => fileInput.click() }, '📷 Add my photo'),
            fileInput),
          el('label.field', {}, '😀 My name', name),
          el('label.field', {}, '🔑 Password', password, el('span.hint', {}, 'At least 4 letters or numbers. Only you should know it!')),
          el('label.field', {}, '🔑 Password again', again),
          error,
          el('button.btn.leaf.block', { type: 'submit' }, 'Make my player ✨'));
      },
    });
  };

  draw();
  window.addEventListener('jia:logo', draw);
}
