const { test, expect } = require('@playwright/test');
const { signUp, enterPin } = require('./helpers');

// A Wednesday morning, so the 8:30pm bedtime reminder doesn't get in the way.
const WEDNESDAY_10AM = new Date('2026-09-30T10:00:00');
const minutes = (n) => n * 60_000;

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: WEDNESDAY_10AM });
  await signUp(page);
});

test('20 minutes: sit-up-straight reminder', async ({ page }) => {
  await page.clock.runFor(minutes(19));
  await expect(page.getByText('Sit up straight!')).toHaveCount(0);
  await page.clock.runFor(minutes(1) + 2000);
  await expect(page.getByText('Sit up straight!')).toBeVisible();
  await page.getByRole('button', { name: 'OK 👍' }).click();
  await expect(page.getByText('Sit up straight!')).toHaveCount(0);
});

test('30 minutes: break screen pauses the game until the countdown ends', async ({ page }) => {
  await page.locator('[data-game="maze"]').click();
  const game = page.frameLocator('.page-frame');
  await expect(game.locator('#level')).toHaveText('Level 1');
  await page.clock.runFor(minutes(30) + 2000);

  const breakScreen = page.getByRole('dialog', { name: 'Break time!' });
  await expect(breakScreen).toBeVisible();
  await expect(breakScreen).toContainText('Look far away at trees and plants');
  const back = breakScreen.getByRole('button', { name: /Back to fun/ });
  await expect(back).toBeDisabled();

  // The maze clock does not move during the break, and keys don't move the mouse.
  const timeBefore = await game.locator('#time').textContent();
  const frame = page.frame({ url: /maze/ });
  const before = await frame.evaluate(() => ({ ...window.mazeGame.player }));
  await page.clock.runFor(minutes(1));
  await frame.focus('body');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  expect(await frame.evaluate(() => ({ ...window.mazeGame.player }))).toEqual(before);
  await expect(game.locator('#time')).toHaveText(timeBefore);

  // Android back button can't skip it.
  expect(await page.evaluate(() => window.jia.handleBack())).toBe(true);
  await expect(breakScreen).toBeVisible();

  await page.clock.runFor(minutes(1) + 1000);
  await expect(back).toBeEnabled();
  await back.click();
  await expect(breakScreen).toHaveCount(0);
  await expect(game.locator('#level')).toBeVisible(); // still in the game
});

test('1 hour of continuous use: longer break to go do other things', async ({ page }) => {
  // Skip through the 30-minute break first.
  await page.clock.runFor(minutes(30) + 2000);
  await page.clock.runFor(minutes(2) + 1000);
  await page.getByRole('button', { name: /Back to fun/ }).click();
  await page.clock.runFor(minutes(30));
  const longBreak = page.getByRole('dialog', { name: 'Wow, 1 hour of play!' });
  await expect(longBreak).toBeVisible();
  await expect(longBreak).toContainText('Read a book');
  await expect(longBreak).toContainText('5:00');
});

test('a grown-up can end a break early with the PIN', async ({ page }) => {
  await page.clock.runFor(minutes(30) + 2000);
  await page.getByRole('button', { name: 'Grown-ups: end break' }).click();
  await enterPin(page);
  await expect(page.getByRole('dialog', { name: 'Break time!' })).toHaveCount(0);
});

test('being away for 10+ minutes starts a new session', async ({ page }) => {
  await page.clock.runFor(minutes(25));
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('jia.wellbeing'));
    s.lastSeen -= 11 * 60_000; // pretend the kid left 11 minutes ago
    localStorage.setItem('jia.wellbeing', JSON.stringify(s));
  });
  await page.reload();
  await page.clock.runFor(minutes(10));
  await expect(page.getByRole('dialog', { name: 'Break time!' })).toHaveCount(0);
});
