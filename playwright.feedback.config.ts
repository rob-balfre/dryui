import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173';
const webServer = process.env.PLAYWRIGHT_BASE_URL
	? undefined
	: {
			command: 'bun --bun vite dev --host 127.0.0.1 --port 4173',
			cwd: './apps/docs',
			env: { ...process.env, PUBLIC_MAPBOX_TOKEN: '' },
			url: baseURL,
			reuseExistingServer: true,
			timeout: 120_000
		};

export default defineConfig({
	testDir: './tests/playwright',
	testMatch: /feedback-bounds\.spec\.ts$/,
	fullyParallel: false,
	forbidOnly: true,
	retries: 0,
	timeout: 600_000,
	use: {
		baseURL,
		browserName: 'chromium',
		headless: true,
		viewport: { width: 1440, height: 1200 },
		deviceScaleFactor: 1,
		colorScheme: 'dark',
		reducedMotion: 'reduce',
		locale: 'en-US',
		timezoneId: 'UTC'
	},
	outputDir: './tests/playwright/feedback-bounds-results',
	webServer
});
