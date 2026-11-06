import { expect, test } from '@playwright/test';

const API_BASE = 'http://localhost:8000/api/v1';

test('user can register, logout and login again', async ({
  page,
  request,
}) => {
  const health = await request.get(`${API_BASE}/health`).catch(() => null);
  if (!health?.ok()) {
    test.skip(true, 'Backend is not available; auth test skipped');
    return;
  }

  const suffix = `${Date.now()}`.slice(-8);
  const username = `au_${suffix}`;
  const email = `${username}@example.com`;
  const password = 'Test12345';

  await page.goto('/register');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Никнейм').fill(username);
  await page.getByLabel('Пароль', { exact: true }).fill(password);
  await page.getByLabel('Повторите пароль').fill(password);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Создать аккаунт' }).click();

  await expect(page).toHaveURL(/\/app\/dashboard$/, { timeout: 20_000 });
  await expect(
    page.getByRole('heading', { name: `Привет, ${username}` }),
  ).toBeVisible({ timeout: 20_000 });

  await page.getByRole('button', { name: 'Меню профиля' }).click();
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Выйти' })
    .click();
  await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });

  await page.getByLabel('Email').fill(email);
  await page.locator('input[name="password"]').fill('WrongPass123');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page.getByText('Не удалось войти')).toBeVisible({
    timeout: 15_000,
  });

  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page).toHaveURL(/\/app\/dashboard$/, { timeout: 20_000 });
  await expect(
    page.getByRole('heading', { name: `Привет, ${username}` }),
  ).toBeVisible({ timeout: 20_000 });
});
