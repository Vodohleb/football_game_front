import { expect, test } from '@playwright/test';

const API_BASE = 'http://localhost:8000/api/v1';

test('user can reset the password and login with the new one', async ({
  page,
  request,
}) => {
  const suffix = `${Date.now()}`.slice(-8);
  const username = `pr_${suffix}`;
  const email = `${username}@example.com`;
  const oldPassword = 'Test12345';
  const newPassword = 'NewTest67890';

  try {
    const response = await request.post(`${API_BASE}/auth/register`, {
      data: { email, username, password: oldPassword },
    });
    if (!response.ok()) {
      test.skip(true, 'Backend is not available; reset test skipped');
      return;
    }
  } catch {
    test.skip(true, 'Backend is not available; reset test skipped');
    return;
  }

  await page.goto('/forgot-password');
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Отправить ссылку' }).click();

  await expect(
    page.getByRole('heading', { name: 'Новый пароль' }),
  ).toBeVisible({ timeout: 15_000 });
  const devHint = page.getByText(
    'Dev-режим: токен сброса подставлен автоматически.',
  );
  if (!(await devHint.isVisible().catch(() => false))) {
    test.skip(true, 'Dev reset token is disabled; reset test skipped');
    return;
  }

  await page.getByLabel('Новый пароль').fill(newPassword);
  await page.getByLabel('Повторите пароль').fill(newPassword);
  await page.getByRole('button', { name: 'Сохранить новый пароль' }).click();

  await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
  await page.getByLabel('Email').fill(email);
  await page.locator('input[name="password"]').fill(newPassword);
  await page.getByRole('button', { name: 'Войти' }).click();

  await expect(page).toHaveURL(/\/app\/dashboard$/, { timeout: 20_000 });
  await expect(
    page.getByRole('heading', { name: `Привет, ${username}` }),
  ).toBeVisible({ timeout: 20_000 });
});
