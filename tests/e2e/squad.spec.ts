import { expect, test } from '@playwright/test';

const API_BASE = 'http://localhost:8000/api/v1';

test('user can create a squad and add a card to it', async ({ page, request }) => {
  const suffix = `${Date.now()}`.slice(-8);
  const username = `sa_${suffix}`;
  const res = await request.post(`${API_BASE}/auth/register`, {
    data: {
      email: `${username}@example.com`,
      username,
      password: 'Test12345',
    },
  });
  const body = (await res.json()) as {
    data: { tokens: { access_token: string }; user: Record<string, unknown> };
  };
  const token = body.data.tokens.access_token;
  const headers = { Authorization: `Bearer ${token}` };
  const packs = (await (
    await request.get(`${API_BASE}/packs`, { headers })
  ).json()) as { data: { id: string }[] };
  const open = await request.post(
    `${API_BASE}/packs/${packs.data[0].id}/open`,
    {
      headers: {
        ...headers,
        'Idempotency-Key': `debug-${suffix}`,
      },
    },
  );
  expect(open.ok()).toBeTruthy();
  const collection = (await (
    await request.get(`${API_BASE}/users/me/cards?limit=10`, { headers })
  ).json()) as { data: { card: { position: string; player_name: string } }[] };
  const formations = (await (
    await request.get(`${API_BASE}/formations`, { headers })
  ).json()) as { data: { code: string }[] };
  const scheme = formations.data.find((item) => item.code !== '4-3-3')?.code;
  const eligiblePositions = new Set([
    'GK',
    'LB',
    'CB',
    'RB',
    'CM',
    'LW',
    'ST',
    'RW',
  ]);
  const card = collection.data.find((item) =>
    eligiblePositions.has(item.card.position),
  );
  if (!card) {
    test.skip(true, 'No compatible seeded cards');
    return;
  }
  const position = card.card.position;

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
    { accessToken: token, currentUser: body.data.user },
  );

  await page.goto('/app/club/squad');
  await page.getByRole('button', { name: 'Создать состав' }).click();
  await page.getByRole('button', { name: 'Создать', exact: true }).click();
  await expect(page.getByText('Заполнение')).toBeVisible({ timeout: 15_000 });

  const slotButton = page
    .getByRole('button')
    .filter({ hasText: new RegExp(`${position}\\s*Пусто`) })
    .first();
  await slotButton.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const cardButton = page.getByRole('dialog').locator('button.group').first();
  await expect(cardButton).toBeVisible({ timeout: 10_000 });
  await cardButton.click();
  await expect(page.getByText('1 из 11 позиций')).toBeVisible({
    timeout: 15_000,
  });

  await page.locator('.pitch button.group').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Убрать игрока' }).click();
  await expect(page.getByText('0 из 11 позиций')).toBeVisible({
    timeout: 15_000,
  });

  if (scheme) {
    await page.getByLabel('Схема').selectOption(scheme);
    await expect(page.getByText('Схема изменена')).toBeVisible({
      timeout: 15_000,
    });
  }
});
