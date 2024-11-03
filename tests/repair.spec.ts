import { test, expect, Page } from '@playwright/test';
import { makeRamdomText } from '@/utils/commons';
import select from './elements/select';
import input from './elements/input';

const fillForm = async (page: Page, text: string) => {
	await page.waitForTimeout(1000);
	await input(page).locator('#vehicleRegistrationNumber').fill(text);
	await select(page).locator('#repairById').fill('a');
	await input(page).locator('#customerName').fill(text);
	await input(page).locator('#description').fill(text);
	await input(page).locator('#damageLevel').fill(text);
};

const fillModal = async (page: Page, text: string) => {
	await page.waitForTimeout(1000);
	await select(page).locator('#replacementPartId').fill('l');
	await input(page).locator('#quantity').fill('10');
	await input(page).locator('#brokenPart').fill(text);
	await input(page).locator('#note').fill(text);
};

const fillFormExport = async (page: Page, text: string) => {
	await page.waitForTimeout(1000);
	await select(page).locator('#warehouseId').fill('gara');
	await select(page).locator('#repairRequestId').fill(text);
	await page.keyboard.press('Enter');
	await page.waitForTimeout(1000);
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

// test.describe.serial('repair CRUD', () => {
test.skip('repair CRUD', () => {
	const text = makeRamdomText(5);
	const editText = text + 'edit';
	const searchText = 'search=' + text;
	const searchEditText = 'search=' + editText;

	test('01. Create', async ({ page }) => {
		//sign in
		await loginCreate(page);

		await page.goto('/warehouse-process/repair');

		await page.getByTestId('add-repair').click();
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL('/warehouse-process/repair/create');

		await fillForm(page, text);
		await page.getByTestId('modal-repair-btn').click();

		await fillModal(page, text);
		await page.waitForTimeout(1000);

		await page.getByTestId('submit-modal-btn').click();
		await page.waitForTimeout(1000);

		await page.getByTestId('submit-btn').click();

		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL('/warehouse-process/repair');

		await page.waitForTimeout(1000);
		await page.getByTestId('search-repair-input').fill(text);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('edit-repair-btn').first().waitFor({ state: 'visible' });
		await page.waitForTimeout(1000);
		await expect(page.getByTestId('edit-repair-btn')).toBeVisible();
	});

	test('02. Edit', async ({ page }) => {
		await loginCreate(page);
		await page.goto('/warehouse-process/repair');

		await page.waitForTimeout(1000);
		await page.getByTestId('search-repair-input').fill(text);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('edit-repair-btn').first().click();
		await page.waitForLoadState('networkidle');

		await fillForm(page, editText);
		await page.waitForTimeout(1000);

		await page.getByTestId('submit-btn').click();

		await page.waitForLoadState('networkidle');
		await expect(page).toHaveURL('/warehouse-process/repair');

		await page.waitForTimeout(1000);
		await page.getByTestId('search-repair-input').fill(editText);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('edit-repair-btn').first().waitFor({ state: 'visible' });
		await page.waitForTimeout(1000);
		await expect(page.getByTestId('edit-repair-btn')).toBeVisible();
	});

	test('03. Send approve', async ({ page }) => {
		await loginCreate(page);

		await page.goto('/warehouse-process/repair');

		await page.waitForTimeout(1000);
		await page.getByTestId('search-repair-input').fill(editText);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('detail-repair-btn').first().click();
		await page.waitForLoadState('networkidle');

		await page.getByTestId('submit-continue-btn').click();

		await fillSendApprove(page, editText);
		await page.waitForLoadState('networkidle');
		await page.getByTestId('submit-modal-btn').first().click();
		await expect(page).toHaveURL('/warehouse-process/repair');

		await page.waitForTimeout(1000);
		await page.getByTestId('search-repair-input').fill(editText);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('detail-repair-btn').first().waitFor({ state: 'visible' });
	});

	test('04. Repair approve', async ({ page }) => {
		await loginApprove(page);

		await page.goto('/warehouse-process/repair');

		await page.waitForTimeout(1000);
		await page.waitForLoadState('networkidle');

		await page.getByTestId('search-repair-input').fill(editText);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		await page.getByTestId('detail-repair-btn').click();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		await page.getByTestId('submit-approve-btn').click();

		await page.locator('.testid-confirm-btn').first().click();

		await page.waitForLoadState('networkidle');
	});

	test('05. Create export', async ({ page }) => {
		//sign in
		await loginCreate(page);

		await page.goto('/warehouse-process/warehousing-bill/export');

		await page.getByTestId('add-export').click();
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL('/warehouse-process/warehousing-bill/export/create');

		await fillFormExport(page, text);
		await page.waitForTimeout(1000);
		await page.waitForLoadState('networkidle');
		await page.getByTestId('submit-btn').first().click();
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveURL('/warehouse-process/warehousing-bill/export');

		await page.waitForTimeout(1000);
		await page.getByTestId('search-export-input').fill(text);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('detail-export-btn').first().waitFor({ state: 'visible' });
	});

	test('06. Tally and finish', async ({ page }) => {
		await loginCreate(page);

		await page.goto('/warehouse-process/warehousing-bill/export');

		await page.getByTestId('search-export-input').fill(text);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('detail-export-btn').first().click();
		await page.waitForLoadState('networkidle');

		await page.getByTestId('btn-tally').first().click();
		await select(page).locator('#quantity').fill('1');
		await page.getByTestId('btn-quantity').first().click();
		await page.waitForLoadState('networkidle');

		await page.getByTestId('submit-complete-btn').first().click();
		await page.waitForLoadState('networkidle');
		await expect(page).toHaveURL('/warehouse-process/warehousing-bill/export');

		await page.waitForTimeout(2000);
		await page.getByTestId('search-export-input').fill(text);
		await page.keyboard.press('Enter');
		await page.waitForLoadState('networkidle');

		await page.getByTestId('detail-export-btn').first().waitFor({ state: 'visible' });
	});
});
