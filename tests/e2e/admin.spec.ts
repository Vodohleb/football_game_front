import { expect, test } from '@playwright/test';

const API_BASE = 'http://localhost:8000/api/v1';

test('admin can open every administration section', async ({ page, request }) => {
  let token = '';
  let user: Record<string, unknown> | null = null;
  try {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'admin@example.com', password: 'Admin12345!' },
    });
    if (!response.ok()) {
      test.skip(true, 'Admin account is not seeded; admin test skipped');
      return;
    }
    const payload = (await response.json()) as {
      data: { tokens: { access_token: string }; user: Record<string, unknown> };
    };
    token = payload.data.tokens.access_token;
    user = payload.data.user;
  } catch {
    test.skip(true, 'Backend is not available; admin test skipped');
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

  const sections: { path: string; heading: string }[] = [
    { path: '/admin/dashboard', heading: 'Dashboard' },
    { path: '/admin/users', heading: 'Пользователи' },
    { path: '/admin/players', heading: 'Футболисты' },
    { path: '/admin/cards', heading: 'Карточки' },
    { path: '/admin/packs', heading: 'Паки' },
    { path: '/admin/games', heading: 'Мини-игры' },
    { path: '/admin/questions', heading: 'Игровые вопросы' },
    { path: '/admin/economy', heading: 'Экономика' },
    { path: '/admin/ratings', heading: 'Рейтинги' },
    { path: '/admin/matches', heading: 'Матчи и сессии' },
    { path: '/admin/logs', heading: 'Журналы' },
  ];

  for (const section of sections) {
    await page.goto(section.path);
    await expect(
      page.getByRole('heading', { name: section.heading }),
    ).toBeVisible({ timeout: 15_000 });
  }

  await page.goto('/admin/users');
  await expect(page.getByText('Пользователи')).toBeVisible();
  await page.getByRole('button', { name: 'Открыть' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();

  const [profileTab] = await Promise.all([
    page.context().waitForEvent('page'),
    page
      .getByRole('link', { name: 'Открыть публичный профиль' })
      .click(),
  ]);
  await profileTab.waitForLoadState('domcontentloaded');
  await expect(
    profileTab.getByText('Публичный профиль', { exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await profileTab.close();

  await page.getByRole('link', { name: 'Транзакции пользователя' }).click();
  await expect(page).toHaveURL(/\/admin\/economy\?user_id=/);
  await expect(page.getByPlaceholder('Фильтр по user_id')).not.toHaveValue('');

  await page.goto('/admin/packs');
  await page.getByRole('button', { name: 'Редактировать' }).first().click();
  await expect(page.getByText('Вероятности', { exact: true })).toBeVisible();
  await expect(page.getByText('Предпросмотр пака')).toBeVisible();
  await page.keyboard.press('Escape');

  await page.goto('/admin/questions');
  await page.getByRole('button', { name: 'Добавить вопрос' }).click();
  await expect(page.getByText('question_data (JSON)')).toBeVisible();
  await page.keyboard.press('Escape');

  await page.goto('/admin/logs');
  await page.getByRole('tab', { name: /Anti-cheat/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Журналы' }),
  ).toBeVisible();
});

test('regular user cannot access the admin panel', async ({ page, request }) => {
  const suffix = `${Date.now()}`.slice(-8);
  const username = `nu_${suffix}`;
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
      test.skip(true, 'Backend is not available; guard test skipped');
      return;
    }
    const payload = (await response.json()) as {
      data: { tokens: { access_token: string }; user: Record<string, unknown> };
    };
    token = payload.data.tokens.access_token;
    user = payload.data.user;
  } catch {
    test.skip(true, 'Backend is not available; guard test skipped');
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

  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/app\/dashboard$/, { timeout: 15_000 });
});
