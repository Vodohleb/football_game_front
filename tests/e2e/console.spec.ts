import { expect, test } from '@playwright/test';

const API_BASE = 'http://localhost:8000/api/v1';

const ROUTES = [
  '/app/dashboard',
  '/app/games',
  '/app/games/draft',
  '/app/games/penalty',
  '/app/club/collection',
  '/app/club/squad',
  '/app/shop/packs',
  '/app/competitions',
  '/app/competitions/rooms',
  '/app/leaderboard',
  '/app/quests',
  '/app/achievements',
  '/app/profile',
];

test('core pages do not produce console errors', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const suffix = `${Date.now()}`.slice(-8);
  const username = `ce_${suffix}`;
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
      test.skip(true, 'Backend is not available; console test skipped');
      return;
    }
    const payload = (await response.json()) as {
      data: { tokens: { access_token: string }; user: Record<string, unknown> };
    };
    token = payload.data.tokens.access_token;
    user = payload.data.user;
  } catch {
    test.skip(true, 'Backend is not available; console test skipped');
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };
  await request.post(`${API_BASE}/users/me/squads`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
    data: { name: 'Console Squad', formation: '4-3-3', is_active: true },
  });

  const errors: string[] = [];
  const ignored = (text: string) =>
    text.includes('fonts.googleapis.com') ||
    text.includes('fonts.gstatic.com') ||
    text.includes('favicon');

  page.on('console', (message) => {
    if (message.type() === 'error' && !ignored(message.text())) {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    if (!ignored(error.message)) {
      errors.push(error.message);
    }
  });

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

  for (const route of ROUTES) {
    await page.goto(route);
    await page.waitForTimeout(700);
  }

  expect(errors, errors.join('\n')).toEqual([]);
});
