import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
	const { baseURL, storageState } = config.projects[0].use;
	const browser = await chromium.launch();
	const page = await browser.newPage();
	await page.goto(baseURL + '/auth/boxed-signin');

	await page.getByTestId('username').fill('admin');
	await page.getByTestId('password').fill('admin');

	await page.getByTestId('submit').click();

	await page.waitForLoadState('networkidle');
	await page.context().storageState({ path: storageState as string });
	await browser.close();
}

export default globalSetup;
