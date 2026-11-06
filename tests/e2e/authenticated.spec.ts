import { expect, test } from '@playwright/test';

const API_BASE = 'http://localhost:8000/api/v1';

test('authenticated user can play a minigame, open a pack and browse the app', async ({
  page,
  request,
}) => {
  const suffix = `${Date.now()}`.slice(-8);
  const username = `e2e_${suffix}`;
  const email = `${username}@example.com`;
  const password = 'Test12345';

  let token = '';
  let user: Record<string, unknown> | null = null;

  try {
    const response = await request.post(`${API_BASE}/auth/register`, {
      data: { email, username, password },
    });
    if (!response.ok()) {
      test.skip(
        true,
        `Backend registration failed (${response.status()}); integration test skipped`,
      );
      return;
    }
    const payload = (await response.json()) as {
      data: { tokens: { access_token: string }; user: Record<string, unknown> };
    };
    token = payload.data.tokens.access_token;
    user = payload.data.user;
  } catch {
    test.skip(true, 'Backend is not available; integration test skipped');
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

  await page.goto('/app/dashboard');
  await expect(
    page.getByRole('heading', { name: `Привет, ${username}` }),
  ).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('Ежедневные задания')).toBeVisible();

  await page.goto('/app/games');
  await expect(page.getByRole('heading', { name: 'Мини-игры' })).toBeVisible();
  await expect(page.getByText('Penalty Shootout')).toBeVisible();

  await page.goto('/app/games/penalty');
  await page.getByRole('button', { name: 'Начать игру' }).click();
  await expect(page.getByText('Выберите сектор для удара')).toBeVisible();
  await page.getByRole('button', { name: 'Сектор 1' }).click();
  await expect(
    page.getByText(/ГОЛ!|СЕЙВ/).first(),
  ).toBeVisible({ timeout: 10_000 });

  await page.goto('/app/shop/packs');
  await expect(
    page.getByRole('heading', { name: 'Паки карточек' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Открыть' }).first().click();
  await expect(page.getByRole('button', { name: 'Открыть пак' })).toBeVisible();
  await page.getByRole('button', { name: 'Открыть пак' }).click();
  await expect(page.getByText('Пак открыт', { exact: true })).toBeVisible({
    timeout: 15_000,
  });

  await page.goto('/app/club/collection');
  await expect(
    page.getByRole('heading', { name: 'Коллекция карточек' }),
  ).toBeVisible();

  await page.goto('/app/leaderboard');
  await expect(
    page.getByRole('heading', { name: 'Таблица лидеров' }),
  ).toBeVisible();

  await page.goto('/app/quests');
  await expect(
    page.getByRole('heading', { name: /Ежедневные задания/ }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Меню профиля' }).click();
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Выйти' })
    .click();
  await expect(page).toHaveURL('/login');
});
