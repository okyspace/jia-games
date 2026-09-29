// The tabs in the bottom bar, in order. To add a tab:
//   1. Create web/js/tabs/<name>.js exporting `render(container)` (and optionally `onShow()`).
//   2. Add one line below.
// The first tab is the home tab. More than 5 tabs is fine: the bar scrolls sideways.
export const TABS = [
  { id: 'games', label: 'Games', icon: '🎮', color: '#FFD23F', load: () => import('./tabs/games.js') },
  { id: 'challenges', label: 'Challenges', icon: '🏆', color: '#FF8C42', load: () => import('./tabs/challenges.js') },
  { id: 'prizes', label: 'Prizes', icon: '🎁', color: '#FF6B9D', load: () => import('./tabs/prizes.js') },
  { id: 'notes', label: 'Notes', icon: '📝', color: '#7ED957', load: () => import('./tabs/notes.js') },
  { id: 'draw', label: 'Draw', icon: '🎨', color: '#4ECDC4', load: () => import('./tabs/draw.js') },
  { id: 'book', label: 'My Book', icon: '📚', color: '#A78BFA', load: () => import('./tabs/book.js') },
];
