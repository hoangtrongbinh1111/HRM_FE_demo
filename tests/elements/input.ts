import { Page } from 'playwright';

const input = (page: Page) => ({
	locator: (selector: string) => {
		return {
			async fill(text: string) {
				await page.locator(selector).fill(text);
			},
		};
	},
});

export default input;
