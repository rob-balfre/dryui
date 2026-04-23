/**
 * Aggregates DryUI E2E run results into a single self-contained HTML report.
 *
 * Scans reports/e2e-runs/ * /result.json (written by the scenario harness),
 * sorts newest-first by startedAt, and emits:
 *   - reports/e2e-runs/index.html    (full report, grouped by scenario name)
 *   - reports/e2e-runs/latest.html   (copy of index.html for bookmarking)
 *
 * All CSS/JS is inlined so the file works over file:// with no server.
 * Screenshots are referenced relatively (e.g. dashboard-<ts>/screenshots/home.png).
 *
 * Usage:
 *   bun run scripts/e2e/generate-report.ts               # default output path
 *   bun run scripts/e2e/generate-report.ts --out <path>  # override output file
 *
 * Design taste: dark glass, warm amber accents, monospace for metrics.
 */

import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..', '..');
const runsDir = resolve(repoRoot, 'reports/e2e-runs');

interface Phase {
	name: string;
	ok: boolean;
	durationMs: number;
	note: string | null;
}

interface CodexSummary {
	exitCode: number | null;
	durationMs: number;
	eventCount: number;
	fileChanges: string[];
	tokens: { input: number | null; cached: number | null; output: number | null };
	lastMessage: string;
}

interface Screenshot {
	label: string;
	path: string;
	url: string;
}

interface ResultFile {
	schemaVersion: number;
	name: string;
	ok: boolean;
	startedAt: string;
	finishedAt: string;
	projectDir: string;
	logDir: string;
	devServer: { url: string; pid: number } | null;
	phases: Phase[];
	codex: CodexSummary | null;
	screenshots: Screenshot[];
	assertionFailures: string[];
}

interface LoadedRun {
	readonly dirName: string; // relative subdir under reports/e2e-runs
	readonly result: ResultFile;
}

function parseArgs(argv: string[]): { out: string } {
	let out = resolve(runsDir, 'index.html');
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i]!;
		const next = argv[i + 1];
		if ((arg === '--out' || arg === '-o') && next) {
			out = resolve(next);
			i++;
		} else if (arg === '--help' || arg === '-h') {
			console.log(
				`Usage: bun run scripts/e2e/generate-report.ts [--out <path>]\n\n` +
					`Aggregates reports/e2e-runs/ * /result.json into a self-contained HTML report.`
			);
			process.exit(0);
		} else {
			console.error(`Unknown flag: ${arg}`);
			process.exit(2);
		}
	}
	return { out };
}

function safeString(value: unknown, fallback = ''): string {
	return typeof value === 'string' ? value : fallback;
}

function safeBool(value: unknown, fallback = false): boolean {
	return typeof value === 'boolean' ? value : fallback;
}

function safeNumberOrNull(value: unknown): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function safeArray<T>(value: unknown, coerce: (item: unknown) => T | null): T[] {
	if (!Array.isArray(value)) return [];
	const out: T[] = [];
	for (const item of value) {
		const coerced = coerce(item);
		if (coerced !== null) out.push(coerced);
	}
	return out;
}

function coercePhase(raw: unknown): Phase | null {
	if (!raw || typeof raw !== 'object') return null;
	const obj = raw as Record<string, unknown>;
	const name = safeString(obj.name);
	if (!name) return null;
	return {
		name,
		ok: safeBool(obj.ok),
		durationMs: safeNumberOrNull(obj.durationMs) ?? 0,
		note: typeof obj.note === 'string' ? obj.note : null
	};
}

function coerceScreenshot(raw: unknown): Screenshot | null {
	if (!raw || typeof raw !== 'object') return null;
	const obj = raw as Record<string, unknown>;
	const label = safeString(obj.label);
	const path = safeString(obj.path);
	const url = safeString(obj.url);
	if (!path) return null;
	return { label: label || path, path, url };
}

