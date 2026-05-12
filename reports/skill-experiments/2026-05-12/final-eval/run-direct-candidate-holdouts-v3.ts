import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import {
	closeSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	openSync,
	readFileSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, resolve } from 'node:path';
import { chromium, type Browser } from 'playwright';
import { waitForUrl } from '../../../../packages/feedback-server/src/cli/launch-dashboard.ts';
import { runAgentExec } from '../../../../scripts/e2e/codex-runner.ts';
import { scaffoldDryuiConsumerProject } from '../../../../scripts/e2e/scaffold-adapter.ts';

const root = resolve(import.meta.dir, '../../../..');
const batch = resolve(root, 'reports/skill-experiments/2026-05-12/final-eval');
const tarballsDir = resolve(root, 'reports/e2e-tarballs');
const oldBatch8 = resolve(root, 'reports/skill-experiments/2026-05-11/batch-8');
const refs = resolve(batch, 'design-references');
const shotsDir = resolve(batch, 'screenshots-direct-v3');
mkdirSync(shotsDir, { recursive: true });

const variants = [
	{
		id: 'v22a-mobile-density-safe',
		skill: resolve(oldBatch8, 'v22a-mobile-density-safe/SKILL.md')
	},
	{
		id: 'v24a-v22-plus-preview-guard',
		skill: resolve(oldBatch8, 'v24a-v22-plus-preview-guard/SKILL.md')
	}
];

const cases = [
	{ id: 'calendar-ops', image: resolve(refs, 'calendar-ops.png') },
	{ id: 'inventory-admin', image: resolve(refs, 'inventory-admin.png') },
	{ id: 'support-inbox', image: resolve(refs, 'support-inbox.png') },
	{ id: 'finance-planning', image: resolve(refs, 'finance-planning.png') },
	{ id: 'course-portal', image: resolve(refs, 'course-portal.png') }
];

const viewports = [
	{ id: 'mobile', width: 390, height: 844 },
	{ id: 'tablet', width: 820, height: 1000 },
	{ id: 'desktop', width: 1440, height: 1000 }
];

const assertions = [
	{ kind: 'file-exists' as const, path: 'src/routes/+page.svelte' },
	{ kind: 'file-exists' as const, path: 'src/layout.css' },
	{
		kind: 'file-contains' as const,
		path: 'src/layout.css',
		needle: 'container: page / inline-size'
	},
	{
		kind: 'file-matches' as const,
		path: 'src/layout.css',
		regex: '@container\\s+page\\s+\\(min-width:'
	},
	{ kind: 'file-contains' as const, path: 'src/layout.css', needle: 'grid-template-areas' },
	{ kind: 'file-contains' as const, path: 'src/routes/+page.svelte', needle: '@dryui/ui' },
	{
		kind: 'file-matches' as const,
		path: 'src/routes/+page.svelte',
		regex: 'data-layout="[a-z0-9-]+-shell"'
	},
	{
		kind: 'file-matches' as const,
		path: 'src/routes/+page.svelte',
		regex: 'data-layout-area="page"'
	},
	{
		kind: 'file-matches' as const,
		path: 'src/routes/+page.svelte',
		regex: 'data-layout-area="primary"'
	},
	{
		kind: 'file-matches' as const,
		path: 'src/routes/+page.svelte',
		regex: 'data-layout-area="(topbar|navigation)"'
	}
];

interface SourceAudit {
	readonly failures: string[];
	readonly dryuiComponents: string[];
	readonly visibleWords: number;
}

interface ViewportAudit {
	readonly viewport: string;
	readonly screenshot: string;
	readonly horizontalOverflow: number;
	readonly shellWidthRatio: number;
	readonly shellTop: number;
	readonly primaryLargest: boolean;
	readonly lowContrastRatio: number;
	readonly scrollHeight: number;
}

interface Summary {
	readonly variant: string;
	readonly case: string;
	readonly ok: boolean;
	readonly score: number;
	readonly formalOk: boolean;
	readonly auditOk: boolean;
	readonly visualOk: boolean;
	readonly projectDir: string;
	readonly logDir: string;
	readonly devServer: { url: string; pid: number } | null;
	readonly agentSeconds: number | null;
	readonly source: SourceAudit;
	readonly visual: ViewportAudit[];
	readonly assertionFailures: string[];
}

