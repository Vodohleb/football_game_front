import { expect, test, type APIRequestContext } from '@playwright/test';

const API_BASE = 'http://localhost:8000/api/v1';

async function register(request: APIRequestContext, prefix: string) {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
  const username = `${prefix}_${suffix}`;
  const response = await request.post(`${API_BASE}/auth/register`, {
    data: {
      email: `${username}@example.com`,
      username,
      password: 'Test12345',
    },
  });
  if (!response.ok()) {
    return null;
  }
  const payload = (await response.json()) as {
    data: {
      tokens: { access_token: string };
      user: Record<string, unknown> & { id: string; username: string };
    };
  };
  return {
    username,
    id: payload.data.user.id,
    user: payload.data.user,
    token: payload.data.tokens.access_token,
  };
}

test('another player profile is read-only and shows statistics', async ({
  page,
  request,
}) => {
  const viewer = await register(request, 'pv');
  const target = await register(request, 'pt');
  if (!viewer || !target) {
    test.skip(true, 'Backend is not available; profile test skipped');
    return;
  }

  const targetHeaders = { Authorization: `Bearer ${target.token}` };
  const start = await request.post(`${API_BASE}/games/penalty/start`, {
    headers: { ...targetHeaders, 'Content-Type': 'application/json' },
    data: { mode: 'normal' },
  });
  const session = (
    (await start.json()) as { data: { session_id: string } }
  ).data.session_id;
  for (let shot = 0; shot < 5; shot += 1) {
    await request.post(`${API_BASE}/games/sessions/${session}/action`, {
      headers: { ...targetHeaders, 'Content-Type': 'application/json' },
      data: { action: 'shoot', payload: { sector: shot } },
    });
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
    {
      accessToken: viewer.token,
      currentUser: viewer.user,
    },
  );

  await page.goto(`/app/users/${target.id}`);
  await expect(
    page.getByText('Публичный профиль', { exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(target.username).first()).toBeVisible();
  await expect(page.getByText('Статистика по режимам')).toBeVisible();
  await expect(page.getByText(/1 игр/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Редактировать' }),
  ).toHaveCount(0);

  await page.goto(`/app/users/${viewer.id}`);
  await expect(page).toHaveURL(/\/app\/profile$/, { timeout: 15_000 });
});
