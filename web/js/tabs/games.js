// Games tab: a grid of game cards read from web/games/games.json.
// "web" games open inside the app; "native" games are Kotlin activities (Android only).
import { el } from '../kit.js';
import { openPage } from '../launcher.js';
import { isAndroid, nativeGameIds, launchNativeGame } from '../native.js';
import { openSheet, toast } from '../ui.js';

export async function render(container) {
  const response = await fetch('games/games.json');
  const { games } = await response.json();
  const available = new Set(nativeGameIds());

  const tiles = games.map((game) => {
    const nativeMissing = game.type === 'native' && !available.has(game.nativeId);
    return el('button.tile', {
      style: { '--tile-color': game.color },
      'data-game': game.id,
      onclick: () => {
        if (game.type === 'native') {
          if (nativeMissing || !launchNativeGame(game.nativeId)) {
            toast(isAndroid ? 'This game is not in this version of the app.' : 'This game works in the Android app 📱');
          }
          return;
        }
        openPage({ title: `${game.emoji} ${game.title}`, url: game.entry, color: game.color });
      },
    },
    game.type === 'native' ? el('span.badge', {}, nativeMissing ? '📱 Android' : 'Native') : null,
    el('span.tile-emoji', { 'aria-hidden': 'true' }, game.emoji),
    el('span.tile-title', {}, game.title),
    el('span.tile-desc', {}, game.description));
  });

  const addTile = el('button.tile.add-tile', { onclick: showHowToAdd },
    el('span.tile-emoji', { 'aria-hidden': 'true' }, '➕'),
    el('span.tile-title', {}, 'More games'),
    el('span.tile-desc', {}, 'How to add a new game'));

  container.append(
    el('div.tab-title', {}, el('div', {}, el('h2', {}, '🎮 Games'), el('p', {}, 'Pick a game and have fun!'))),
    el('div.grid', {}, tiles, addTile),
  );
}

function showHowToAdd() {
  openSheet({
    title: '➕ Add a new game',
    content: el('div', {},
      el('p', {}, 'New games are added by a grown-up or a young coder:'),
      el('ol', {},
        el('li', {}, 'Make a folder in web/games/ with an index.html for the game.'),
        el('li', {}, 'Add the game to web/games/games.json (title, emoji, colour).'),
        el('li', {}, 'For a Kotlin game, use "type": "native" and register it in NativeGames.kt.')),
      el('p.hint', {}, 'See docs/ADDING_GAMES.md for the full guide.')),
  });
}
