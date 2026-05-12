import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { basename, resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dir, '../../../..');
const batch = resolve(root, 'reports/skill-experiments/2026-05-11/batch-7');
const outDir = resolve(batch, 'screenshots-v10');
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
	readonly devServer?: {
		readonly url: string;
		readonly pid: number;
	};
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

async function isReady(url: string): Promise<boolean> {
	try {
		const response = await fetch(url);
		return response.ok;
	} catch {
		return false;
	}
}

async function waitFor(url: string): Promise<void> {
	const started = Date.now();
	while (Date.now() - started < 30_000) {
		if (await isReady(url)) return;
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

async function serverFor(entry: SummaryEntry): Promise<{
	readonly url: string;
	readonly child: ChildProcessWithoutNullStreams | null;
	readonly source: 'e2e' | 'temporary';
}> {
	if (entry.devServer?.url && (await isReady(entry.devServer.url))) {
		return { url: entry.devServer.url, child: null, source: 'e2e' };
	}

	const port = await freePort();
	const child = spawn('bun', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)], {
		cwd: entry.projectDir,
		stdio: 'pipe'
	});
	const url = `http://127.0.0.1:${port}/`;
	await waitFor(url);
	return { url, child, source: 'temporary' };
}

const summaryPath = resolve(batch, 'v10-summary.json');
const results = (JSON.parse(readFileSync(summaryPath, 'utf8')) as SummaryEntry[]).map((entry) => ({
	...entry,
	caseName: entry.case,
	failures: [...entry.assertionFailures, ...entry.auditFailures],
	shots: {} as Record<string, string>,
	captureUrl: '',
	captureServerSource: '' as 'e2e' | 'temporary' | ''
}));

const browser = await chromium.launch();
try {
	for (const result of results) {
		const server = await serverFor(result);
		result.captureUrl = server.url;
		result.captureServerSource = server.source;

		try {
			for (const viewport of viewports) {
				const page = await browser.newPage({
					viewport: { width: viewport.width, height: viewport.height },
					deviceScaleFactor: 1
				});
				await page.emulateMedia({ colorScheme: 'light' });
				await page.goto(server.url, { waitUntil: 'networkidle' });
				const file = resolve(outDir, `${result.variant}-${result.caseName}-${viewport.id}.png`);
				await page.screenshot({ path: file, fullPage: true });
				await page.close();
				result.shots[viewport.id] = file;
			}
		} finally {
			if (server.child) stop(server.child);
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
	<title>Batch 7 V10 Consolidated Layout Contact Sheet</title>
	<style>
		body {
			margin: 0;
			padding: 24px;
			font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
			background: #f3f4f6;
			color: #111827;
		}
		h1 {
			margin: 0 0 6px;
			font-size: 24px;
		}
		.note {
			margin: 0 0 18px;
			font-size: 13px;
			color: #4b5563;
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
			flex-wrap: wrap;
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
		.meta {
			font-size: 12px;
			font-weight: 500;
			color: #4b5563;
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
			margin: 0;
			background: #e5e7eb;
			border: 1px solid #cbd5e1;
			overflow: visible;
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
	<h1>Batch 7 V10 Consolidated Layout: Full-Page Viewports</h1>
	<p class="note">Each image is a full-page screenshot. The desktop column is scaled down to fit the sheet, not cropped.</p>
	${results
		.map((entry) => {
			const failure =
				entry.failures.length > 0 ? `<p class="failure">${entry.failures.join('<br>')}</p>` : '';
			const source =
				entry.captureServerSource === 'e2e' ? 'live E2E server' : 'temporary capture server';
			return `<section class="run">
		<p class="title">${entry.variant} / ${entry.caseName} <span class="status ${entry.ok ? '' : 'fail'}">${entry.ok ? 'PASS' : 'FAIL'}</span> <span class="meta">${source}: ${entry.captureUrl}</span></p>
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
			variant: entry.variant,
			case: entry.caseName,
			ok: entry.ok,
			formalOk: entry.formalOk,
			auditOk: entry.auditOk,
			projectDir: entry.projectDir,
			logDir: entry.logDir,
			devServer: entry.devServer,
			captureUrl: entry.captureUrl,
			captureServerSource: entry.captureServerSource,
			failures: entry.failures,
			shots: Object.fromEntries(
				Object.entries(entry.shots).map(([key, value]) => [key, basename(value)])
			)
		})),
		null,
		2
	)}\n`
);

console.log(sheetPath);
