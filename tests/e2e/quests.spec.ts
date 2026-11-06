import { expect, test } from '@playwright/test';

const API_BASE = 'http://localhost:8000/api/v1';

test('user can claim a daily quest reward and open a collection card', async ({
  page,
  request,
}) => {
  const suffix = `${Date.now()}`.slice(-8);
  const username = `qs_${suffix}`;
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
      test.skip(true, 'Backend is not available; quest test skipped');
      return;
    }
    const payload = (await response.json()) as {
      data: { tokens: { access_token: string }; user: Record<string, unknown> };
    };
    token = payload.data.tokens.access_token;
    user = payload.data.user;
  } catch {
    test.skip(true, 'Backend is not available; quest test skipped');
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };
  await request.get(`${API_BASE}/quests/daily`, { headers });

  const start = await request.post(`${API_BASE}/games/penalty/start`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
    data: { mode: 'normal' },
  });
  const session = (
    (await start.json()) as { data: { session_id: string } }
  ).data.session_id;
  for (let shot = 0; shot < 5; shot += 1) {
    await request.post(`${API_BASE}/games/sessions/${session}/action`, {
      headers: { ...headers, 'Content-Type': 'application/json' },
      data: { action: 'shoot', payload: { sector: shot } },
    });
  }

  const packs = (await (
    await request.get(`${API_BASE}/packs`, { headers })
  ).json()) as { data: { id: string }[] };
  const open = await request.post(
    `${API_BASE}/packs/${packs.data[0].id}/open`,
    {
      headers: {
        ...headers,
        'Idempotency-Key': `quest-collection-${suffix}`,
      },
    },
  );
  expect(open.ok()).toBeTruthy();
  const collection = (await (
    await request.get(`${API_BASE}/users/me/cards?limit=1`, { headers })
  ).json()) as { data: { id: string; card: { player_name: string } }[] };
  const userCard = collection.data[0];
  expect(userCard).toBeTruthy();

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

  await page.goto('/app/quests');
  await expect(
    page.getByRole('heading', { name: /Ежедневные задания/ }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Play 1 game', { exact: true })).toBeVisible();
  await expect(page.getByText('Выполнено').first()).toBeVisible();

  await page.getByRole('button', { name: 'Забрать награду' }).first().click();
  await expect(page.getByText('Получено').first()).toBeVisible({
    timeout: 15_000,
  });

  await page.goto('/app/club/collection');
  await expect(
    page.getByRole('heading', { name: 'Коллекция карточек' }),
  ).toBeVisible({ timeout: 15_000 });
  await page.locator('button.group').first().click();
  await expect(page).toHaveURL(/\/app\/club\/cards\//, { timeout: 15_000 });
  await expect(page.getByText(userCard.card.player_name).first()).toBeVisible();
  await expect(page.getByText('Получена', { exact: false })).toBeVisible();
});
