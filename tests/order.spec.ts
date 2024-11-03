import { test, expect, Page } from '@playwright/test';
import { makeRamdomText } from '@/utils/commons';
import select from './elements/select';
import input from './elements/input';
import moment from 'moment';

const fillForm = async (page: Page, text: string) => {
	const date = moment().format('DD');
	await page.waitForTimeout(1000);
	await input(page).locator('#name').fill(text);
	await select(page).locator('#warehouseId').fill('h');
};

const fillModal = async (page: Page, text: string) => {
	await page.waitForTimeout(1000);
	await select(page).locator('#productId').fill('l');
	await input(page).locator('#quantity').fill('1');
	await input(page).locator('#price').fill('1');
};

const fillFormImport = async (page: Page, text: string) => {
	await page.waitForTimeout(1000);
	await select(page).locator('#warehouseId').fill('h');
	await select(page).locator('#orderId').fill(text);
	await page.keyboard.press('Enter');
	await page.waitForTimeout(1000);
	await input(page).locator('#description').fill(text);
};

const loginCreate = async (page: Page) => {
	await page.goto('/auth/boxed-signin');
	await page.getByTestId('username').fill('hc25');
	await page.getByTestId('password').fill('1');
	await page.getByTestId('submit').click();
	await page.waitForLoadState('networkidle');
};

const loginApprove = async (page: Page) => {
	await page.goto('/auth/boxed-signin');
	await page.getByTestId('username').fill('hc23');
	await page.getByTestId('password').fill('1');
	await page.getByTestId('submit').click();
	await page.waitForLoadState('networkidle');
};

const fillSendApprove = async (page: Page, text: string) => {
	await page.waitForTimeout(1000);
	await select(page).locator('#approverId').fill('lợi');
	await input(page).locator('#comment').fill(text);
};

// test.describe.serial('order CRUD', () => {
test.skip('proposal CRUD', () => {
	const text = makeRamdomText(5);
	const editText = text + 'edit';
	const searchText = 'search=' + text;
	const searchEditText = 'search=' + editText;

	test('01. Create', async ({ page }) => {
		// sign in
		await loginCreate(page);
		await page.waitForLoadState('networkidle');
		await page.goto('/warehouse-process/order');

		await page.getByTestId('add-order').click();
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL('/warehouse-process/order/create');

		await fillForm(page, text);
		await page.waitForTimeout(1000);

		await page.getByTestId('modal-order-btn').click();
		await fillModal(page, text);
		await page.getByTestId('submit-modal-btn').click();
		await page.waitForLoadState('networkidle');

		await page.getByTestId('submit-btn').first().click();
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL('/warehouse-process/order?warehouseId=');

		await page.waitForTimeout(1000);
		await page.getByTestId('search-order-input').fill(text);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('edit-order-btn').first().waitFor({ state: 'visible' });
		await page.waitForTimeout(1000);
		await expect(page.getByTestId('edit-order-btn')).toBeVisible();
	});

	test('02. Edit', async ({ page }) => {
		// sign in
		await loginCreate(page);
		await page.waitForLoadState('networkidle');
		await page.goto('/warehouse-process/order');

		await page.waitForTimeout(1000);
		await page.getByTestId('search-order-input').fill(text);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('edit-order-btn').first().click();
		await page.waitForLoadState('networkidle');

		await fillForm(page, editText);
		await page.waitForTimeout(1000);

		await page.getByTestId('submit-btn').click();

		await page.waitForLoadState('networkidle');
		await expect(page).toHaveURL('/warehouse-process/order?warehouseId=');

		await page.waitForTimeout(1000);
		await page.getByTestId('search-order-input').fill(editText);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('edit-order-btn').first().waitFor({ state: 'visible' });
		await page.waitForTimeout(1000);
		await expect(page.getByTestId('edit-order-btn')).toBeVisible();
	});

	test('03. Send approve', async ({ page }) => {
		// sign in
		await loginCreate(page);
		await page.waitForLoadState('networkidle');
		await page.goto('/warehouse-process/order');

		await page.waitForTimeout(1000);
		await page.getByTestId('search-order-input').fill(editText);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('detail-order-btn').first().click();
		await page.waitForLoadState('networkidle');

		await page.getByTestId('submit-approval-btn').click();

		await fillSendApprove(page, editText);
		await page.getByTestId('submit-modal-btn').first().click();
		await page.waitForLoadState('networkidle');
		await expect(page).toHaveURL('/warehouse-process/order?warehouseId=');

		await page.waitForTimeout(1000);
		await page.getByTestId('search-order-input').fill(editText);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('detail-order-btn').first().waitFor({ state: 'visible' });
	});

	test('04. Approve', async ({ page }) => {
		await loginApprove(page);

		await page.goto('/warehouse-process/order');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);
		await page.getByTestId('search-order-input').fill(editText);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('detail-order-btn').click();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		await page.getByTestId('submit-approve-btn').click();
		await page.locator('.testid-confirm-btn').first().click();

		await page.waitForLoadState('networkidle');
	});

	test('05. Create import', async ({ page }) => {
		//sign in
		await loginCreate(page);

		await page.goto('/warehouse-process/warehousing-bill/import');

		await page.getByTestId('add-import').click();
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL('/warehouse-process/warehousing-bill/import/create');

		await fillFormImport(page, editText);

		await page.waitForTimeout(1000);
		await page.getByTestId('submit-btn').click();

		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL('/warehouse-process/warehousing-bill/import');

		await page.waitForTimeout(1000);
		await page.getByTestId('search-import-input').fill(text);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('detail-import-btn').first().waitFor({ state: 'visible' });
	});

	test('06. Tally and finish', async ({ page }) => {
		await loginCreate(page);

		await page.goto('/warehouse-process/warehousing-bill/import');

		await page.getByTestId('search-import-input').fill(text);
		await page.waitForLoadState('networkidle');

		await page.getByTestId('detail-import-btn').first().click();
		await page.waitForLoadState('networkidle');

		await page.getByTestId('btn-tally').first().click();
		await select(page).locator('#quantity').fill('1');
		await page.getByTestId('btn-quantity').first().click();
		await page.waitForLoadState('networkidle');

		await page.getByTestId('submit-btn').first().click();
		await page.waitForLoadState('networkidle');
		await expect(page).toHaveURL('/warehouse-process/warehousing-bill/import');

		await page.waitForTimeout(2000);
		await page.getByTestId('search-import-input').fill(text);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('detail-import-btn').first().waitFor({ state: 'visible' });
	});
});
