import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { basename, resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dir, '../../../..');
const outDir = resolve(root, 'reports/skill-experiments/2026-05-11/batch-6/screenshots');
mkdirSync(outDir, { recursive: true });

const resultFiles = [
	'reports/e2e-runs/tighten-v1-blueprint-kanban-layout-tighten-v1-blueprint-1778462207729/result.json',
	'reports/e2e-runs/tighten-v1-blueprint-settings-layout-tighten-v1-blueprint-1778462207732/result.json',
	'reports/e2e-runs/tighten-v1-blueprint-knowledge-layout-tighten-v1-blueprint-1778462207732/result.json',
	'reports/e2e-runs/tighten-v2-chrome-kanban-layout-tighten-v2-chrome-1778462432419/result.json',
	'reports/e2e-runs/tighten-v2-chrome-settings-layout-tighten-v2-chrome-1778462432420/result.json',
	'reports/e2e-runs/tighten-v2-chrome-knowledge-layout-tighten-v2-chrome-1778462432420/result.json',
	'reports/e2e-runs/tighten-v3-proportion-kanban-layout-tighten-v3-proportion-1778462698030/result.json',
	'reports/e2e-runs/tighten-v3-proportion-settings-layout-tighten-v3-proportion-1778462698031/result.json',
	'reports/e2e-runs/tighten-kanban-layout-tighten-v4-recipes-1778463458973/result.json',
	'reports/e2e-runs/tighten-settings-layout-tighten-v4-recipes-1778463458974/result.json',
	'reports/e2e-runs/tighten-knowledge-layout-tighten-v4-recipes-1778463458974/result.json',
	'reports/e2e-runs/tighten-knowledge-layout-tighten-v5-repair-1778463754223/result.json'
].map((path) => resolve(root, path));

const viewports = [
	{ id: 'mobile', width: 390, height: 844 },
	{ id: 'tablet', width: 820, height: 1000 },
	{ id: 'desktop', width: 1440, height: 1000 }
];

interface ResultJson {
	readonly name: string;
	readonly runLabel: string;
	readonly ok: boolean;
	readonly projectDir: string;
	readonly assertionFailures: readonly string[];
}

function slug(input: string): string {
	return input
		.replace(/^layout-tighten-/, '')
		.replace(/^tighten-/, '')
		.replace(/[^a-z0-9]+/gi, '-')
		.toLowerCase();
}

async function freePort(): Promise<number> {
	return await new Promise((resolvePort, reject) => {
		const server = createServer();
		server.unref();
		server.on('error', reject);
		server.listen(0, '127.0.0.1', () => {
			const address = server.address();
			if (address && typeof address === 'object') {
				const port = address.port;
				server.close(() => resolvePort(port));
			} else {
				server.close(() => reject(new Error('Could not allocate port')));
			}
		});
	});
}

async function waitFor(url: string): Promise<void> {
	const started = Date.now();
	while (Date.now() - started < 30_000) {
		try {
			const response = await fetch(url);
			if (response.ok) return;
		} catch {
			// Retry until Vite is ready.
		}
		await new Promise((resolveWait) => setTimeout(resolveWait, 250));
	}
	throw new Error(`Timed out waiting for ${url}`);
}

function stop(child: ChildProcessWithoutNullStreams): void {
	child.kill('SIGTERM');
	setTimeout(() => {
		if (!child.killed) child.kill('SIGKILL');
	}, 2_000).unref();
}

const results = resultFiles
	.filter((file) => existsSync(file))
	.map((file) => JSON.parse(readFileSync(file, 'utf8')) as ResultJson);

const browser = await chromium.launch();
const captured: Array<{
	variant: string;
	caseName: string;
	ok: boolean;
	failures: readonly string[];
	shots: Record<string, string>;
}> = [];

