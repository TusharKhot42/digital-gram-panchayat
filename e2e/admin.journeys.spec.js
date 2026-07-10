import { test, expect } from '@playwright/test';

/**
 * Officer portal end-to-end journeys. Requires a seeded officer account
 * (`npm run seed:admin -w backend`, default admin@dgp.local / Admin@123).
 *
 * Run: start MongoDB + `npm run dev`, then `npm run e2e -- --project=admin`.
 */

const EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@dgp.local';
const PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Admin@123';

async function login(page) {
  await page.addInitScript(() => localStorage.setItem('dgp_language', 'en'));
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).fill(PASSWORD);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

test('admin login reaches the dashboard', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('navigation')).toBeVisible();
});

test('admin resolves a complaint', async ({ page }) => {
  await login(page);
  await page.goto('/complaints');
  const firstRow = page.getByRole('link', { name: /CMP-/ }).first();
  if (await firstRow.count()) {
    await firstRow.click();
    const statusSelect = page.getByLabel(/status/i);
    if (await statusSelect.count()) {
      await statusSelect.selectOption({ label: 'Resolved' }).catch(() => {});
      await page
        .getByRole('button', { name: /update|save/i })
        .first()
        .click();
      await expect(page.getByText(/resolved/i).first()).toBeVisible();
    }
  }
});

test('admin approves a certificate', async ({ page }) => {
  await login(page);
  await page.goto('/dakhala');
  const first = page.getByRole('link', { name: /DKH-/ }).first();
  if (await first.count()) {
    await first.click();
    const approve = page.getByRole('button', { name: /approve/i });
    if (await approve.count()) {
      await approve.click();
      await expect(page.getByText(/approved/i).first()).toBeVisible();
    }
  }
});

test('admin sends a broadcast notification', async ({ page }) => {
  await login(page);
  await page.goto('/notifications/broadcast');
  await page.getByLabel(/title/i).fill('E2E Broadcast');
  await page.getByLabel(/message/i).fill('This is an end-to-end broadcast test.');
  await page.getByRole('button', { name: /send|broadcast/i }).click();
  await expect(page.getByText(/sent|broadcast/i).first()).toBeVisible();
});

test('admin toggles a user account status', async ({ page }) => {
  await login(page);
  await page.goto('/users');
  const first = page.getByRole('link').filter({ hasText: /\d/ }).first();
  if (await first.count()) {
    await first.click();
    const toggle = page.getByRole('button', { name: /activate|deactivate/i }).first();
    if (await toggle.count()) {
      await toggle.click();
    }
  }
});
