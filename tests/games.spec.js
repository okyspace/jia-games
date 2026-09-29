const { test, expect } = require('@playwright/test');
const { signUp } = require('./helpers');

async function openGame(page, id) {
  await signUp(page);
  await page.locator(`[data-game="${id}"]`).click();
  return page.frameLocator('.page-frame');
}

test('maze: walls block, and solving the maze shows the win message', async ({ page }) => {
  const game = await openGame(page, 'maze');
  await expect(game.locator('#level')).toHaveText('Level 1');
  const frame = page.frame({ url: /maze/ });
  await frame.waitForFunction(() => window.mazeGame?.grid);
  // Find the path with a breadth-first search over the maze the game built.
  const path = await frame.evaluate(() => {
    const { grid, size } = window.mazeGame;
    const dirs = { up: [0, -1, 'n'], down: [0, 1, 's'], left: [-1, 0, 'w'], right: [1, 0, 'e'] };
    const prev = new Map([['0,0', null]]);
    const queue = [[0, 0]];
    while (queue.length) {
      const [x, y] = queue.shift();
      for (const [name, [dx, dy, wall]] of Object.entries(dirs)) {
        const key = `${x + dx},${y + dy}`;
        if (grid[y][x][wall] || prev.has(key)) continue;
        prev.set(key, [`${x},${y}`, name]);
        queue.push([x + dx, y + dy]);
      }
    }
    const steps = [];
    for (let at = `${size - 1},${size - 1}`; prev.get(at); at = prev.get(at)[0]) steps.unshift(prev.get(at)[1]);
    return steps;
  });
  const keys = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
  await game.locator('#canvas').click({ position: { x: 5, y: 5 } });
  for (const step of path) await page.keyboard.press(keys[step]);
  await expect(game.getByRole('heading', { name: 'Level 1 done!' })).toBeVisible();
  await game.getByRole('button', { name: /Next level/ }).click();
  await expect(game.locator('#level')).toHaveText('Level 2');
});

test('typing: pressing the shown keys finishes the home row level', async ({ page }) => {
  const game = await openGame(page, 'typing');
  await game.locator('[data-level="home"]').click();
  for (let i = 0; i < 20; i++) {
    const key = (await game.locator('.target').textContent()).trim().toLowerCase();
    await page.keyboard.press(key === ';' ? 'Semicolon' : key);
  }
  await expect(game.getByRole('heading', { name: 'Home row complete!' })).toBeVisible();
  await expect(game.getByText('Accuracy 100%')).toBeVisible();
  await game.getByRole('button', { name: 'Levels', exact: true }).click();
  await expect(game.locator('[data-level="home-plus"]')).toBeEnabled();
});

test('typing: tapping the on-screen keyboard works and wrong keys count as mistakes', async ({ page }) => {
  const game = await openGame(page, 'typing');
  await game.locator('[data-level="home"]').click();
  const key = (await game.locator('.target').textContent()).trim().toLowerCase();
  const wrong = key === 'q' ? 'w' : 'q';
  await game.getByRole('button', { name: `Key ${wrong}` }).click();
  await game.getByRole('button', { name: `Key ${key}`, exact: true }).click();
  await expect(game.getByText('✅ 1  ❌ 1')).toBeVisible();
});

test('memory: matching every pair wins the game', async ({ page }) => {
  const game = await openGame(page, 'memory');
  await game.locator('[data-difficulty="easy"]').click();
  const faces = await game.locator('.mcard').evaluateAll((cards) => cards.map((c) => c.dataset.face));
  const byFace = {};
  faces.forEach((f, i) => (byFace[f] ||= []).push(i));
  // One wrong pair first: they flip back.
  const [f1, f2] = Object.keys(byFace);
  await game.locator('.mcard').nth(byFace[f1][0]).click();
  await game.locator('.mcard').nth(byFace[f2][0]).click();
  await expect(game.locator('.mcard.up')).toHaveCount(0);
  for (const [a, b] of Object.values(byFace)) {
    await game.locator('.mcard').nth(a).click();
    await game.locator('.mcard').nth(b).click();
  }
  await expect(game.getByRole('heading', { name: /New best score/ })).toBeVisible();
  await expect(game.getByText('👆 7 moves')).toBeVisible();
});

test('quiz maker: add a typed-answer question and a multiple-choice one, then play', async ({ page }) => {
  const game = await openGame(page, 'qna');
  // Remove the starter questions so the quiz only has ours.
  await game.getByRole('button', { name: /All questions/ }).click();
  while (await game.getByRole('button', { name: 'Delete question' }).count()) {
    await game.getByRole('button', { name: 'Delete question' }).first().click();
  }
  await game.getByRole('button', { name: '⬅ Menu' }).click();

  await game.getByRole('button', { name: /Add a question/ }).click();
  await game.getByLabel('Question').fill('What is 2 + 2?');
  await game.getByLabel('Correct answer').fill('Four');
  await game.getByRole('button', { name: /Save question/ }).click();
  await game.getByRole('button', { name: 'Add another' }).click();
  await game.getByLabel('Question').fill('Which animal says moo?');
  await game.getByLabel('Correct answer').fill('Cow');
  await game.getByLabel('Wrong answer 1').fill('Dog');
  await game.getByRole('button', { name: /Save question/ }).click();
  await game.getByRole('button', { name: 'Menu', exact: true }).click();

  await game.getByRole('button', { name: /Play the quiz \(2 questions\)/ }).click();
  for (let i = 0; i < 2; i++) {
    const text = await game.locator('.question').textContent();
    if (text.includes('2 + 2')) {
      await game.getByLabel('Your answer').fill('  four ');
      await game.getByRole('button', { name: /Check/ }).click();
    } else {
      await game.getByRole('button', { name: 'Cow' }).click();
    }
    await expect(game.getByText('🎉 Correct!')).toBeVisible();
    await game.locator('.feedback + .btn').click();
  }
  await expect(game.getByRole('heading', { name: 'You got 2 out of 2!' })).toBeVisible();
  await game.getByRole('button', { name: 'Menu', exact: true }).click();
  await game.getByRole('button', { name: /All questions/ }).click();
  await expect(game.getByText('by Jia')).toHaveCount(2);
});
