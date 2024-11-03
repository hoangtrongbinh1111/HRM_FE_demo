import { test, expect, Page } from '@playwright/test';
import { makeRamdomText } from '@/utils/commons';
import input from './elements/input';
import select from './elements/select';

const fillProductForm = async (page: Page, text: string) => {
	await page.waitForTimeout(1000);

	await input(page).locator('#name').fill(text);
	await input(page).locator('#code').fill(text);

	await select(page).locator('#unitId').fill('g');
	await select(page).locator('#categoryId').fill('V');

	await input(page).locator('#minQuantity').fill('1');
	await input(page).locator('#maxQuantity').fill('10');
};

test.describe.serial('Product CRUD', () => {
	const text = 'san pham' + makeRamdomText(5);
	const editText = text + 'edit';
	test('01. Create', async ({ page }) => {
		await page.goto('warehouse/product/list');

		await page.getByTestId('add-product').click();
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL('warehouse/product/list/create');

		await fillProductForm(page, text);
		await page.getByTestId('submit-btn').click();

		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL('warehouse/product/list?warehouseId=');

		await page.getByTestId('search-product-input').fill(text);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('edit-product-btn').first().waitFor({ state: 'visible' });
		await page.waitForTimeout(1000);
		await expect(page.getByTestId('edit-product-btn')).toBeVisible();
	});

	test('02. Edit', async ({ page }) => {
		await page.goto('warehouse/product/list');

		await page.getByTestId('search-product-input').fill(text);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('edit-product-btn').first().click();
		await page.waitForLoadState('networkidle');

		await fillProductForm(page, editText);
		await page.getByTestId('submit-btn').click();

		await page.waitForLoadState('networkidle');
		await expect(page).toHaveURL('/warehouse/product/list?warehouseId=');

		await page.getByTestId('search-product-input').fill(editText);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('edit-product-btn').first().waitFor({ state: 'visible' });
		await page.waitForTimeout(1000);
		await expect(page.getByTestId('edit-product-btn')).toBeVisible();
	});

	test('03. Delete', async ({ page }) => {
		await page.goto('warehouse/product/list');

		await page.getByTestId('search-product-input').fill(editText);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('delete-product-btn').first().click();
		await page.waitForLoadState('networkidle');

		await page.locator('.testid-confirm-btn').first().click();

		await page.waitForLoadState('networkidle');

		await expect(page.getByTestId('delete-product-btn')).not.toBeVisible();
	});
});
