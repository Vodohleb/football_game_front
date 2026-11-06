import { expect, test } from '@playwright/test';

const API_BASE = 'http://localhost:8000/api/v1';

test('completed penalty series appears in profile match history', async ({
  page,
  request,
}) => {
  const suffix = `${Date.now()}`.slice(-8);
  const username = `hi_${suffix}`;
  let token = '';
  let user: Record<string, unknown> | null = null;

  try {
    const response = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `${username}@example.com`,
        username,
        password: 'Test12345',
      },
    });
    if (!response.ok()) {
      test.skip(true, 'Backend is not available; history test skipped');
      return;
    }
    const payload = (await response.json()) as {
      data: { tokens: { access_token: string }; user: Record<string, unknown> };
    };
    token = payload.data.tokens.access_token;
    user = payload.data.user;
  } catch {
    test.skip(true, 'Backend is not available; history test skipped');
    return;
  }

  await page.addInitScript(
    ({ accessToken, currentUser }) => {
      localStorage.setItem(
        'football-arena-auth',
        JSON.stringify({
          state: { accessToken, user: currentUser },
          version: 0,
        }),
      );
    },
    { accessToken: token, currentUser: user },
  );

  await page.goto('/app/games/penalty');
  await page.getByRole('button', { name: 'Начать игру' }).click();
  for (let shot = 0; shot < 5; shot += 1) {
    await expect(
      page.getByText(`Удар ${shot + 1} из 5`),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: `Сектор ${shot + 1}` }).click();
  }
  await expect(
    page.getByRole('heading', { name: 'Игра завершена' }),
  ).toBeVisible({ timeout: 15_000 });

  await page.goto('/app/profile');
  await page
    .getByRole('button', { name: 'Продолжить' })
    .click({ timeout: 2000 })
    .catch(() => undefined);
  await page.getByRole('tab', { name: 'История' }).click();
  await expect(
    page.getByRole('heading', { name: 'История матчей' }),
  ).toBeVisible();
  await expect(page.getByText(/Penalty/).first()).toBeVisible();
  await expect(page.getByText('Начисления и списания')).toBeVisible();
  await expect(page.getByText('Локальная история матчей браузера')).toBeVisible();
});
