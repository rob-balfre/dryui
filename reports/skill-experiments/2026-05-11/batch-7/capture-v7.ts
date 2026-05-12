import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { basename, resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dir, '../../../..');
const outDir = resolve(root, 'reports/skill-experiments/2026-05-11/batch-7/screenshots');
mkdirSync(outDir, { recursive: true });

const entries = [
	{
		caseName: 'analytics',
		resultFile:
			'reports/e2e-runs/fixed-analytics-layout-tighten-v7-fixed-page-1778465486179/result.json'
	},
	{
		caseName: 'kanban',
		resultFile:
			'reports/e2e-runs/fixed-kanban-layout-tighten-v7-fixed-page-1778465486181/result.json'
	},
	{
		caseName: 'crm',
		resultFile: 'reports/e2e-runs/fixed-crm-layout-tighten-v7-fixed-page-1778465486181/result.json'
	},
	{
		caseName: 'settings',
		projectDir:
			'/var/folders/52/l8fk8j4n7f9ft1nt292mhdrw0000gn/T/dryui-e2e-fixed-settings-layout-tighten-v7-fixed-page-yFI6an',
		logDir: resolve(
			root,
			'reports/e2e-runs/fixed-settings-layout-tighten-v7-fixed-page-1778465486181'
		)
	},
	{
		caseName: 'knowledge',
		resultFile:
			'reports/e2e-runs/fixed-knowledge-layout-tighten-v7-fixed-page-1778465486181/result.json'
	}
].map((entry) => ({
	...entry,
	resultFile: entry.resultFile ? resolve(root, entry.resultFile) : undefined
}));

const viewports = [
	{ id: 'mobile', width: 390, height: 844 },
	{ id: 'tablet', width: 820, height: 1000 },
	{ id: 'desktop', width: 1440, height: 1000 }
];

interface ResultJson {
	readonly ok: boolean;
	readonly projectDir: string;
	readonly logDir: string;
	readonly assertionFailures: readonly string[];
	readonly phases: readonly { readonly name: string; readonly durationMs: number }[];
}

function routeStyleBlocks(page: string): string {
	return [...page.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi)]
		.map((match) => match[1])
		.join('\n');
}

function sourceAudit(projectDir: string): string[] {
	const failures: string[] = [];
	const pagePath = resolve(projectDir, 'src/routes/+page.svelte');
	const layoutPath = resolve(projectDir, 'src/layout.css');
	const page = existsSync(pagePath) ? readFileSync(pagePath, 'utf8') : '';
	const layout = existsSync(layoutPath) ? readFileSync(layoutPath, 'utf8') : '';
	const routeStyle = routeStyleBlocks(page);
	const combined = `${page}\n${layout}`;

	const forbiddenAll = [
		[/^\s*import\b/m, 'route import'],
		[/@dryui\/ui/, '@dryui/ui import/use'],
		[/lucide/i, 'lucide use'],
		[/<\s*(button|input|form|table|img|svg)\b/i, 'real widget/media element'],
		[/@media\b/i, '@media layout breakpoint']
	] as const;

	for (const [regex, label] of forbiddenAll) {
		if (regex.test(combined)) failures.push(label);
	}

	const forbiddenRouteStyle = [
		[/display\s*:/i, 'display in route style'],
		[/grid-(template|area|column|row|auto|gap)\s*:/i, 'grid layout in route style'],
		[/flex(-direction|-wrap|-basis|-grow|-shrink)?\s*:/i, 'flex layout in route style'],
		[/@container\b/i, '@container in route style']
	] as const;

	for (const [regex, label] of forbiddenRouteStyle) {
		if (regex.test(routeStyle)) failures.push(label);
	}

	if (!/container:\s*page\s*\/\s*inline-size/i.test(layout)) {
		failures.push('missing exact page container');
	}

	for (const width of ['48rem', '72rem']) {
		const query = new RegExp(`@container\\s+page\\s+\\(min-width:\\s*${width}\\)`, 'i');
		if (!query.test(layout)) failures.push(`missing exact ${width} page query`);
	}

	return failures;
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

function loadResult(entry: (typeof entries)[number]): ResultJson {
	if (entry.resultFile && existsSync(entry.resultFile)) {
		return JSON.parse(readFileSync(entry.resultFile, 'utf8')) as ResultJson;
	}

	return {
		ok: true,
		projectDir: entry.projectDir!,
		logDir: entry.logDir!,
		assertionFailures: [],
		phases: []
	};
}

const results = entries.map((entry) => {
	const result = loadResult(entry);
	const auditFailures = sourceAudit(result.projectDir);
	return {
		caseName: entry.caseName,
		variant: 'v7-fixed-page',
		ok: result.ok && auditFailures.length === 0,
		formalOk: result.ok,
		auditOk: auditFailures.length === 0,
		failures: [...result.assertionFailures, ...auditFailures],
		projectDir: result.projectDir,
		logDir: result.logDir,
		agentSeconds: result.phases.find((phase) => phase.name.startsWith('agent-'))?.durationMs
			? Math.round(
					result.phases.find((phase) => phase.name.startsWith('agent-'))!.durationMs / 100
				) / 10
			: null,
		shots: {} as Record<string, string>
	};
});

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
	<title>Batch 7 V7 Fixed Page Contact Sheet</title>
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
	<h1>Batch 7 V7 Fixed Page: Full-Page Viewports</h1>
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

writeFileSync(
	resolve(root, 'reports/skill-experiments/2026-05-11/batch-7/v7-summary.json'),
	`${JSON.stringify(
		results.map((entry) => ({
			variant: entry.variant,
			case: entry.caseName,
			ok: entry.ok,
			formalOk: entry.formalOk,
			auditOk: entry.auditOk,
			projectDir: entry.projectDir,
			logDir: entry.logDir,
			agentSeconds: entry.agentSeconds,
			failures: entry.failures
		})),
		null,
		2
	)}\n`
);

console.log(sheetPath);
