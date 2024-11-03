import { test, expect } from '@playwright/test';

test('should login success with valid credentials', async ({ page }) => {
	await page.goto('/auth/boxed-signin');

	await page.getByTestId('username').fill('admin');
	await page.getByTestId('password').fill('admin');

	await page.getByTestId('submit').click();

	await page.waitForLoadState('networkidle');

	await expect(page).toHaveURL('/hrm/dashboard');
});

test('should login failed with invalid credentials', async ({ page }) => {
	await page.goto('/auth/boxed-signin');

	await page.getByTestId('username').fill('admin');
	await page.getByTestId('password').fill('admin1');

	await page.getByTestId('submit').click();

	await page.waitForLoadState('networkidle');

	await expect(page).toHaveURL('/auth/boxed-signin');
});

