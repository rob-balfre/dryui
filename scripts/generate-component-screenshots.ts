import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright';
import { allComponentNames, toSlug } from '../apps/docs/src/lib/nav';

interface ScreenshotResult {
	name: string;
	slug: string;
	path: string;
	mode: 'live' | 'custom' | 'thumbnail';
}

const root = fileURLToPath(new URL('../', import.meta.url));
const outputDir = fileURLToPath(new URL('../tmp/component-screenshots/', import.meta.url));
const baseURL = process.env.COMPONENT_SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:4173';
const shouldStartServer = !process.argv.includes('--no-server');
const only = readFlag('--only');

const names = allComponentNames().filter((name) => {
	if (!only) return true;
	const query = only.toLowerCase();
	return name.toLowerCase().includes(query) || toSlug(name).includes(query);
});

if (names.length === 0) {
	throw new Error(`No components matched ${only ? `"${only}"` : 'the current filters'}.`);
}

const targetPath = `/view/components/${toSlug(names[0]!)}`;

const docsServer = shouldStartServer
	? Bun.spawn(
			[
				'bun',
				'run',
				'--filter',
				'@dryui/docs',
				'dev',
				'--',
				'--host',
				'127.0.0.1',
				'--port',
				'4173'
			],
			{
				cwd: root,
				env: process.env,
				stdin: 'ignore',
				stdout: 'ignore',
				stderr: 'inherit'
			}
		)
	: null;

try {
	if (docsServer) {
		console.log(`Starting docs server at ${baseURL}`);
		await waitForServer(baseURL, targetPath, docsServer);
	}

	await rm(outputDir, { recursive: true, force: true });
	await mkdir(outputDir, { recursive: true });

	const browser = await chromium.launch();

	try {
		const page = await browser.newPage({
			viewport: { width: 1440, height: 1200 },
			colorScheme: 'light',
			deviceScaleFactor: 1,
			locale: 'en-US',
			timezoneId: 'UTC',
			reducedMotion: 'reduce'
		});
		page.setDefaultTimeout(90_000);

		const manifest: ScreenshotResult[] = [];

		for (const name of names) {
			const slug = toSlug(name);
			const route = `/view/components/${slug}`;

			console.log(`Capturing ${name}`);
			await page.goto(`${baseURL}${route}`, {
				waitUntil: 'domcontentloaded',
				timeout: 90_000
			});
			await forceLightTheme(page);
			await waitForPreview(page);

			const mode = await readPreviewMode(page);
			const target = await selectScreenshotTarget(page, mode);
			const path = join(outputDir, `${slug}.png`);

			await target.screenshot({
				path,
				animations: 'disabled',
				caret: 'hide',
				scale: 'css'
			});

			manifest.push({
				name,
				slug,
				path,
				mode
			});
		}

		await writeFile(join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
		console.log(`Saved ${manifest.length} component screenshots to ${outputDir}`);
	} finally {
		await browser.close();
	}
} finally {
	if (docsServer) {
		docsServer.kill();
		await docsServer.exited;
	}
}

function readFlag(flag: string): string | null {
	const index = process.argv.indexOf(flag);
	return index >= 0 ? (process.argv[index + 1] ?? null) : null;
}

async function waitForServer(
	currentBaseURL: string,
	currentTargetPath: string,
	server: Bun.Subprocess<'ignore', 'ignore', 'inherit'>
): Promise<void> {
	const timeoutAt = Date.now() + 60_000;

	while (Date.now() < timeoutAt) {
		if (server.exitCode !== null) {
			throw new Error(`Docs server exited early with code ${server.exitCode}.`);
		}

		try {
			const response = await fetch(`${currentBaseURL}${currentTargetPath}`);
			if (response.ok) return;
		} catch {
			// Server is still booting.
		}

		await sleep(500);
	}

	throw new Error(
		`Docs server did not become ready at ${currentBaseURL}${currentTargetPath} within 60s.`
	);
}

async function forceLightTheme(page: import('playwright').Page): Promise<void> {
	await page.evaluate(() => {
		document.documentElement.classList.remove('theme-auto', 'theme-dark');
		document.documentElement.classList.add('theme-light');
	});

	await page.waitForFunction(() => document.documentElement.classList.contains('theme-light'));
}

async function waitForPreview(page: import('playwright').Page): Promise<void> {
	await page.waitForSelector('[data-component-screenshot-page]');
	await page.waitForFunction(() => {
		if (document.fonts?.status === 'loading') return false;
		return Boolean(
			document.querySelector('.preview-panel') ||
			document.querySelector('[data-component-preview-root]')
		);
	});
}

async function readPreviewMode(
	page: import('playwright').Page
): Promise<'live' | 'custom' | 'thumbnail'> {
	const mode = await page
		.locator('[data-component-screenshot-page]')
		.getAttribute('data-preview-mode');

	if (mode === 'live' || mode === 'custom' || mode === 'thumbnail') {
		return mode;
	}

	throw new Error(`Unexpected preview mode "${mode ?? 'missing'}".`);
}

async function selectScreenshotTarget(
	page: import('playwright').Page,
	mode: 'live' | 'custom' | 'thumbnail'
): Promise<import('playwright').Locator> {
	if (mode === 'live') {
		const panel = page.locator('.preview-panel').first();
		await panel.waitFor();
		return panel;
	}

	const previewRoot = page.locator('[data-component-preview-root]').first();
	await previewRoot.waitFor();
	return previewRoot;
}
