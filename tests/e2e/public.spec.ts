import { expect, test } from '@playwright/test';

test('home page renders the landing and navigation', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Football Arena/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Создать аккаунт' }).first(),
  ).toBeVisible();
});

test('login form validates empty fields', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('button', { name: 'Войти' }).click();

  await expect(page.getByText('Введите email')).toBeVisible();
  await expect(page.getByText('Введите пароль')).toBeVisible();
});

test('unknown route renders the 404 page', async ({ page }) => {
  await page.goto('/does-not-exist');

  await expect(page.getByText('Такой страницы нет')).toBeVisible();
});

test('offline banner appears when the connection is lost', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await context.setOffline(true);
  await expect(page.getByRole('status')).toContainText(
    'Нет подключения к интернету',
    { timeout: 10_000 },
  );

  await context.setOffline(false);
  await expect(page.getByRole('status')).toHaveCount(0, { timeout: 10_000 });
});
