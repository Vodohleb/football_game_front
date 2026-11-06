import {
  expect,
  test,
  type APIRequestContext,
  type Browser,
  type Page,
} from '@playwright/test';

const API_BASE = 'http://localhost:8000/api/v1';

async function registerPlayer(
  request: APIRequestContext,
): Promise<{ token: string; user: Record<string, unknown>; username: string }> {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
  const username = `pv_${suffix}`;
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
  return {
    token: body.data.tokens.access_token,
    user: body.data.user,
    username,
  };
}

async function preparePage(
  browser: Browser,
  token: string,
  user: Record<string, unknown>,
): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
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
  return page;
}

test('two players can play a full PvP penalty match', async ({
  browser,
  request,
}) => {
  const health = await request.get(`${API_BASE}/health`).catch(() => null);
  if (!health?.ok()) {
    test.skip(true, 'backend unavailable');
    return;
  }

  const playerA = await registerPlayer(request);
  const playerB = await registerPlayer(request);
  const pageA = await preparePage(browser, playerA.token, playerA.user);
  const pageB = await preparePage(browser, playerB.token, playerB.user);

  await pageA.goto('/app/competitions/rooms');
  await pageA.getByRole('button', { name: 'Создать комнату' }).click();
  await expect(pageA.getByText('Игроки')).toBeVisible({ timeout: 15_000 });
  const code = (
    await pageA.getByTitle('Скопировать код').innerText()
  ).trim();
  expect(code.length).toBeGreaterThanOrEqual(4);

  await pageB.goto('/app/competitions/rooms');
  await pageB.getByPlaceholder('Например, A1B2C3').fill(code);
  await pageB.getByRole('button', { name: 'Подключиться к комнате' }).click();
  await expect(pageB.getByText('Игроки')).toBeVisible({ timeout: 15_000 });

  await expect(pageA.getByRole('button', { name: 'Готов', exact: true })).toBeEnabled({
    timeout: 10_000,
  });
  await pageA.getByRole('button', { name: 'Готов', exact: true }).click();
  await pageB.getByRole('button', { name: 'Готов', exact: true }).click();

  await expect(pageA.getByText('Выберите сектор удара')).toBeVisible({
    timeout: 15_000,
  });
  await expect(pageB.getByText('Выберите сектор удара')).toBeVisible({
    timeout: 15_000,
  });

  for (let round = 0; round < 5; round += 1) {
    await expect(pageA.getByText('Выберите сектор удара')).toBeVisible();
    await pageA.getByRole('button', { name: 'Сектор 1' }).click();
    await pageB.getByRole('button', { name: 'Сектор 1' }).click();
    await pageA.waitForTimeout(1200);
  }

  await expect(
    pageA.getByRole('heading', { name: 'Матч завершён' }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    pageB.getByRole('heading', { name: 'Матч завершён' }),
  ).toBeVisible({ timeout: 15_000 });
});