function slug(value: string): string {
	return (
		value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'run'
	);
}

function routeStyleBlocks(page: string): string {
	return [...page.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi)]
		.map((match) => match[1])
		.join('\n');
}

function routeMarkup(page: string): string {
	return page
		.replace(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi, '')
		.replace(/<style(?:\s[^>]*)?>[\s\S]*?<\/style>/gi, '');
}

function visibleWordCount(markup: string): number {
	return (
		markup
			.replace(/<[^>]+>/g, ' ')
			.replace(/[{}()[\].,;:'"`/\\|+=*_<>-]/g, ' ')
			.toLowerCase()
			.match(/[a-z][a-z0-9]+/g) ?? []
	).length;
}

function countMatches(input: string, regex: RegExp): number {
	return [...input.matchAll(regex)].length;
}

function importedDryuiComponents(page: string): string[] {
	const components: string[] = [];
	for (const match of page.matchAll(
		/import\s*{([^}]+)}\s*from\s*['"]@dryui\/ui(?:\/[^'"]+)?['"]/g
	)) {
		components.push(
			...match[1]
				.split(',')
				.map((part) =>
					part
						.trim()
						.split(/\s+as\s+/i)[0]
						?.trim()
				)
				.filter(Boolean)
		);
	}
	for (const match of page.matchAll(
		/import\s+([A-Z][A-Za-z0-9]*)\s+from\s*['"]@dryui\/ui\/[^'"]+['"]/g
	)) {
		components.push(match[1]);
	}
	return [...new Set(components)];
}

function sourceAudit(projectDir: string): SourceAudit {
	const failures: string[] = [];
	const pagePath = resolve(projectDir, 'src/routes/+page.svelte');
	const layoutPath = resolve(projectDir, 'src/layout.css');
	const appPath = resolve(projectDir, 'src/app.css');
	const page = existsSync(pagePath) ? readFileSync(pagePath, 'utf8') : '';
	const layout = existsSync(layoutPath) ? readFileSync(layoutPath, 'utf8') : '';
	const app = existsSync(appPath) ? readFileSync(appPath, 'utf8') : '';
	const routeStyle = routeStyleBlocks(page);
	const markup = routeMarkup(page);
	const visibleWords = visibleWordCount(markup);
	const combined = `${page}\n${layout}\n${app}`;
	const dryuiComponents = importedDryuiComponents(page);

	if (!/from\s*['"]@dryui\/ui(?:\/[^'"]+)?['"]/.test(page))
		failures.push('missing @dryui/ui import');
	if (dryuiComponents.length < 3)
		failures.push(`too few DryUI imports (${dryuiComponents.length})`);
	if (visibleWords < 35) failures.push(`too little real visible content (${visibleWords} words)`);
	if (/<style(?:\s[^>]*)?>/i.test(page)) failures.push('route <style> block');

	for (const [regex, label] of [
		[/@media\b/i, '@media layout breakpoint'],
		[/\sstyle\s*=/i, 'inline style attribute'],
		[/\sstyle:/i, 'Svelte style directive'],
		[/:global\(/i, ':global selector'],
		[/!important/i, '!important'],
		[/<\s*(button|input|select|textarea|form|table)\b/, 'raw native control/table']
	] as const) {
		if (regex.test(combined)) failures.push(label);
	}

	if (
		/<\s*(Button|Input|Badge|Separator|Table\.[A-Za-z]+|Tabs\.[A-Za-z]+)\b[^>]*(\sclass\s*=|\sclass:)/.test(
			page
		)
	) {
		failures.push('class prop/directive on DryUI component');
	}
	if (/from\s*['"]@dryui\/ui\/table['"]/.test(page) || /<\s*Table(?:\s|>|\\.)/.test(page)) {
		failures.push('Table import/use can pass build but fail at runtime');
	}

	for (const [regex, label] of [
		[/display\s*:/i, 'display in route style'],
		[/grid-(template|area|column|row|auto|gap)\s*:/i, 'grid layout in route style'],
		[/flex(-direction|-wrap|-basis|-grow|-shrink)?\s*:/i, 'flex layout in route style'],
		[/container\s*:/i, 'container in route style'],
		[/@container\b/i, '@container in route style']
	] as const) {
		if (regex.test(routeStyle)) failures.push(label);
	}

	for (const [regex, label] of [
		[/display\s*:\s*(grid|flex)\b/i, 'display grid/flex in app.css'],
		[/grid-(template|area|column|row|auto|gap)\s*:/i, 'grid layout in app.css'],
		[/flex(-direction|-wrap|-basis|-grow|-shrink)?\s*:/i, 'flex layout in app.css'],
		[/(justify|align|place)-(content|items|self)\s*:/i, 'alignment layout in app.css'],
		[/(^|[{\s;])(row-|column-)?gap\s*:/i, 'gap layout in app.css'],
		[/(^|[{\s;])order\s*:/i, 'order layout in app.css'],
		[/(^|[{\s;])position\s*:/i, 'position layout in app.css'],
		[/(^|[{\s;])(inset|top|right|bottom|left)\s*:/i, 'offset layout in app.css'],
		[/(^|[{\s;])float\s*:/i, 'float layout in app.css'],
		[/container\s*:/i, 'container in app.css'],
		[/@container\b/i, '@container in app.css']
	] as const) {
		if (regex.test(app)) failures.push(label);
	}

	const appWithoutAllowedDefensiveSize = app.replace(
		/\[data-layout-area='primary'\][\s\S]*?\[data-layout='toolbar-cluster'\]\s*\{[\s\S]*?\}/g,
		''
	);
	if (
		/(^|[{\s;])(?:min-|max-)?(?:inline-size|block-size)\s*:/i.test(appWithoutAllowedDefensiveSize)
	) {
		failures.push('size layout outside defensive wrapper group in app.css');
	}
	if (
		/(^|,|\})\s*(button|input|textarea|select|svg|h1|h2|h3|p|a|span|div|section|article|ul|li|main)\b/im.test(
			app
		)
	) {
		failures.push('element selector in app.css');
	}

	for (const [regex, label] of [
		[
			/display\s*:\s*(none|block|contents|inline-flex|inline-block)\b/i,
			'invalid display in layout.css'
		],
		[/(^|[{\s;])(?:min-|max-)?inline-size\s*:/i, 'inline-size in layout.css'],
		[/(^|[{\s;])width\s*:/i, 'width in layout.css'],
		[/position\s*:/i, 'position in layout.css'],
		[/\[data-ui/i, 'data-ui selector in layout.css'],
		[/:(first-child|last-child|nth-child|not|is|where)\b/i, 'pseudo selector in layout.css'],
		[/(^|,|\})\s*(span|button|p|div|section|article|ul|li)\b/im, 'element selector in layout.css']
	] as const) {
		if (regex.test(layout)) failures.push(label);
	}

	if (!/container:\s*page\s*\/\s*inline-size/i.test(layout))
		failures.push('missing page inline-size container');
	if (countMatches(layout, /@container\s+page\s+\(min-width:/gi) < 2)
		failures.push('fewer than two page container breakpoints');
	if (
		/<\s*(span|p|article|li|small|strong|div)\b[^>]*data-layout-area=/i.test(
			markup.replace(/<div\s+data-layout-area=["']page["'][^>]*>/, '')
		)
	) {
		failures.push('nested primitive data-layout-area');
	}
	for (const area of [
		'primary',
		'topbar',
		'navigation',
		'secondary',
		'utility',
		'summary',
		'actions',
		'rail'
	]) {
		const count = countMatches(markup, new RegExp(`data-layout-area=["']${area}["']`, 'g'));
		if (count > 1) failures.push(`duplicate shell area ${area}`);
	}
	if (
		/\[data-layout=['"][^'"]+-shell['"]\]\s+\[data-layout-area=['"](rail|topbar|navigation|summary|primary|secondary|utility|actions)['"]\]/.test(
			layout
		)
	) {
		failures.push('broad descendant shell-area selector');
	}

	return { failures, dryuiComponents, visibleWords };
}

function manualAssertions(projectDir: string): string[] {
	const failures: string[] = [];
	for (const assertion of assertions) {
		const abs = resolve(projectDir, assertion.path);
		if (assertion.kind === 'file-exists') {
			if (!existsSync(abs)) failures.push(`file-exists: missing ${assertion.path}`);
			continue;
		}
		if (!existsSync(abs)) {
			failures.push(`${assertion.kind}: missing ${assertion.path}`);
			continue;
		}
		const content = readFileSync(abs, 'utf8');
		if (assertion.kind === 'file-contains' && !content.includes(assertion.needle)) {
			failures.push(`file-contains: ${assertion.path} missing "${assertion.needle}"`);
		}
		if (assertion.kind === 'file-matches' && !new RegExp(assertion.regex, 'i').test(content)) {
			failures.push(`file-matches: ${assertion.path} failed /${assertion.regex}/i`);
		}
	}
	return failures;
}

async function visualAudit(
	browser: Browser,
	url: string,
	variant: string,
	caseId: string
): Promise<ViewportAudit[]> {
	const audits: ViewportAudit[] = [];
	for (const viewport of viewports) {
		const page = await browser.newPage({
			viewport: { width: viewport.width, height: viewport.height },
			deviceScaleFactor: 1
		});
		await page.emulateMedia({ colorScheme: 'light' });
		await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
		const metrics = await page.evaluate(() => {
			function parseRgb(value: string): [number, number, number, number] | null {
				const match = value.match(/rgba?\(([^)]+)\)/);
				if (!match) return null;
				const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
				if (parts.length < 3) return null;
				return [parts[0], parts[1], parts[2], parts[3] ?? 1];
			}
			function luminance(rgb: [number, number, number, number]): number {
				const [r, g, b] = rgb.slice(0, 3).map((channel) => {
					const value = channel / 255;
					return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
				});
				return 0.2126 * r + 0.7152 * g + 0.0722 * b;
			}
			function contrast(
				fg: [number, number, number, number],
				bg: [number, number, number, number]
			): number {
				const a = luminance(fg);
				const b = luminance(bg);
				return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
			}
			function backgroundFor(element: Element): [number, number, number, number] {
				let current: Element | null = element;
				while (current) {
					const parsed = parseRgb(getComputedStyle(current).backgroundColor);
					if (parsed && parsed[3] > 0.05) return parsed;
					current = current.parentElement;
				}
				return [255, 255, 255, 1];
			}
			const shell = document.querySelector('[data-layout$="-shell"]') ?? document.body;
			const shellRect = shell.getBoundingClientRect();
			const body = document.body;
			const root = document.documentElement;
			const areas = [...document.querySelectorAll('[data-layout-area]')]
				.filter((element) => element.getAttribute('data-layout-area') !== 'page')
				.map((element) => {
					const rect = element.getBoundingClientRect();
					return {
						area: element.getAttribute('data-layout-area') ?? '',
						value: Math.max(0, rect.width) * Math.max(0, rect.height)
					};
				});
			const primary = areas.find((area) => area.area === 'primary')?.value ?? 0;
			const otherMax = Math.max(
				0,
				...areas.filter((area) => area.area !== 'primary').map((area) => area.value)
			);
			const textNodes = [...document.querySelectorAll('body *')].filter((element) => {
				const text = element.textContent?.trim() ?? '';
				const rect = element.getBoundingClientRect();
				return text.length > 0 && rect.width > 0 && rect.height > 0;
			});
			let contrastChecks = 0;
			let lowContrast = 0;
			for (const element of textNodes) {
				const fg = parseRgb(getComputedStyle(element).color);
				if (!fg) continue;
				contrastChecks += 1;
				if (contrast(fg, backgroundFor(element)) < 4.2) lowContrast += 1;
			}
			return {
				horizontalOverflow: Math.max(0, root.scrollWidth - window.innerWidth),
				shellWidthRatio: shellRect.width / window.innerWidth,
				shellTop: shellRect.top,
				primaryLargest: primary >= otherMax * 0.9,
				lowContrastRatio: contrastChecks === 0 ? 0 : lowContrast / contrastChecks,
				scrollHeight: Math.max(body.scrollHeight, root.scrollHeight)
			};
		});
		const screenshot = resolve(shotsDir, `${variant}-${caseId}-${viewport.id}.png`);
		await page.screenshot({ path: screenshot, fullPage: false, timeout: 12_000 });
		void page.close().catch(() => {});
		audits.push({ viewport: viewport.id, screenshot, ...metrics });
	}
	return audits;
}

function scoreExperiment(summary: Omit<Summary, 'score' | 'ok' | 'visualOk' | 'auditOk'>): {
	score: number;
	auditOk: boolean;
	visualOk: boolean;
	ok: boolean;
} {
	let score = 100;
	score -= summary.assertionFailures.length * 8;
	score -= summary.source.failures.length * 7;
	if (!summary.formalOk) score -= 20;
	const visualFailures: string[] = [];
	for (const viewport of summary.visual) {
		if (viewport.horizontalOverflow > 2) {
			score -= 10;
			visualFailures.push(`${viewport.viewport} overflow`);
		}
		if (viewport.lowContrastRatio > 0.08) {
			score -= 8;
			visualFailures.push(`${viewport.viewport} contrast`);
		}
		if (viewport.shellTop > 24) {
			score -= 4;
			visualFailures.push(`${viewport.viewport} delayed shell`);
		}
		if (viewport.viewport !== 'mobile' && viewport.shellWidthRatio < 0.78) {
			score -= 7;
			visualFailures.push(`${viewport.viewport} narrow shell`);
		}
		if (viewport.viewport === 'desktop' && !viewport.primaryLargest) {
			score -= 8;
			visualFailures.push('desktop primary not dominant');
		}
		if (viewport.viewport === 'mobile' && viewport.scrollHeight > 2800) {
			score -= 5;
			visualFailures.push('mobile overlong');
		}
	}
	const auditOk = summary.source.failures.length === 0;
	const visualOk = visualFailures.length === 0;
	return {
		score: Math.max(0, Math.round(score)),
		auditOk,
		visualOk,
		ok: summary.formalOk && auditOk && visualOk
	};
}

function getFreePort(): Promise<number> {
	return new Promise((resolvePort, reject) => {
		const server = createServer();
		server.listen(0, '127.0.0.1', () => {
			const address = server.address();
			if (address && typeof address === 'object') {
				const port = address.port;
				server.close(() => resolvePort(port));
			} else {
				server.close(() => reject(new Error('could not allocate port')));
			}
		});
		server.on('error', reject);
	});
}

function killProcess(child: ChildProcess | null): void {
	if (!child?.pid) return;
	try {
		process.kill(-child.pid, 'SIGTERM');
	} catch {
		try {
			child.kill('SIGTERM');
		} catch {}
	}
}

async function runCommand(
	command: string,
	args: string[],
	cwd: string,
	logPath: string
): Promise<boolean> {
	const fd = openSync(logPath, 'w');
	try {
		return await new Promise<boolean>((resolveRun) => {
			const child = spawn(command, args, { cwd, stdio: ['ignore', fd, fd] });
			child.on('close', (code) => resolveRun(code === 0));
			child.on('error', () => resolveRun(false));
		});
	} finally {
		closeSync(fd);
	}
}

async function startDev(
	projectDir: string,
	logDir: string
): Promise<{ child: ChildProcess; url: string } | null> {
	const port = await getFreePort();
	const fd = openSync(resolve(logDir, 'dev-server.log'), 'w');
	const child = spawn(
		'bun',
		['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
		{
			cwd: projectDir,
			stdio: ['ignore', fd, fd],
			detached: true
		}
	);
	closeSync(fd);
	const url = `http://127.0.0.1:${port}/`;
	if (!(await waitForUrl(url, 30_000))) {
		killProcess(child);
		return null;
	}
	return { child, url };
}

function promptForCase(): string {
	return [
		'Use the supplied web-app design image as the reference.',
		'Build a finished DryUI web app page in this generated SvelteKit project.',
		'Use the available dryui-build skill for DryUI components, layout hooks, CSS discipline, and validation.',
		'Match the reference page type, information hierarchy, responsive shell, density, and visual tone.',
		'Use real app content rather than block placeholders.',
		'Use mobile-first responsive layout with page container queries rather than viewport media queries for layout shifts.',
		'Keep the result readable on mobile, tablet, and desktop, with no horizontal overflow.',
		'Run bun run build after editing. Do not run a dev server or browser screenshot checks; the experiment harness handles those after you finish.'
	].join('\n');
}

async function runOne(
	variant: (typeof variants)[number],
	testCase: (typeof cases)[number]
): Promise<Summary> {
	const name = `direct-${variant.id}-${testCase.id}`;
	const projectDir = mkdtempSync(resolve(tmpdir(), `dryui-e2e-${slug(name)}-`));
	const logDir = resolve(root, 'reports/e2e-runs', `${slug(name)}-${Date.now()}`);
	mkdirSync(logDir, { recursive: true });
	console.log(`[direct-final] ${variant.id}/${testCase.id} scaffold`);
	scaffoldDryuiConsumerProject({
		projectDir,
		tarballsDir,
		logPath: resolve(logDir, 'scaffold.log')
	});
	process.env.DRYUI_E2E_DRYUI_BUILD_SKILL_OVERRIDE = variant.skill;
	console.log(`[direct-final] ${variant.id}/${testCase.id} codex`);
	const codex = await runAgentExec({
		backend: 'codex',
		projectDir,
		prompt: promptForCase(),
		promptImages: [testCase.image],
		logDir,
		model: 'gpt-5.5',
		effort: 'low',
		timeoutMs: 240_000,
		useLocalFeedbackMcp: false,
		onStderrLine: (line) => {
			if (line.trim() && !line.includes('interface.icon_')) {
				console.error(`[direct-final:${variant.id}/${testCase.id}] ${line}`);
			}
		}
	});
	const agentSeconds = Math.round(codex.durationMs / 100) / 10;
	const buildOk =
		codex.ok &&
		(await runCommand('bun', ['run', 'build'], projectDir, resolve(logDir, 'build.log')));
	let dev: { child: ChildProcess; url: string } | null = null;
	let source = sourceAudit(projectDir);
	let visual: ViewportAudit[] = [];
	try {
		if (buildOk) {
			dev = await startDev(projectDir, logDir);
			if (dev) {
				const browser = await chromium.launch();
				try {
					visual = await Promise.race([
						visualAudit(browser, dev.url, variant.id, testCase.id),
						new Promise<ViewportAudit[]>((_, reject) =>
							setTimeout(() => reject(new Error('visual audit timed out after 45s')), 45_000)
						)
					]);
				} catch (err) {
					source = {
						...source,
						failures: [
							...source.failures,
							`visual audit error: ${err instanceof Error ? err.message : String(err)}`
						]
					};
				} finally {
					await Promise.race([
						browser.close(),
						new Promise((resolveClose) => setTimeout(resolveClose, 3_000))
					]).catch(() => {});
					const child = (
						browser as unknown as { process?: () => { kill?: (signal?: string) => void } | null }
					).process?.();
					child?.kill?.('SIGKILL');
				}
			} else {
				source = { ...source, failures: [...source.failures, 'dev server failed'] };
			}
		}
		const assertionFailures = manualAssertions(projectDir);
		const formalOk = codex.ok && buildOk && assertionFailures.length === 0;
		const partial = {
			variant: variant.id,
			case: testCase.id,
			formalOk,
			projectDir,
			logDir,
			devServer: dev ? { url: dev.url, pid: dev.child.pid ?? 0 } : null,
			agentSeconds,
			source,
			visual,
			assertionFailures
		};
		const scored = scoreExperiment(partial);
		const summary: Summary = { ...partial, ...scored };
		console.log(
			`[direct-final] ${variant.id}/${testCase.id} ${summary.score}/100 ${summary.ok ? 'PASS' : 'CHECK'}`
		);
		return summary;
	} finally {
		killProcess(dev?.child ?? null);
		rmSync(projectDir, { recursive: true, force: true });
	}
}

const summaries: Summary[] = [];

for (const variant of variants) {
	for (let index = 0; index < cases.length; index += 2) {
		const group = cases.slice(index, index + 2);
		const results = await Promise.all(group.map((testCase) => runOne(variant, testCase)));
		summaries.push(...results);
		writeFileSync(
			resolve(batch, 'candidate-holdouts-direct-v3-summary.json'),
			`${JSON.stringify(summaries, null, 2)}\n`
		);
	}
}

summaries.sort((a, b) => b.score - a.score);
writeFileSync(
	resolve(batch, 'candidate-holdouts-direct-v3-summary.json'),
	`${JSON.stringify(summaries, null, 2)}\n`
);

const htmlPath = resolve(shotsDir, 'contact-sheet.html');
const html = `<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<title>Direct Candidate Holdout Eval v3</title>
	<style>
		body { margin: 0; padding: 24px; font-family: Inter, system-ui, sans-serif; background: #f3f4f6; color: #111827; }
		h1 { margin: 0 0 6px; font-size: 24px; }
		.note { margin: 0 0 18px; color: #4b5563; font-size: 13px; }
		.run { margin: 0 0 22px; padding: 16px; background: #fff; border: 1px solid #d1d5db; border-radius: 8px; }
		.title { display: flex; flex-wrap: wrap; gap: 10px; align-items: baseline; margin: 0 0 10px; font-weight: 700; }
		.score { padding: 3px 8px; border-radius: 999px; background: #111827; color: #fff; font-size: 12px; }
		.score.good { background: #047857; }
		.score.warn { background: #b45309; }
		.failures { margin: -2px 0 12px; color: #991b1b; font-size: 12px; }
		.grid { display: grid; grid-template-columns: 390px 410px 720px; gap: 12px; align-items: start; }
		.shot { margin: 0; background: #e5e7eb; border: 1px solid #cbd5e1; overflow: visible; }
		.shot h2 { margin: 0; padding: 8px 10px; background: #111827; color: #fff; font-size: 12px; }
		.shot img { display: block; width: 100%; height: auto; }
	</style>
</head>
<body>
	<h1>Direct Candidate Holdout Eval v3</h1>
	<p class="note">Top historical candidates × five holdout references. Screenshots show the actual mobile, tablet, and desktop viewport; scroll height is scored separately.</p>
	${summaries
		.map((entry) => {
			const failures = [...entry.assertionFailures, ...entry.source.failures];
			const scoreClass = entry.score >= 85 ? 'good' : entry.score >= 70 ? 'warn' : '';
			return `<section class="run">
		<p class="title">${entry.variant} / ${entry.case} <span class="score ${scoreClass}">${entry.score}/100</span></p>
		${failures.length ? `<p class="failures">${failures.join('<br>')}</p>` : ''}
		<div class="grid">
			${viewports
				.map((viewport) => {
					const shot = entry.visual.find((item) => item.viewport === viewport.id)?.screenshot;
					return `<figure class="shot"><h2>${viewport.id} ${viewport.width}px</h2>${shot ? `<img src="file://${shot}" alt="${entry.variant} ${entry.case} ${viewport.id}">` : ''}</figure>`;
				})
				.join('')}
		</div>
	</section>`;
		})
		.join('\n')}
</body>
</html>`;

writeFileSync(htmlPath, html);
const sheetPath = resolve(shotsDir, 'contact-sheet.png');
const browser = await chromium.launch();
try {
	const page = await browser.newPage({
		viewport: { width: 1620, height: 1100 },
		deviceScaleFactor: 1
	});
	await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
	await page.screenshot({ path: sheetPath, fullPage: true });
	await page.close();
} finally {
	await browser.close();
}

writeFileSync(
	resolve(shotsDir, 'captured.json'),
	`${JSON.stringify(
		summaries.map((entry) => ({
			...entry,
			visual: entry.visual.map((item) => ({ ...item, screenshot: basename(item.screenshot) }))
		})),
		null,
		2
	)}\n`
);

console.log(`DIRECT_CANDIDATE_SUMMARY ${JSON.stringify(summaries, null, 2)}`);
console.log(`DIRECT_CANDIDATE_CONTACT_SHEET ${sheetPath}`);