function coerceCodex(raw: unknown): CodexSummary | null {
	if (!raw || typeof raw !== 'object') return null;
	const obj = raw as Record<string, unknown>;
	const tokensRaw = (obj.tokens ?? {}) as Record<string, unknown>;
	const fileChanges = Array.isArray(obj.fileChanges)
		? obj.fileChanges.filter((x): x is string => typeof x === 'string')
		: [];
	return {
		exitCode: safeNumberOrNull(obj.exitCode),
		durationMs: safeNumberOrNull(obj.durationMs) ?? 0,
		eventCount: safeNumberOrNull(obj.eventCount) ?? 0,
		fileChanges,
		tokens: {
			input: safeNumberOrNull(tokensRaw.input),
			cached: safeNumberOrNull(tokensRaw.cached),
			output: safeNumberOrNull(tokensRaw.output)
		},
		lastMessage: safeString(obj.lastMessage)
	};
}

function coerceResult(raw: unknown, dirName: string): ResultFile | null {
	if (!raw || typeof raw !== 'object') return null;
	const obj = raw as Record<string, unknown>;
	const name = safeString(obj.name);
	const startedAt = safeString(obj.startedAt);
	if (!name || !startedAt) {
		console.warn(`[generate-report] ${dirName}/result.json missing name or startedAt — skipping`);
		return null;
	}
	const assertionFailuresRaw = obj.assertionFailures;
	const assertionFailures = Array.isArray(assertionFailuresRaw)
		? assertionFailuresRaw.filter((x): x is string => typeof x === 'string')
		: [];
	return {
		schemaVersion: safeNumberOrNull(obj.schemaVersion) ?? 1,
		name,
		ok: safeBool(obj.ok),
		startedAt,
		finishedAt: safeString(obj.finishedAt),
		projectDir: safeString(obj.projectDir),
		logDir: safeString(obj.logDir),
		devServer:
			obj.devServer && typeof obj.devServer === 'object'
				? {
						url: safeString((obj.devServer as Record<string, unknown>).url),
						pid: safeNumberOrNull((obj.devServer as Record<string, unknown>).pid) ?? 0
					}
				: null,
		phases: safeArray(obj.phases, coercePhase),
		codex: coerceCodex(obj.codex),
		screenshots: safeArray(obj.screenshots, coerceScreenshot),
		assertionFailures
	};
}

function loadRuns(): LoadedRun[] {
	if (!existsSync(runsDir)) return [];
	const entries = readdirSync(runsDir, { withFileTypes: true });
	const runs: LoadedRun[] = [];
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const resultPath = resolve(runsDir, entry.name, 'result.json');
		if (!existsSync(resultPath)) continue;
		let raw: unknown;
		try {
			raw = JSON.parse(readFileSync(resultPath, 'utf8'));
		} catch (err) {
			console.warn(
				`[generate-report] failed to parse ${entry.name}/result.json — skipping (${
					err instanceof Error ? err.message : String(err)
				})`
			);
			continue;
		}
		const coerced = coerceResult(raw, entry.name);
		if (!coerced) continue;
		runs.push({ dirName: entry.name, result: coerced });
	}
	return runs;
}

function sortNewestFirst(runs: LoadedRun[]): LoadedRun[] {
	return [...runs].sort((a, b) => {
		const ta = Date.parse(a.result.startedAt);
		const tb = Date.parse(b.result.startedAt);
		const safeA = Number.isFinite(ta) ? ta : 0;
		const safeB = Number.isFinite(tb) ? tb : 0;
		return safeB - safeA;
	});
}

function groupByScenario(runs: LoadedRun[]): Map<string, LoadedRun[]> {
	const groups = new Map<string, LoadedRun[]>();
	for (const run of runs) {
		const list = groups.get(run.result.name) ?? [];
		list.push(run);
		groups.set(run.result.name, list);
	}
	return groups;
}

