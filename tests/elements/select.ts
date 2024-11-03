import { Page } from 'playwright';

const select = (page: Page) => ({
	locator: (selector: string) => {
		return {
			async fill(text: string) {
				await page.locator(selector).click();
				await page.keyboard.type(text);
				await page.waitForLoadState('networkidle');
				await page.waitForTimeout(300);
				await page.keyboard.press('Enter');
			},
		};
	},
});

export default select;
