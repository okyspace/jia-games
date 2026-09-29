const { test, expect } = require('@playwright/test');
const { signUp, enterPin } = require('./helpers');

const card = (page, id) => page.locator(`[data-challenge="${id}"]`);

test.beforeEach(async ({ page }) => {
  await signUp(page);
  await page.getByRole('tab', { name: 'Challenges' }).click();
});

test('math sprint: 3 rounds (+, −, ×) earn 10 stars, then it is done for today', async ({ page }) => {
  await card(page, 'math-sprint').getByRole('button', { name: /Start/ }).click();
  const game = page.frameLocator('.page-frame');
  await game.getByRole('button', { name: /Start!/ }).click();
  const symbols = [];
  for (let round = 0; round < 3; round++) {
    for (let q = 0; q < 10; q++) {
      const text = await game.locator('.sum').textContent();
      const [, a, op, b] = text.match(/(\d+) (\S) (\d+)/);
      if (q === 0) symbols.push(op);
      const answer = op === '+' ? +a + +b : op === '−' ? a - b : a * b;
      if (round === 0 && q === 0) {
        // A wrong answer is not accepted.
        await page.keyboard.type(String(answer + 1));
        await page.keyboard.press('Enter');
        await expect(game.locator('.sum')).toHaveText(text);
      }
      for (const digit of String(answer)) await game.getByRole('button', { name: digit, exact: true }).click();
      await game.getByRole('button', { name: 'Check' }).click();
    }
    if (round < 2) await game.getByRole('button', { name: /Next round/ }).click();
  }
  expect(symbols).toEqual(['+', '−', '×']);
  await game.getByRole('button', { name: /Collect my stars/ }).click();
  await expect(page.getByText('You earned 10 stars!')).toBeVisible();
  await expect(page.getByTestId('star-count')).toHaveText('10');
  await page.getByRole('button', { name: /Yay/ }).click();
  await expect(card(page, 'math-sprint')).toContainText('Done today');
});

test('math sprint: running out of time restarts the round', async ({ page }) => {
  await page.clock.install();
  await card(page, 'math-sprint').getByRole('button', { name: /Start/ }).click();
  const game = page.frameLocator('.page-frame');
  await game.getByRole('button', { name: /Start!/ }).click();
  await page.clock.runFor(121_000);
  await expect(game.getByRole('heading', { name: "Time's up!" })).toBeVisible();
  await game.getByRole('button', { name: /Try again/ }).click();
  await expect(game.getByText('Question 1 / 10')).toBeVisible();
});

test('book explorer: needs 50+ pages and a real summary, then a grown-up check gives 15 stars', async ({ page }) => {
  await card(page, 'book-report').getByRole('button', { name: /Start/ }).click();
  await page.getByLabel('Book name').fill("Charlotte's Web");
  await page.getByLabel('Author').fill('E. B. White');
  await page.getByLabel('Number of pages').fill('30');
  await page.getByLabel('What is the story about?').fill('A pig called Wilbur makes friends with a clever spider named Charlotte who saves his life with words.');
  await page.getByLabel('What did you like about the book?').fill('I liked Charlotte because she is kind and smart.');
  await page.getByRole('button', { name: /Save to My Book/ }).click();
  await expect(page.getByRole('alert')).toContainText('at least 50 pages');
  await page.getByLabel('Number of pages').fill('184');
  await page.getByRole('button', { name: /Save to My Book/ }).click();
  await enterPin(page, '1234');
  await expect(page.getByText('You earned 15 stars!')).toBeVisible();
  await page.getByRole('button', { name: /Yay/ }).click();
  await page.getByRole('tab', { name: 'My Book' }).click();
  await expect(page.getByText("📕 Charlotte's Web")).toBeVisible();
  await expect(page.getByText('by E. B. White · 184 pages')).toBeVisible();
});

test('chores: every step must be ticked, a wrong PIN gives nothing, the right PIN gives 10 stars', async ({ page }) => {
  await card(page, 'clean-table').getByRole('button', { name: /Start/ }).click();
  const done = page.getByRole('button', { name: /All done/ });
  await expect(done).toBeDisabled();
  for (const box of await page.getByRole('checkbox').all()) await box.check();
  await done.click();
  await enterPin(page, '9999');
  await expect(page.getByTestId('star-count')).toHaveText('0');
  await enterPin(page, '1234');
  await expect(page.getByText('You earned 10 stars!')).toBeVisible();
  await page.getByRole('button', { name: /Yay/ }).click();

  await card(page, 'fold-clothes').getByRole('button', { name: /Start/ }).click();
  for (const box of await page.getByRole('checkbox').all()) await box.check();
  await page.getByRole('button', { name: /All done/ }).click();
  await enterPin(page);
  await expect(page.getByTestId('star-count')).toHaveText('20');
});

test('chinese read-aloud: record, save into My Book, and unlock more challenges', async ({ page }) => {
  await expect(page.getByText('Secret challenges')).toBeVisible();
  await card(page, 'chinese-read-aloud').getByRole('button', { name: /Start/ }).click();
  await expect(page.locator('.paragraph')).toContainText('猫妈妈');
  await page.getByRole('button', { name: 'Record' }).click();
  await expect(page.getByText(/Recording…/)).toBeVisible();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await page.getByRole('button', { name: /Save to My Book/ }).click();
  await enterPin(page);
  await expect(page.getByText('You earned 10 stars!')).toBeVisible();
  await page.getByRole('button', { name: /Yay/ }).click();
  await expect(page.getByText('You unlocked more challenges!')).toBeVisible();
  await page.getByRole('tab', { name: 'My Book' }).click();
  await expect(page.getByText('🎤 小猫钓鱼')).toBeVisible();
  await expect(page.locator('[data-recording] audio')).toHaveCount(1);
});

test('a challenge with "requires" stays locked until the required one is done', async ({ page }) => {
  await page.route('**/challenges/challenges.json', async (route) => {
    const response = await route.fetch();
    const json = await response.json();
    json.challenges.push({ id: 'bonus', title: 'Bonus', emoji: '🎁', stars: 5, description: 'x', type: 'checklist', steps: ['a'], repeat: 'daily', requires: ['chinese-read-aloud'] });
    await route.fulfill({ response, json });
  });
  await page.reload();
  await page.getByRole('tab', { name: 'Challenges' }).click();
  await expect(card(page, 'bonus')).toContainText('Finish “读一读 Read Aloud” first');
  await expect(card(page, 'bonus').getByRole('button', { name: /Start/ })).toHaveCount(0);
});
