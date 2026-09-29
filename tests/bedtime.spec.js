const { test, expect } = require('@playwright/test');
const { signUp } = require('./helpers');

test('weekday 8:30pm: bedtime routine reminder, once per day', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-30T20:29:00') }); // Wednesday
  await signUp(page);
  await expect(page.getByRole('dialog', { name: 'Bedtime routine' })).toHaveCount(0);
  await page.clock.runFor(61_000);
  const bedtime = page.getByRole('dialog', { name: 'Bedtime routine' });
  await expect(bedtime).toBeVisible();
  await expect(bedtime).toContainText('Pack my school bag');
  await expect(bedtime).toContainText('Brush my teeth');
  await expect(bedtime).toContainText('Take a shower');
  await bedtime.getByRole('button', { name: /Okay/ }).click();
  await page.reload();
  await page.clock.runFor(5000);
  await expect(page.getByRole('dialog', { name: 'Bedtime routine' })).toHaveCount(0);
});

test('no bedtime reminder on Saturday', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-03T20:45:00') }); // Saturday
  await signUp(page);
  await page.clock.runFor(5000);
  await expect(page.getByRole('dialog', { name: 'Bedtime routine' })).toHaveCount(0);
});
