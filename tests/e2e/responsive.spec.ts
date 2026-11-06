import { expect, test } from '@playwright/test';

const API_BASE = 'http://localhost:8000/api/v1';

const VIEWPORTS = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
];

const ROUTES = [
  '/',
  '/login',
  '/app/dashboard',
  '/app/games',
  '/app/games/draft',
  '/app/games/guess-player',
  '/app/games/penalty',
  '/app/games/tiki-taka',
  '/app/games/higher-lower',
  '/app/games/mystery-player',
  '/app/club/collection',
  '/app/club/squad',
  '/app/shop/packs',
  '/app/competitions',
  '/app/competitions/quick-match',
  '/app/competitions/rooms',
  '/app/leaderboard',
  '/app/quests',
  '/app/achievements',
  '/app/profile',
];

test('no horizontal overflow on key screens at all target viewports', async ({
  page,
  request,
}) => {
  test.setTimeout(240_000);

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
      test.skip(true, 'Backend is not available; responsive audit skipped');
      return;
    }
    const payload = (await response.json()) as {
      data: { tokens: { access_token: string }; user: Record<string, unknown> };
    };
    token = payload.data.tokens.access_token;
    user = payload.data.user;
  } catch {
    test.skip(true, 'Backend is not available; responsive audit skipped');
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };

  const packs = (await (
    await request.get(`${API_BASE}/packs`, { headers })
  ).json()) as { data: { id: string }[] };
  if (packs.data[0]) {
    await request.post(`${API_BASE}/packs/${packs.data[0].id}/open`, {
      headers: {
        ...headers,
        'Idempotency-Key': `responsive-${suffix}`,
      },
    });
  }
  await request.post(`${API_BASE}/users/me/squads`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
    data: { name: 'Responsive Squad', formation: '4-3-3', is_active: true },
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

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    for (const route of ROUTES) {
      await page.goto(route);
      await page.waitForTimeout(650);

      const result = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const scrollWidth = Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth,
        );
        const offenders = Array.from(document.querySelectorAll('body *'))
          .filter((element) => {
            const style = window.getComputedStyle(element);
            if (style.position === 'fixed') {
              return false;
            }
            const rect = element.getBoundingClientRect();
            return rect.right > viewportWidth + 2 && rect.width > 0;
          })
          .slice(0, 4)
          .map((element) => ({
            tag: element.tagName,
            className:
              typeof element.className === 'string'
                ? element.className.slice(0, 120)
                : '',
            right: Math.round(element.getBoundingClientRect().right),
          }));
        return {
          viewportWidth,
          scrollWidth,
          overflow: scrollWidth - viewportWidth,
          offenders,
        };
      });

      if (result.overflow > 1) {
        console.log(
          `OVERFLOW ${viewport.width}x${viewport.height} ${route}`,
          JSON.stringify(result),
        );
      }
      expect(
        result.overflow,
        `${route} overflows at ${viewport.width}x${viewport.height}: ${JSON.stringify(
          result.offenders,
        )}`,
      ).toBeLessThanOrEqual(1);
    }
  }
});
