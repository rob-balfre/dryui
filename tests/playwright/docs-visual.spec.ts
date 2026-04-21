import { expect, test } from '@playwright/test';
import {
	docsSmokeRoutes,
	docsVisualRoutes,
	expectDocsRoute,
	screenshotName
} from './docs-visual.helpers';

for (const route of docsVisualRoutes) {
	test(`${route.kind} ${route.name}`, async ({ page }) => {
		const target = await expectDocsRoute(page, route);
		await expect(target).toHaveScreenshot(screenshotName(route));
	});
}

for (const route of docsSmokeRoutes) {
	test(route.name, async ({ page }) => {
		const target = await expectDocsRoute(page, route);
		await expect(target).toHaveScreenshot(screenshotName(route));
	});
}
