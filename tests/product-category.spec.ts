import { test, expect, Page } from '@playwright/test';
import { makeRamdomText } from '@/utils/commons';
import select from './elements/select';
import input from './elements/input';

const fillForm = async (page: Page, text: string) => {
	await page.waitForTimeout(1000);
	await input(page).locator('#name').fill(text);
	await select(page).locator('#warehouseId').fill('hanh');
};

test.describe.serial('Product Category CRUD', () => {
	const text = 'danh muc' + makeRamdomText(5);
	const editText = text + 'edit';
	test('01. Create', async ({ page }) => {
		await page.goto('/warehouse/product/category');

		await page.getByTestId('add-category').click();
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL('/warehouse/product/category/create');

		await fillForm(page, text);
		await page.getByTestId('submit-btn').click();

		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL('warehouse/product/category?warehouseId=');

		await page.getByTestId('search-category-input').fill(text);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('edit-category-btn').first().waitFor({ state: 'visible' });
		await page.waitForTimeout(1000);
		await expect(page.getByTestId('edit-category-btn')).toBeVisible();
	});

	test('02. Edit', async ({ page }) => {
		await page.goto('/warehouse/product/category');

		await page.getByTestId('search-category-input').fill(text);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('edit-category-btn').first().click();
		await page.waitForLoadState('networkidle');

		await fillForm(page, editText);
		await page.getByTestId('submit-btn').click();

		await page.waitForLoadState('networkidle');
		await expect(page).toHaveURL('warehouse/product/category?warehouseId=');

		await page.getByTestId('search-category-input').fill(editText);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('edit-category-btn').first().waitFor({ state: 'visible' });
		await page.waitForTimeout(1000);
		await expect(page.getByTestId('edit-category-btn')).toBeVisible();
	});

	test('03. Delete', async ({ page }) => {
		await page.goto('/warehouse/product/category');

		await page.getByTestId('search-category-input').fill(editText);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('delete-category-btn').first().click();
		await page.waitForLoadState('networkidle');

		await page.locator('.testid-confirm-btn').first().click();

		await page.waitForLoadState('networkidle');

		await expect(page.getByTestId('delete-category-btn')).not.toBeVisible();
	});
});
