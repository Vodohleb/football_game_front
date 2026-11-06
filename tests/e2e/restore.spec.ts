import { expect, test } from '@playwright/test';

const API_BASE = 'http://localhost:8000/api/v1';

test('unfinished draft session is restored after page reload', async ({
  page,
  request,
}) => {
  const suffix = `${Date.now()}`.slice(-8);
  const username = `rs_${suffix}`;
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
      test.skip(true, 'Backend is not available; restore test skipped');
      return;
    }
    const payload = (await response.json()) as {
      data: { tokens: { access_token: string }; user: Record<string, unknown> };
    };
    token = payload.data.tokens.access_token;
    user = payload.data.user;
  } catch {
    test.skip(true, 'Backend is not available; restore test skipped');
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

  await page.goto('/app/games/draft');
  await page.getByRole('button', { name: 'Начать игру' }).click();
  await expect(page.getByText('Прогресс драфта')).toBeVisible({
    timeout: 15_000,
  });
  await page.locator('button.group').first().click();
  await expect(page.getByText('1/5')).toBeVisible({ timeout: 15_000 });

  await page.reload();

  await expect(page.getByText('Прогресс драфта')).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText('1/5')).toBeVisible();
  await expect(page.getByText('Выбор 2 из 5')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Начать игру' }),
  ).toHaveCount(0);
});
