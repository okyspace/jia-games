// Shared test helpers.
const { expect } = require('@playwright/test');

/** Open the app and create + sign in a player. */
async function signUp(page, name = 'Jia', password = 'abcd') {
  await page.goto('/index.html');
  await page.getByRole('button', { name: /New player/ }).click();
  await page.getByLabel('My name').fill(name);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Password again').fill(password);
  await page.getByRole('button', { name: /Make my player/ }).click();
  await expect(page.getByTestId('star-count')).toBeVisible();
}

/** Enter the grown-up PIN on the PIN pad. */
async function enterPin(page, pin = '1234') {
  for (const digit of pin) await page.locator('.pin-pad').getByRole('button', { name: digit, exact: true }).click();
}

/** Give the signed-in player stars directly (test setup). */
async function giveStars(page, amount) {
  await page.evaluate(async (n) => {
    const store = await import('/js/store.js');
    store.earnStars(n, 'Test bonus');
  }, amount);
}

module.exports = { signUp, enterPin, giveStars };
