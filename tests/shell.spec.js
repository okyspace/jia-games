const { test, expect } = require('@playwright/test');
const { signUp, enterPin } = require('./helpers');

test('login page, sign up with photo-less profile, and see all tabs', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await signUp(page);
  for (const tab of ['Games', 'Challenges', 'Prizes', 'Notes', 'Draw', 'My Book']) {
    await page.getByRole('tab', { name: tab }).click();
    await expect(page.locator('.tab-panel:not(.hidden) h2').first()).toBeVisible();
  }
  await page.getByRole('tab', { name: 'Games' }).click();
  await expect(page.locator('[data-game]')).toHaveCount(5);
  expect(errors).toEqual([]);
});

test('wrong password is refused, right password signs in, log out returns to login', async ({ page }) => {
  await signUp(page, 'Mei', 'pass1');
  await page.getByRole('button', { name: 'Player Mei' }).click();
  await page.getByRole('button', { name: /Log out/ }).click();
  await page.locator('[data-profile="Mei"]').click();
  await page.getByLabel('Password').fill('nope');
  await page.getByRole('button', { name: /Let's go/ }).click();
  await expect(page.getByRole('alert')).toContainText('not the right password');
  await page.getByLabel('Password').fill('pass1');
  await page.getByRole('button', { name: /Let's go/ }).click();
  await expect(page.getByTestId('star-count')).toHaveText('0');
});

test('profile photo and app logo can be uploaded', async ({ page }) => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  await page.goto('/index.html');
  await page.getByRole('button', { name: /New player/ }).click();
  await page.getByLabel('My photo').setInputFiles({ name: 'me.png', mimeType: 'image/png', buffer: png });
  await expect(page.getByAltText('My photo')).toBeVisible();
  await page.getByLabel('My name').fill('Kai');
  await page.getByLabel('Password', { exact: true }).fill('1111');
  await page.getByLabel('Password again').fill('1111');
  await page.getByRole('button', { name: /Make my player/ }).click();
  await expect(page.locator('.me-btn img')).toBeVisible();

  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'App logo' }).click();
  await enterPin(page);
  await (await chooser).setFiles({ name: 'logo.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('.logo-btn img')).toBeVisible();
});
