import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { basename, resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dir, '../../../..');
const outDir = resolve(root, 'reports/skill-experiments/2026-05-11/batch-7/screenshots-v9');
mkdirSync(outDir, { recursive: true });

const viewports = [
	{ id: 'mobile', width: 390, height: 844 },
	{ id: 'tablet', width: 820, height: 1000 },
	{ id: 'desktop', width: 1440, height: 1000 }
];

interface SummaryEntry {
	readonly variant: string;
	readonly case: string;
	readonly ok: boolean;
	readonly formalOk: boolean;
	readonly auditOk: boolean;
	readonly projectDir: string;
	readonly logDir: string;
	readonly agentSeconds: number | null;
	readonly assertionFailures: readonly string[];
	readonly auditFailures: readonly string[];
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

const summaryPath = resolve(root, 'reports/skill-experiments/2026-05-11/batch-7/v9-summary.json');
const results = (JSON.parse(readFileSync(summaryPath, 'utf8')) as SummaryEntry[]).map((entry) => ({
	...entry,
	caseName: entry.case,
	failures: [...entry.assertionFailures, ...entry.auditFailures],
	shots: {} as Record<string, string>
}));

const browser = await chromium.launch();
try {
	for (const result of results) {
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

		try {
			await waitFor(url);
			for (const viewport of viewports) {
				const page = await browser.newPage({
					viewport: { width: viewport.width, height: viewport.height },
					deviceScaleFactor: 1
				});
				await page.goto(url, { waitUntil: 'networkidle' });
				await page.emulateMedia({ colorScheme: 'light' });
				const file = resolve(outDir, `${result.variant}-${result.caseName}-${viewport.id}.png`);
				await page.screenshot({ path: file, fullPage: true });
				await page.close();
				result.shots[viewport.id] = file;
			}
		} finally {
			stop(child);
		}
	}
} finally {
	await browser.close();
}

const htmlPath = resolve(outDir, 'contact-sheet.html');
const html = `<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<title>Batch 7 V9 Abstract Blocks Contact Sheet</title>
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
	<h1>Batch 7 V9 Abstract Blocks: Full-Page Viewports</h1>
	${results
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
		results.map((entry) => ({
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
