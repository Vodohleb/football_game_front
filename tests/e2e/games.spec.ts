import { expect, test } from '@playwright/test';

const API_BASE = 'http://localhost:8000/api/v1';

test('all minigames can be started and played, squad and PvP room can be created', async ({
  page,
  request,
}) => {
  const suffix = `${Date.now()}`.slice(-8);
  const username = `qa_${suffix}`;
  let token = '';
  let user: Record<string, unknown> | null = null;
  try {
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `${username}@example.com`,
        username,
        password: 'Test12345',
      },
    });
    if (!res.ok()) {
      test.skip(true, 'backend unavailable');
      return;
    }
    const body = (await res.json()) as {
      data: { tokens: { access_token: string }; user: Record<string, unknown> };
    };
    token = body.data.tokens.access_token;
    user = body.data.user;
  } catch {
    test.skip(true, 'backend unavailable');
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

  // Draft
  await page.goto('/app/games/draft');
  await page.getByRole('button', { name: 'Начать игру' }).click();
  for (let round = 0; round < 5; round += 1) {
    await expect(page.locator('button.group').first()).toBeVisible({
      timeout: 10_000,
    });
    await page.locator('button.group').first().click();
    await page.waitForTimeout(700);
  }
  await expect(page.getByText('Игра завершена')).toBeVisible({
    timeout: 15_000,
  });

  // Guess the player
  await page.goto('/app/games/guess-player');
  await page.getByRole('button', { name: 'Начать игру' }).click();
  await page.getByRole('button', { name: 'Открыть подсказку' }).click();
  await expect(page.getByText('Подсказки').first()).toBeVisible();
  await page
    .getByPlaceholder('Введите имя футболиста...')
    .fill('zzzzzz');
  await page.getByRole('button', { name: 'Ответить' }).click();
  await expect(page.getByText('Неверный ответ')).toBeVisible({
    timeout: 10_000,
  });

  // Mystery
  await page.goto('/app/games/mystery-player');
  await page.getByRole('button', { name: 'Начать игру' }).click();
  await page.getByRole('button', { name: 'Открыть подсказку' }).click();
  await expect(page.getByText('Кто этот футболист?')).toBeVisible();

  // Higher or lower
  await page.goto('/app/games/higher-lower');
  await page.getByRole('button', { name: 'Начать игру' }).click();
  await page.getByRole('button', { name: /Higher/ }).click();
  await expect(
    page.getByText(/Верно!|Неверно|Серия завершена/),
  ).toBeVisible({
    timeout: 10_000,
  });

  // Tiki-taka-toe
  await page.goto('/app/games/tiki-taka');
  await page.getByRole('button', { name: 'Начать игру' }).click();
  await page
    .getByRole('button')
    .filter({ hasText: 'Свободно' })
    .first()
    .click();
  const conditionText =
    (await page
      .getByText('Выбранная ячейка')
      .locator('..')
      .locator('p')
      .nth(1)
      .textContent()) ?? '';
  const [position, nationality] = conditionText.split('·').map((v) => v.trim());
  if (!position || !nationality) {
    throw new Error(`Could not parse cell conditions: ${conditionText}`);
  }
  const playersRes = await request.get(
    `${API_BASE}/players?position=${encodeURIComponent(
      position,
    )}&nationality=${encodeURIComponent(nationality.trim())}&limit=5`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const players = (await playersRes.json()) as {
    data: { full_name: string }[];
  };
  const eligible = players.data[0];
  if (!eligible) {
    throw new Error(`No eligible player for ${position} ${nationality}`);
  }
  await page
    .getByPlaceholder('Начните вводить имя футболиста...')
    .fill(eligible.full_name);
  await page
    .getByRole('button')
    .filter({ hasText: eligible.full_name })
    .last()
    .click();
  await expect(page.getByText('Верно!')).toBeVisible({ timeout: 10_000 });

  // Club squad creation
  await page.goto('/app/club/squad');
  const createButton = page.getByRole('button', { name: 'Создать состав' });
  await expect(createButton).toBeVisible({ timeout: 15_000 });
  await createButton.click();
  await page.getByRole('button', { name: 'Создать', exact: true }).click();
  await expect(page.getByText('Заполнение')).toBeVisible({
    timeout: 15_000,
  });

  // PvP room creation
  await page.goto('/app/competitions/rooms');
  await page.getByRole('button', { name: 'Создать комнату' }).click();
  await expect(page.getByText('Игроки')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Код:|Ожидание/).first()).toBeVisible();
});
