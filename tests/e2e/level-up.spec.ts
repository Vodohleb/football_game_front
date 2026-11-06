import { expect, test } from '@playwright/test';

const API_BASE = 'http://localhost:8000/api/v1';

test('level up dialog appears when the profile level increases', async ({
  page,
  request,
}) => {
  const suffix = `${Date.now()}`.slice(-8);
  const username = `lu_${suffix}`;
  let token = '';
  let user: Record<string, unknown> & { id?: string } = {};

  try {
    const response = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `${username}@example.com`,
        username,
        password: 'Test12345',
      },
    });
    if (!response.ok()) {
      test.skip(true, 'Backend is not available; level-up test skipped');
      return;
    }
    const payload = (await response.json()) as {
      data: {
        tokens: { access_token: string };
        user: Record<string, unknown> & { id: string };
      };
    };
    token = payload.data.tokens.access_token;
    user = payload.data.user;
  } catch {
    test.skip(true, 'Backend is not available; level-up test skipped');
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
      localStorage.setItem(
        `football-arena-level-${currentUser.id}`,
        '0',
      );
    },
    { accessToken: token, currentUser: user },
  );

  await page.goto('/app/dashboard');
  await expect(
    page.getByRole('heading', { name: 'Новый уровень!' }),
  ).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('Открыт новый уровень профиля')).toBeVisible();
  await page.getByRole('button', { name: 'Продолжить' }).click();
  await expect(
    page.getByRole('heading', { name: 'Новый уровень!' }),
  ).toHaveCount(0);
});