try {
	for (const result of results) {
		const variant = slug(result.runLabel);
		const caseName = slug(result.name).replace(/^v[0-9]-[a-z]+-/, '');
		const port = await freePort();
		const child = spawn(
			'bun',
			['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)],
			{
				cwd: result.projectDir,
				stdio: 'pipe'
			}
		);
		const url = `http://127.0.0.1:${port}/`;
		const entry = {
			variant,
			caseName,
			ok: result.ok,
			failures: result.assertionFailures,
			shots: {} as Record<string, string>
		};

		try {
			await waitFor(url);
			for (const viewport of viewports) {
				const page = await browser.newPage({
					viewport: { width: viewport.width, height: viewport.height },
					deviceScaleFactor: 1
				});
				await page.goto(url, { waitUntil: 'networkidle' });
				await page.emulateMedia({ colorScheme: 'light' });
				const file = resolve(outDir, `${variant}-${caseName}-${viewport.id}.png`);
				await page.screenshot({ path: file, fullPage: true });
				await page.close();
				entry.shots[viewport.id] = file;
			}
		} finally {
			stop(child);
		}

		captured.push(entry);
	}
} finally {
	await browser.close();
}

const htmlPath = resolve(outDir, 'contact-sheet.html');
const html = `<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<title>Batch 6 Layout Tightening Contact Sheet</title>
	<style>
		body {
			margin: 0;
			padding: 24px;
			font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
			background: #f3f4f6;
			color: #111827;
		}
		h1 {
			margin: 0 0 18px;
			font-size: 24px;
		}
		.run {
			margin: 0 0 22px;
			padding: 16px;
			background: #ffffff;
			border: 1px solid #d1d5db;
			border-radius: 8px;
		}
		.title {
			display: flex;
			gap: 12px;
			align-items: baseline;
			margin: 0 0 12px;
			font-weight: 700;
		}
		.status {
			font-size: 12px;
			font-weight: 700;
			color: #ffffff;
			border-radius: 999px;
			padding: 3px 8px;
			background: #047857;
		}
		.status.fail {
			background: #b91c1c;
		}
		.failure {
			margin: -4px 0 12px;
			font-size: 12px;
			color: #991b1b;
		}
		.grid {
			display: grid;
			grid-template-columns: 390px 410px 720px;
			gap: 12px;
			align-items: start;
		}
		.shot {
			background: #e5e7eb;
			border: 1px solid #cbd5e1;
			overflow: hidden;
		}
		.shot h2 {
			margin: 0;
			padding: 8px 10px;
			font-size: 12px;
			background: #111827;
			color: #ffffff;
		}
		.shot img {
			display: block;
			width: 100%;
			height: auto;
		}
	</style>
</head>
<body>
	<h1>Batch 6 Layout Tightening: Full-Page Viewports</h1>
	${captured
		.map((entry) => {
			const failure =
				entry.failures.length > 0 ? `<p class="failure">${entry.failures.join('<br>')}</p>` : '';
			return `<section class="run">
		<p class="title">${entry.variant} / ${entry.caseName} <span class="status ${entry.ok ? '' : 'fail'}">${entry.ok ? 'PASS' : 'FAIL'}</span></p>
		${failure}
		<div class="grid">
			${viewports
				.map(
					(viewport) =>
						`<figure class="shot"><h2>${viewport.id} ${viewport.width}px</h2><img src="file://${entry.shots[viewport.id]}" alt="${entry.variant} ${entry.caseName} ${viewport.id}"></figure>`
				)
				.join('')}
		</div>
	</section>`;
		})
		.join('\n')}
</body>
</html>`;

writeFileSync(htmlPath, html);

const sheetPath = resolve(outDir, 'contact-sheet.png');
const sheetBrowser = await chromium.launch();
try {
	const page = await sheetBrowser.newPage({
		viewport: { width: 1620, height: 1100 },
		deviceScaleFactor: 1
	});
	await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
	await page.screenshot({ path: sheetPath, fullPage: true });
	await page.close();
} finally {
	await sheetBrowser.close();
}

writeFileSync(
	resolve(outDir, 'captured.json'),
	`${JSON.stringify(
		captured.map((entry) => ({
			...entry,
			shots: Object.fromEntries(
				Object.entries(entry.shots).map(([key, value]) => [key, basename(value)])
			)
		})),
		null,
		2
	)}\n`
);

console.log(sheetPath);
