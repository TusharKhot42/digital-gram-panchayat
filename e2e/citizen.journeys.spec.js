import { test, expect } from '@playwright/test';

/**
 * Citizen PWA end-to-end journeys. Selectors favour accessible roles/labels; tune to the
 * running UI language if needed (set localStorage `dgp_language` to 'en' for stable text).
 *
 * Run: start MongoDB + `npm run dev`, then `npm run e2e -- --project=citizen`.
 */

const unique = () => `9${Math.floor(100000000 + Math.random() * 899999999)}`;
const PASSWORD = 'Secret@123';

async function forceEnglish(page) {
  await page.addInitScript(() => localStorage.setItem('dgp_language', 'en'));
}

async function register(page, mobile) {
  await forceEnglish(page);
  await page.goto('/register');
  await page.getByLabel(/full name/i).fill('E2E Citizen');
  await page.getByLabel(/mobile/i).fill(mobile);
  await page.getByLabel(/password/i).fill(PASSWORD);
  await page.getByLabel(/village/i).fill('Sakharale');
  await page.getByLabel(/address/i).fill('Main Road');
  await page.getByRole('button', { name: /register/i }).click();
  await expect(page).toHaveURL(/\/$|\/home|\//);
}

test('citizen registration creates a session', async ({ page }) => {
  await register(page, unique());
  await expect(page.getByRole('navigation')).toBeVisible();
});

test('citizen login after registration', async ({ page }) => {
  const mobile = unique();
  await register(page, mobile);
  await page.evaluate(() => localStorage.clear());
  await forceEnglish(page);
  await page.goto('/login');
  await page.getByLabel(/mobile/i).fill(mobile);
  await page.getByLabel(/password/i).fill(PASSWORD);
  await page.getByRole('button', { name: /log in/i }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('complaint submission then tracking in history', async ({ page }) => {
  await register(page, unique());
  await page.goto('/complaints/new');
  await page.getByLabel(/category/i).selectOption({ index: 1 });
  await page.getByLabel(/subject/i).fill('Pothole near the temple');
  await page.getByLabel(/description/i).fill('A large pothole needs urgent repair.');
  await page.getByRole('button', { name: /submit/i }).click();

  await page.goto('/complaints');
  await expect(page.getByText(/pothole near the temple/i)).toBeVisible();
});

test('certificate application journey', async ({ page }) => {
  await register(page, unique());
  await page.goto('/dakhala/new');
  await page.getByLabel(/certificate type/i).selectOption({ index: 1 });
  await page.getByRole('button', { name: /submit/i }).click();
  await page.goto('/dakhala');
  await expect(page.getByText(/DKH-/)).toBeVisible();
});

test('tax summary view', async ({ page }) => {
  await register(page, unique());
  await page.goto('/tax');
  // Empty or populated — the screen must render without error.
  await expect(page.getByRole('heading', { name: /tax/i })).toBeVisible();
});
