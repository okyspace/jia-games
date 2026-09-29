const { test, expect } = require('@playwright/test');
const { signUp, enterPin, giveStars } = require('./helpers');

test('prizes: claim needs enough stars, spends them, and a grown-up marks it given', async ({ page }) => {
  await signUp(page);
  await page.getByRole('tab', { name: 'Prizes' }).click();
  const prize = page.locator('[data-prize="screen-30"]');
  await expect(prize).toContainText('20 more ⭐ to go');
  await giveStars(page, 25);
  await prize.getByRole('button', { name: /Claim/ }).click();
  await page.getByRole('button', { name: 'Claim it!' }).click();
  await expect(page.getByTestId('star-count')).toHaveText('5');
  await expect(page.getByText('Waiting ⏳')).toBeVisible();

  await page.getByRole('button', { name: 'Grown-ups' }).click();
  await enterPin(page);
  await page.getByRole('button', { name: /Given/ }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByText('Received ✅')).toBeVisible();
});

test('prizes: grown-ups can add and remove prizes', async ({ page }) => {
  await signUp(page);
  await page.getByRole('tab', { name: 'Prizes' }).click();
  await page.getByRole('button', { name: /Edit prizes/ }).click();
  await enterPin(page);
  await page.getByLabel('Emoji').fill('🍦');
  await page.getByLabel('Prize name').fill('Ice cream');
  await page.getByLabel('Stars needed').fill('15');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('button', { name: 'Remove A small toy' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.locator('.tile', { hasText: 'Ice cream' })).toContainText('15');
  await expect(page.locator('.tile', { hasText: 'A small toy' })).toHaveCount(0);
});

test('grown-ups can change the PIN', async ({ page }) => {
  await signUp(page);
  await page.getByRole('button', { name: 'Grown-ups' }).click();
  await enterPin(page);
  await page.getByLabel('New PIN').fill('4321');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Grown-ups' }).click();
  await enterPin(page, '1234');
  await expect(page.locator('.pin-pad')).toBeVisible();
  await enterPin(page, '4321');
  await expect(page.getByRole('heading', { name: '⚙️ Grown-ups' })).toBeVisible();
});

test('notes: create, edit and delete a note', async ({ page }) => {
  await signUp(page);
  await page.getByRole('tab', { name: 'Notes' }).click();
  await page.getByRole('button', { name: /New note/ }).click();
  await page.getByLabel('Title').fill('My idea');
  await page.getByLabel('Note', { exact: true }).fill('Build a robot dog');
  await page.getByRole('button', { name: /Save/ }).click();
  await expect(page.locator('.note')).toContainText('Build a robot dog');
  await page.reload();
  await page.locator('.note').click();
  await page.getByLabel('Note', { exact: true }).fill('Build a robot cat');
  await page.getByRole('button', { name: /Save/ }).click();
  await expect(page.locator('.note')).toContainText('robot cat');
  await page.locator('.note').click();
  await page.getByRole('button', { name: /Delete/ }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.locator('.note')).toHaveCount(0);
});

test('draw: draw, save to the gallery, and it is still there after reopening', async ({ page }) => {
  await signUp(page);
  await page.getByRole('tab', { name: 'Draw' }).click();
  const canvas = page.getByLabel('Drawing area');
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + 30, box.y + 30);
  await page.mouse.down();
  await page.mouse.move(box.x + 150, box.y + 120, { steps: 8 });
  await page.mouse.up();
  await page.getByRole('button', { name: /Save/ }).click();
  await expect(page.locator('.gallery img')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.gallery img')).toHaveCount(1);
  await page.locator('.gallery button').click();
  await expect(page.getByAltText('Saved drawing')).toBeVisible();
});

test('each kid has their own stars and notes', async ({ page }) => {
  await signUp(page, 'Ann', 'aaaa');
  await giveStars(page, 7);
  await page.getByRole('tab', { name: 'Notes' }).click();
  await page.getByRole('button', { name: /New note/ }).click();
  await page.getByLabel('Note', { exact: true }).fill('Ann secret');
  await page.getByRole('button', { name: /Save/ }).click();
  await page.getByRole('button', { name: 'Player Ann' }).click();
  await page.getByRole('button', { name: /Log out/ }).click();

  await page.getByRole('button', { name: /New player/ }).click();
  await page.getByLabel('My name').fill('Ben');
  await page.getByLabel('Password', { exact: true }).fill('bbbb');
  await page.getByLabel('Password again').fill('bbbb');
  await page.getByRole('button', { name: /Make my player/ }).click();
  await expect(page.getByTestId('star-count')).toHaveText('0');
  await page.getByRole('tab', { name: 'Notes' }).click();
  await expect(page.locator('.note')).toHaveCount(0);
});

test('progress report (Markdown) lists challenges, stars and prizes', async ({ page }) => {
  await signUp(page);
  await giveStars(page, 30);
  const md = await page.evaluate(async () => {
    const store = await import('/js/store.js');
    store.logChallenge({ id: 'clean-table', title: 'Tidy Study Table', stars: 10 });
    store.claimPrize({ id: 'screen-30', emoji: '📺', title: '30 minutes of screen time', cost: 20 });
    return (await import('/js/report.js')).buildReport();
  });
  expect(md).toContain('## Jia');
  expect(md).toContain('- ⭐ Stars now: **20**');
  expect(md).toContain('| Tidy Study Table | +10 |');
  expect(md).toContain('📺 30 minutes of screen time | -20 | Waiting |');

  await page.getByRole('button', { name: 'Grown-ups' }).click();
  await enterPin(page);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save report now' }).click();
  expect((await download).suggestedFilename()).toBe('jia-games-progress.md');
});
