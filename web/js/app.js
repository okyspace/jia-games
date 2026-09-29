// Jia Games app shell. Shows the login page until a kid signs in, then the header with
// logo + star counter, the tab panels and the bottom tab bar.
import { el } from './kit.js';
import { TABS } from './tabs.js';
import { starBalance } from './store.js';
import { closeTop, openSheet } from './ui.js';
import { openGrownUps, changeLogo } from './grownups.js';
import { currentProfile, signOut } from './profiles.js';
import { renderLogin, avatar, logoNode } from './login.js';
import { startAutoReport } from './report.js';
import { startWellbeing, isBreakShowing } from './wellbeing.js';

const root = document.getElementById('app');
const loaded = new Map(); // tab id -> module
let activeId = null;
let started = false;
// Replaced with the real implementation once the app has started.
let showTab = () => {};

// Called by the Android back button (MainActivity). Returns true if the app handled it.
window.jia = {
  handleBack() {
    if (isBreakShowing()) return true; // the break can't be skipped with the back button
    if (closeTop()) return true;
    if (started && activeId !== TABS[0].id) {
      showTab(TABS[0].id);
      return true;
    }
    return false;
  },
  showTab: (id) => showTab(id),
};

if (currentProfile()) startApp();
else renderLogin(root, () => location.reload());

function startApp() {
  started = true;
  const profile = currentProfile();
  const starCount = el('span.star-count', { 'data-testid': 'star-count' }, String(starBalance()));
  const starPill = el('div.star-pill', { 'aria-label': 'My stars' }, '⭐ ', starCount);
  const logoButton = el('button.logo-btn', { onclick: () => changeLogo(), 'aria-label': 'App logo' }, logoNode('logo'));

  const header = el('header.app-header', {},
    el('div.brand', {}, logoButton, el('h1', {}, 'Jia Games')),
    starPill,
    el('button.me-btn', { onclick: () => openMe(profile), 'aria-label': `Player ${profile.name}` }, avatar(profile, 'avatar')),
    el('button.icon-btn', { 'aria-label': 'Grown-ups', onclick: () => openGrownUps() }, '⚙️'),
  );

  const main = el('main.app-main');
  const panels = new Map(TABS.map((tab) => [tab.id, el('section.tab-panel.hidden', { id: 'panel-' + tab.id, 'aria-label': tab.label })]));
  main.append(...panels.values());

  const tabButtons = new Map(TABS.map((tab) => [tab.id, el('button.tab-btn', {
    role: 'tab',
    'aria-label': tab.label,
    style: { '--tab-color': tab.color },
    onclick: () => showTab(tab.id),
  }, el('span.tab-icon', { 'aria-hidden': 'true' }, tab.icon), el('span.tab-label', {}, tab.label))]));

  root.replaceChildren(header, main, el('nav.tab-bar', { role: 'tablist' }, ...tabButtons.values()));

  showTab = async (id) => {
    const tab = TABS.find((t) => t.id === id) || TABS[0];
    activeId = tab.id;
    for (const [tabId, panel] of panels) panel.classList.toggle('hidden', tabId !== tab.id);
    for (const [tabId, button] of tabButtons) {
      button.classList.toggle('active', tabId === tab.id);
      button.setAttribute('aria-selected', String(tabId === tab.id));
    }
    tabButtons.get(tab.id).scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (location.hash !== '#' + tab.id) history.replaceState(null, '', '#' + tab.id);
    main.scrollTop = 0;

    let module = loaded.get(tab.id);
    if (!module) {
      module = await tab.load();
      loaded.set(tab.id, module);
      await module.render(panels.get(tab.id));
    } else {
      await module.onShow?.();
    }
  };

  window.addEventListener('jia:stars', (event) => {
    starCount.textContent = String(event.detail.balance);
    starPill.classList.remove('bump');
    void starPill.offsetWidth;
    starPill.classList.add('bump');
  });
  window.addEventListener('jia:logo', () => logoButton.replaceChildren(logoNode('logo')));

  startAutoReport();
  startWellbeing();
  showTab(location.hash.slice(1) || TABS[0].id);
}

function openMe(profile) {
  openSheet({
    title: `${profile.name} 👋`,
    content: () => el('div', { style: { textAlign: 'center' } },
      el('div.login-avatar', {}, avatar(profile, 'avatar-big')),
      el('p', {}, `You have ⭐ ${starBalance()} stars.`),
      el('button.btn.pink.block', { onclick: () => { signOut(); location.hash = ''; location.reload(); } }, '👋 Switch player / Log out')),
  });
}
