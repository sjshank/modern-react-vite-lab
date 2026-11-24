import { expect, test } from '@playwright/test';

test('production app initially loads without browser errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { name: 'Get started', exact: true }),
  ).toBeVisible();
  expect(
    errors,
    'Browser exceptions and console errors during initial load',
  ).toEqual([]);
});
