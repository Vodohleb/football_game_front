import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';

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
    data: { tokens: { access_token: string }; user: Record<string, unknown> };
  };
  return {
    username,
    token: payload.data.tokens.access_token,
    user: payload.data.user,
  };
}

async function authenticate(
  page: Page,
  token: string,
  user: Record<string, unknown>,
) {
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
}

test('slow requests show loading, API errors are recoverable and pack errors keep the balance', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const account = await register(request, 'er');
  if (!account) {
    test.skip(true, 'Backend is not available; error test skipped');
    return;
  }
  await authenticate(page, account.token, account.user);

  let delayMe = true;
  await page.route('**/api/v1/users/me', async (route) => {
    if (delayMe) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    await route.continue();
  });
  await page.goto('/app/dashboard');
  await expect(page.getByText('Загружаем профиль...')).toBeVisible({
    timeout: 10_000,
  });
  await expect(
    page.getByRole('heading', { name: `Привет, ${account.username}` }),
  ).toBeVisible({ timeout: 20_000 });
  delayMe = false;
  await page.unroute('**/api/v1/users/me');

  await page.route('**/api/v1/packs*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { code: 'INTERNAL_ERROR', message: 'Server error' },
        }),
      });
      return;
    }
    await route.continue();
  });
  await page.goto('/app/shop/packs');
  await expect(page.getByText('Не удалось загрузить данные')).toBeVisible({
    timeout: 15_000,
  });
  await page.unroute('**/api/v1/packs*');
  await page.getByRole('button', { name: 'Повторить' }).click();
  await expect(
    page.getByRole('button', { name: 'Открыть' }).first(),
  ).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Открыть' }).first().click();
  await expect(
    page.getByRole('button', { name: 'Открыть пак' }),
  ).toBeVisible({ timeout: 15_000 });

  const walletResponse = await request.get(`${API_BASE}/economy/wallet`, {
    headers: { Authorization: `Bearer ${account.token}` },
  });
  const balanceBefore = (
    (await walletResponse.json()) as { data: { balance: number } }
  ).data.balance;

  await page.route('**/api/v1/packs/*/open', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: { code: 'PACK_OPEN_FAILED', message: 'Pack open failed' },
      }),
    });
  });
  await page.getByRole('button', { name: 'Открыть пак' }).click();
  await expect(page.getByText('Не удалось открыть пак')).toBeVisible({
    timeout: 15_000,
  });
  await expect(
    page.getByRole('button', { name: 'Открыть пак' }),
  ).toBeEnabled();

  const walletAfterError = await request.get(
    `${API_BASE}/economy/wallet`,
    { headers: { Authorization: `Bearer ${account.token}` } },
  );
  expect(
    (
      (await walletAfterError.json()) as { data: { balance: number } }
    ).data.balance,
  ).toBe(balanceBefore);

  await page.unroute('**/api/v1/packs/*/open');
  await page.getByRole('button', { name: 'Открыть пак' }).click();
  await expect(page.getByText('Пак открыт', { exact: true })).toBeVisible({
    timeout: 15_000,
  });
});

test('expired session without refresh cookie redirects to login', async ({
  page,
  request,
}) => {
  const health = await request.get(`${API_BASE}/health`).catch(() => null);
  if (!health?.ok()) {
    test.skip(true, 'Backend is not available; expired session test skipped');
    return;
  }

  await page.addInitScript(() => {
    localStorage.setItem(
      'football-arena-auth',
      JSON.stringify({
        state: {
          accessToken: 'invalid-expired-token',
          user: {
            id: '00000000-0000-0000-0000-000000000000',
            email: 'none@example.com',
            username: 'expired_user',
            role: 'user',
            status: 'active',
          },
        },
        version: 0,
      }),
    );
  });

  await page.goto('/app/dashboard');
  await expect(page).toHaveURL(/\/login$/, { timeout: 20_000 });
});