function htmlEscape(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function attr(value: string): string {
	return htmlEscape(value);
}

function formatDurationMs(ms: number): string {
	if (!Number.isFinite(ms) || ms < 0) return '–';
	if (ms < 1000) return `${Math.round(ms)}ms`;
	if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
	const minutes = Math.floor(ms / 60_000);
	const seconds = Math.round((ms % 60_000) / 1000);
	return `${minutes}m ${seconds}s`;
}

function formatNumber(value: number | null): string {
	if (value === null) return '–';
	return value.toLocaleString('en-US');
}

function formatAgo(iso: string, now: number): string {
	const then = Date.parse(iso);
	if (!Number.isFinite(then)) return iso || '(unknown)';
	const delta = Math.max(0, now - then);
	if (delta < 45_000) return 'just now';
	if (delta < 90_000) return '1 minute ago';
	if (delta < 60 * 60_000) return `${Math.round(delta / 60_000)} minutes ago`;
	if (delta < 90 * 60_000) return '1 hour ago';
	if (delta < 24 * 60 * 60_000) return `${Math.round(delta / (60 * 60_000))} hours ago`;
	if (delta < 48 * 60 * 60_000) return 'yesterday';
	if (delta < 30 * 24 * 60 * 60_000) return `${Math.round(delta / (24 * 60 * 60_000))} days ago`;
	const d = new Date(then);
	return d.toISOString().slice(0, 10);
}

function truncate(input: string, max: number): { text: string; truncated: boolean } {
	if (input.length <= max) return { text: input, truncated: false };
	return { text: input.slice(0, max).trimEnd() + '…', truncated: true };
}

function renderPhaseChip(p: Phase): string {
	const cls = p.ok ? 'phase phase-ok' : 'phase phase-fail';
	const dot = p.ok ? '●' : '×';
	const note = p.note ? ` title="${attr(p.note)}"` : '';
	return `<span class="${cls}"${note}><span class="phase-dot">${dot}</span>${htmlEscape(
		p.name
	)}<span class="phase-dur">${htmlEscape(formatDurationMs(p.durationMs))}</span></span>`;
}

type ShotCache = Map<string, string | null>;

function shotCacheKey(run: LoadedRun, shot: Screenshot): string {
	return `${run.dirName}/${shot.path}`;
}

function shotAnchorId(run: LoadedRun, shot: Screenshot): string {
	const safeLabel = (shot.label || 'shot').replace(/[^a-zA-Z0-9_-]+/g, '-');
	return `shot-${run.dirName}-${safeLabel}`;
}

// Build one data URI per shot per render pass. Resolving relative to runsDir
// (not result.logDir) keeps the output portable across machines.
function buildShotCache(runs: LoadedRun[]): ShotCache {
	const cache: ShotCache = new Map();
	for (const run of runs) {
		for (const shot of run.result.screenshots) {
			const key = shotCacheKey(run, shot);
			if (cache.has(key)) continue;
			try {
				const bytes = readFileSync(resolve(runsDir, run.dirName, shot.path));
				cache.set(key, `data:image/png;base64,${bytes.toString('base64')}`);
			} catch (err) {
				console.warn(
					`[generate-report] could not embed screenshot ${shot.path} for ${run.dirName}: ${
						err instanceof Error ? err.message : String(err)
					}`
				);
				cache.set(key, null);
			}
		}
	}
	return cache;
}

function renderScreenshotThumb(run: LoadedRun, shot: Screenshot, cache: ShotCache): string {
	const embedded = cache.get(shotCacheKey(run, shot)) ?? null;
	const label = shot.label || 'screenshot';
	const urlTitle = shot.url ? ` — ${shot.url}` : '';
	const titleAttr = attr(label + urlTitle);
	if (embedded === null) {
		return `<span class="shot shot-missing" title="${titleAttr}"><span class="shot-label">${htmlEscape(
			label
		)} (missing)</span></span>`;
	}
	// Chrome blocks top-level nav to data: URIs from clicks, so the thumb links
	// to an on-page :target lightbox anchor instead of opening the data URI.
	const anchorId = shotAnchorId(run, shot);
	return `<a class="shot" href="#${attr(anchorId)}" title="${titleAttr}"><img loading="lazy" src="${attr(
		embedded
	)}" alt="${attr(label)}" /><span class="shot-label">${htmlEscape(label)}</span></a>`;
}

function renderScreenshotLightbox(run: LoadedRun, shot: Screenshot, cache: ShotCache): string {
	const embedded = cache.get(shotCacheKey(run, shot)) ?? null;
	if (embedded === null) return '';
	const anchorId = shotAnchorId(run, shot);
	const label = shot.label || 'screenshot';
	const urlLine = shot.url ? `<div class="lightbox-url">${htmlEscape(shot.url)}</div>` : '';
	return `<a class="lightbox" id="${attr(anchorId)}" href="#" aria-label="close"><figure class="lightbox-inner"><img src="${attr(
		embedded
	)}" alt="${attr(label)}" /><figcaption class="lightbox-cap"><span class="lightbox-label">${htmlEscape(
		label
	)}</span>${urlLine}<span class="lightbox-hint">click anywhere to close</span></figcaption></figure></a>`;
}

function renderRunCard(run: LoadedRun, now: number, cache: ShotCache): string {
	const r = run.result;
	const statusClass = r.ok ? 'status-ok' : 'status-fail';
	const statusLabel = r.ok ? 'PASS' : 'FAIL';
	const phases = r.phases.map(renderPhaseChip).join('');
	const shots = r.screenshots.map((s) => renderScreenshotThumb(run, s, cache)).join('');

	const codexBlock = r.codex
		? (() => {
				const c = r.codex!;
				const lm = truncate(c.lastMessage || '', 500);
				const fileChanges = c.fileChanges.length
					? `<ul class="file-changes">${c.fileChanges
							.slice(0, 30)
							.map((f) => `<li><code>${htmlEscape(f)}</code></li>`)
							.join('')}${
							c.fileChanges.length > 30
								? `<li class="more">… and ${c.fileChanges.length - 30} more</li>`
								: ''
						}</ul>`
					: '<p class="muted">No file changes recorded.</p>';
				return `<div class="codex">
			<div class="metrics">
				<div><span class="m-label">duration</span><span class="m-val">${htmlEscape(
					formatDurationMs(c.durationMs)
				)}</span></div>
				<div><span class="m-label">events</span><span class="m-val">${htmlEscape(
					formatNumber(c.eventCount)
				)}</span></div>
				<div><span class="m-label">files</span><span class="m-val">${htmlEscape(
					formatNumber(c.fileChanges.length)
				)}</span></div>
				<div><span class="m-label">tok in</span><span class="m-val">${htmlEscape(
					formatNumber(c.tokens.input)
				)}</span></div>
				<div><span class="m-label">cached</span><span class="m-val">${htmlEscape(
					formatNumber(c.tokens.cached)
				)}</span></div>
				<div><span class="m-label">tok out</span><span class="m-val">${htmlEscape(
					formatNumber(c.tokens.output)
				)}</span></div>
			</div>
			${
				lm.text
					? `<details class="last-message">
				<summary>Codex final message${lm.truncated ? ' (truncated)' : ''}</summary>
				<pre>${htmlEscape(lm.text)}</pre>
			</details>`
					: ''
			}
			<details class="file-changes-wrap">
				<summary>File changes (${c.fileChanges.length})</summary>
				${fileChanges}
			</details>
		</div>`;
			})()
		: '<p class="muted">Codex did not run.</p>';

	const failuresBlock = r.assertionFailures.length
		? `<details open class="failures">
			<summary>Assertion failures (${r.assertionFailures.length})</summary>
			<ul>${r.assertionFailures.map((f) => `<li><code>${htmlEscape(f)}</code></li>`).join('')}</ul>
		</details>`
		: '';

	const devServerBlock = r.devServer
		? `<div class="dev-link"><span class="m-label">dev server</span> <a href="${attr(
				r.devServer.url
			)}" target="_blank" rel="noopener"><code>${htmlEscape(
				r.devServer.url
			)}</code></a> <span class="muted">(pid ${r.devServer.pid})</span></div>`
		: '';

	const logLink = r.logDir
		? `<div class="log-link"><span class="m-label">log dir</span> <code>${htmlEscape(
				r.logDir
			)}</code></div>`
		: '';

	return `<article class="run ${statusClass}" data-scenario="${attr(r.name)}">
		<header class="run-head">
			<span class="badge ${statusClass}">${statusLabel}</span>
			<h3>${htmlEscape(r.name)}</h3>
			<time datetime="${attr(r.startedAt)}" title="${attr(r.startedAt)}">${htmlEscape(
				formatAgo(r.startedAt, now)
			)}</time>
		</header>
		${shots ? `<div class="shots">${shots}</div>` : ''}
		<div class="phases">${phases}</div>
		${codexBlock}
		${failuresBlock}
		${devServerBlock}
		${logLink}
	</article>`;
}

function renderScenarioSection(
	name: string,
	runs: LoadedRun[],
	now: number,
	cache: ShotCache
): string {
	const visible = runs.slice(0, 10);
	const hidden = runs.slice(10);
	const visibleHtml = visible.map((r) => renderRunCard(r, now, cache)).join('\n');
	const hiddenHtml = hidden.length
		? `<details class="history">
			<summary>Older runs (${hidden.length})</summary>
			<div class="grid">${hidden.map((r) => renderRunCard(r, now, cache)).join('\n')}</div>
		</details>`
		: '';

	const latestOk = runs[0]?.result.ok;
	const headerBadge =
		latestOk === undefined
			? ''
			: `<span class="badge ${latestOk ? 'status-ok' : 'status-fail'}">${latestOk ? 'PASS' : 'FAIL'}</span>`;

	const passCount = runs.filter((r) => r.result.ok).length;
	const totalCount = runs.length;

	return `<section class="scenario">
		<header class="scenario-head">
			<h2>${htmlEscape(name)} ${headerBadge}</h2>
			<span class="muted">${passCount}/${totalCount} passing · ${totalCount} run${
				totalCount === 1 ? '' : 's'
			}</span>
		</header>
		<div class="grid">${visibleHtml}</div>
		${hiddenHtml}
	</section>`;
}

function renderEmpty(): string {
	return `<main class="empty">
		<h1>DryUI E2E Report</h1>
		<p class="muted">No runs yet. Try:</p>
		<pre><code>bun run e2e:full</code></pre>
	</main>`;
}

function renderDocument(runs: LoadedRun[], now: number): string {
	if (runs.length === 0) {
		return pageShell(renderEmpty(), { title: 'DryUI E2E Report · no runs' });
	}

	const cache = buildShotCache(runs);
	const groups = groupByScenario(runs);
	const scenarioNames = [...groups.keys()].sort((a, b) => a.localeCompare(b));

	const totalRuns = runs.length;
	const totalPass = runs.filter((r) => r.result.ok).length;
	const totalFail = totalRuns - totalPass;
	const latest = runs[0]?.result;

	const latestLine = latest
		? `latest: <code>${htmlEscape(latest.name)}</code> <span class="muted">${htmlEscape(
				formatAgo(latest.startedAt, now)
			)}</span>`
		: '';

	const header = `<header class="page-head">
		<div class="title-row">
			<h1>DryUI E2E Report</h1>
			<span class="generated muted">generated ${htmlEscape(new Date(now).toISOString())}</span>
		</div>
		<div class="summary">
			<span class="badge status-ok">${totalPass} pass</span>
			<span class="badge status-fail">${totalFail} fail</span>
			<span class="muted">${totalRuns} total run${totalRuns === 1 ? '' : 's'}</span>
			${latestLine ? `<span class="dot">·</span><span>${latestLine}</span>` : ''}
		</div>
	</header>`;

	const body = scenarioNames
		.map((name) => renderScenarioSection(name, groups.get(name)!, now, cache))
		.join('\n');

	// Lightboxes live outside <main> so a :target match doesn't shift page content.
	const lightboxes = runs
		.flatMap((run) =>
			run.result.screenshots.map((shot) => renderScreenshotLightbox(run, shot, cache))
		)
		.filter(Boolean)
		.join('\n');

	return pageShell(`${header}\n<main>${body}</main>\n${lightboxes}`, {
		title: 'DryUI E2E Report'
	});
}

function pageShell(body: string, opts: { title: string }): string {
	// All CSS inline so the file opens happily over file://.
	const css = `
:root {
	color-scheme: dark;
	--bg-0: #0b0c10;
	--bg-1: #12141b;
	--bg-2: #1a1d26;
	--bg-3: #232731;
	--surface: rgba(26, 29, 38, 0.72);
	--border: rgba(255, 255, 255, 0.08);
	--border-strong: rgba(255, 255, 255, 0.14);
	--text-strong: #f5ead1;
	--text: #d7cdb3;
	--muted: #8b8472;
	--accent: #f4a548;
	--accent-soft: rgba(244, 165, 72, 0.18);
	--ok: #6ed28a;
	--ok-soft: rgba(110, 210, 138, 0.14);
	--fail: #ff6e6e;
	--fail-soft: rgba(255, 110, 110, 0.14);
	--mono: ui-monospace, SFMono-Regular, Menlo, "JetBrains Mono", monospace;
	--sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

* { box-sizing: border-box; }

html, body { margin: 0; }

body {
	font-family: var(--sans);
	color: var(--text);
	background:
		radial-gradient(1200px 600px at 15% -10%, rgba(244, 165, 72, 0.14), transparent 55%),
		radial-gradient(900px 500px at 95% 0%, rgba(244, 80, 48, 0.10), transparent 60%),
		linear-gradient(180deg, #0e1016 0%, #0b0c10 100%);
	background-attachment: fixed;
	min-height: 100vh;
	line-height: 1.5;
	padding: 0 24px 80px;
	position: relative;
}

body::before {
	content: "";
	position: fixed;
	inset: 0;
	pointer-events: none;
	background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.95 0 0 0 0 0.92 0 0 0 0 0.80 0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
	opacity: 0.6;
	mix-blend-mode: overlay;
	z-index: 0;
}

main, .page-head { position: relative; z-index: 1; max-width: 1440px; margin: 0 auto; }

.page-head { padding: 40px 0 20px; }

.title-row { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; }

h1 {
	margin: 0;
	font-family: var(--sans);
	font-size: 28px;
	font-weight: 600;
	letter-spacing: -0.01em;
	color: var(--text-strong);
}

h2 {
	margin: 0;
	font-size: 18px;
	font-weight: 600;
	color: var(--text-strong);
	display: flex;
	align-items: center;
	gap: 10px;
}

h3 {
	margin: 0;
	font-size: 14px;
	font-weight: 600;
	letter-spacing: 0.02em;
	color: var(--text-strong);
	text-transform: capitalize;
}

.generated { font-family: var(--mono); font-size: 11px; }

.muted { color: var(--muted); }

.summary {
	margin-top: 12px;
	display: flex;
	align-items: center;
	gap: 10px;
	flex-wrap: wrap;
	font-size: 13px;
}

.summary code { font-family: var(--mono); background: var(--bg-2); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border); }

.dot { color: var(--muted); padding: 0 4px; }

.badge {
	display: inline-flex;
	align-items: center;
	font-family: var(--mono);
	font-size: 11px;
	font-weight: 600;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	padding: 3px 8px;
	border-radius: 4px;
	border: 1px solid currentColor;
}

.badge.status-ok { color: var(--ok); background: var(--ok-soft); }
.badge.status-fail { color: var(--fail); background: var(--fail-soft); }

section.scenario { margin-top: 36px; }

.scenario-head {
	display: flex;
	align-items: baseline;
	gap: 16px;
	margin-bottom: 14px;
	padding-bottom: 10px;
	border-bottom: 1px solid var(--border);
}

.scenario-head .muted { font-family: var(--mono); font-size: 11px; }

.grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
	gap: 16px;
}

article.run {
	background: var(--surface);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	border: 1px solid var(--border);
	border-radius: 10px;
	padding: 14px;
	display: flex;
	flex-direction: column;
	gap: 10px;
	box-shadow: 0 1px 0 rgba(255,255,255,0.03) inset, 0 20px 40px -30px rgba(0,0,0,0.8);
}

article.run.status-ok { border-color: rgba(110, 210, 138, 0.22); }
article.run.status-fail { border-color: rgba(255, 110, 110, 0.32); }

.run-head {
	display: flex;
	align-items: center;
	gap: 10px;
}

.run-head h3 { flex: 1; }

.run-head time {
	font-family: var(--mono);
	font-size: 11px;
	color: var(--muted);
}

.shots {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
	gap: 6px;
}

.shot {
	display: block;
	position: relative;
	border-radius: 6px;
	overflow: hidden;
	border: 1px solid var(--border);
	background: var(--bg-1);
	text-decoration: none;
	color: inherit;
	transition: border-color 120ms ease, transform 120ms ease;
}

.shot:hover { border-color: var(--accent); transform: translateY(-1px); }

.shot img {
	display: block;
	width: 100%;
	aspect-ratio: 16 / 10;
	object-fit: cover;
	background: var(--bg-2);
}

.shot-label {
	position: absolute;
	left: 6px;
	bottom: 6px;
	font-family: var(--mono);
	font-size: 10px;
	color: var(--text-strong);
	background: rgba(0,0,0,0.55);
	padding: 1px 5px;
	border-radius: 3px;
	letter-spacing: 0.04em;
}

.phases {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
}

.phase {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-family: var(--mono);
	font-size: 10px;
	padding: 3px 7px;
	border-radius: 999px;
	border: 1px solid var(--border);
	background: var(--bg-2);
	color: var(--text);
}

.phase-ok { color: var(--ok); border-color: rgba(110, 210, 138, 0.25); }
.phase-fail { color: var(--fail); border-color: rgba(255, 110, 110, 0.35); }

.phase-dot { font-size: 9px; }
.phase-dur { color: var(--muted); margin-left: 2px; }

.codex { display: flex; flex-direction: column; gap: 8px; }

.metrics {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
	gap: 6px;
}

.metrics > div {
	background: var(--bg-2);
	border: 1px solid var(--border);
	border-radius: 6px;
	padding: 6px 8px;
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.m-label {
	font-family: var(--mono);
	font-size: 9px;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: var(--muted);
}

.m-val {
	font-family: var(--mono);
	font-size: 13px;
	color: var(--text-strong);
	font-variant-numeric: tabular-nums;
}

details {
	background: var(--bg-1);
	border: 1px solid var(--border);
	border-radius: 6px;
	padding: 0;
}

details > summary {
	cursor: pointer;
	padding: 6px 10px;
	font-family: var(--mono);
	font-size: 11px;
	color: var(--text);
	user-select: none;
	list-style: none;
}

details > summary::-webkit-details-marker { display: none; }

details > summary::before {
	content: "▸";
	display: inline-block;
	margin-right: 6px;
	color: var(--muted);
	transition: transform 120ms ease;
}

details[open] > summary::before { transform: rotate(90deg); }

details > *:not(summary) { padding: 8px 10px; border-top: 1px solid var(--border); }

details pre {
	margin: 0;
	font-family: var(--mono);
	font-size: 11px;
	line-height: 1.45;
	color: var(--text);
	white-space: pre-wrap;
	word-break: break-word;
	max-height: 320px;
	overflow: auto;
}

details ul {
	margin: 0;
	padding-left: 18px;
	font-family: var(--mono);
	font-size: 11px;
	color: var(--text);
}

details ul li.more { list-style: none; color: var(--muted); margin-left: -18px; }

details.failures {
	border-color: rgba(255, 110, 110, 0.35);
	background: rgba(255, 110, 110, 0.05);
}

details.failures summary { color: var(--fail); }

.dev-link, .log-link { font-family: var(--mono); font-size: 11px; display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }

.dev-link a { color: var(--accent); text-decoration: none; }
.dev-link a:hover { text-decoration: underline; }

.dev-link code, .log-link code {
	font-family: var(--mono);
	font-size: 11px;
	color: var(--text);
	background: var(--bg-2);
	padding: 2px 6px;
	border-radius: 4px;
	border: 1px solid var(--border);
	word-break: break-all;
}

details.history {
	margin-top: 14px;
}

details.history > .grid { padding: 8px 0 0; border-top: 0; }

main.empty {
	max-width: 640px;
	margin: 120px auto 0;
	padding: 40px;
	text-align: center;
}

main.empty pre {
	display: inline-block;
	background: var(--bg-2);
	border: 1px solid var(--border);
	border-radius: 6px;
	padding: 10px 16px;
	font-family: var(--mono);
	color: var(--accent);
}

/* :target-driven lightbox — zero JS. Thumbnails href="#shot-..." jump here.
   The wrapping <a href="#"> is the backdrop so a click anywhere dismisses it
   (the browser sets location.hash back to empty). */
.lightbox {
	display: none;
	position: fixed;
	inset: 0;
	z-index: 100;
	align-items: center;
	justify-content: center;
	padding: 24px;
	background: rgba(6, 7, 10, 0.88);
	backdrop-filter: blur(12px) saturate(140%);
	-webkit-backdrop-filter: blur(12px) saturate(140%);
	text-decoration: none;
	cursor: zoom-out;
}
.lightbox:target {
	display: flex;
}
.lightbox-inner {
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 12px;
	max-width: min(1600px, 96vw);
	max-height: 96vh;
	align-items: center;
}
.lightbox-inner img {
	max-width: 100%;
	max-height: calc(96vh - 72px);
	object-fit: contain;
	border: 1px solid var(--border-strong);
	border-radius: 10px;
	box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
	background: var(--bg-0);
}
.lightbox-cap {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2px;
	color: var(--text);
	font-family: var(--mono);
	font-size: 12px;
	letter-spacing: 0.02em;
}
.lightbox-label {
	color: var(--accent);
	text-transform: uppercase;
}
.lightbox-url {
	color: var(--muted);
}
.lightbox-hint {
	color: var(--muted);
	font-size: 11px;
	font-style: italic;
	margin-top: 4px;
}
`;

	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>${htmlEscape(opts.title)}</title>
	<style>${css}</style>
</head>
<body>
${body}
</body>
</html>
`;
}

function writeOutput(outPath: string, html: string): void {
	const outDir = dirname(outPath);
	if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
	writeFileSync(outPath, html, 'utf8');
}

function writeLatest(primaryPath: string): string | null {
	// Only emit latest.html when the primary output sits inside reports/e2e-runs.
	// Otherwise the relative screenshot paths in the HTML would break.
	const outDir = dirname(primaryPath);
	try {
		const isDefaultLocation = statSync(outDir).isDirectory() && resolve(outDir) === runsDir;
		if (!isDefaultLocation) return null;
	} catch {
		return null;
	}
	const latestPath = resolve(outDir, 'latest.html');
	try {
		copyFileSync(primaryPath, latestPath);
		return latestPath;
	} catch (err) {
		console.warn(
			`[generate-report] failed to write latest.html: ${
				err instanceof Error ? err.message : String(err)
			}`
		);
		return null;
	}
}

function main(): void {
	const { out } = parseArgs(process.argv.slice(2));
	const runs = sortNewestFirst(loadRuns());
	const now = Date.now();
	const html = renderDocument(runs, now);
	writeOutput(out, html);
	const latest = writeLatest(out);
	console.log(out);
	if (latest) console.log(latest);
	if (runs.length === 0) {
		console.warn('[generate-report] no result.json files found — wrote empty-state page');
	} else {
		console.warn(
			`[generate-report] rendered ${runs.length} run${runs.length === 1 ? '' : 's'} across ${
				groupByScenario(runs).size
			} scenario${groupByScenario(runs).size === 1 ? '' : 's'}`
		);
	}
}

main();
