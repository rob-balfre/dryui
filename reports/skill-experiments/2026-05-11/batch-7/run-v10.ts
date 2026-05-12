import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { formatScenarioResult, runScenario } from '../../../../scripts/e2e/scenario-harness.ts';

const root = resolve(import.meta.dir, '../../../..');
const batch = resolve(root, 'reports/skill-experiments/2026-05-11/batch-7');
const refs = resolve(root, 'reports/skill-experiments/2026-05-11/batch-5/design-references');
const skill = resolve(batch, 'v10-consolidated-layout/SKILL.md');

const cases = [
	{ id: 'analytics', image: resolve(refs, 'analytics-dashboard.png') },
	{ id: 'kanban', image: resolve(refs, 'project-kanban.png') },
	{ id: 'crm', image: resolve(refs, 'crm-pipeline.png') },
	{ id: 'settings', image: resolve(refs, 'settings-admin.png') },
	{ id: 'knowledge', image: resolve(refs, 'ai-knowledge.png') }
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
		regex: '@container\\s+page\\s+\\(min-width:\\s*48rem\\)'
	},
	{
		kind: 'file-matches' as const,
		path: 'src/layout.css',
		regex: '@container\\s+page\\s+\\(min-width:\\s*72rem\\)'
	},
	{ kind: 'file-contains' as const, path: 'src/layout.css', needle: 'grid-template-areas' },
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

function scenarioFor(testCase: (typeof cases)[number]) {
	return {
		name: `consolidated-${testCase.id}`,
		promptImages: [testCase.image],
		prompt: [
			'Use the supplied web-app design image as the reference.',
			'Build only an abstract first-pass colored block layout skeleton using the active dryui-build test skill.',
			'Do not recreate detailed UI controls, charts, forms, tables, icons, images, copied labels, copied metrics, copied dates, copied names, or component styling.',
			'Use the fixed page container-query contract exactly.',
			'Use data-layout-area only for the page shell and direct shell children; nested primitives must use data-layout only.',
			'Visible text may only be generic shell labels: Topbar, Navigation, Rail, Summary, Primary, Secondary, Utility, Actions.',
			'The result should be a faithful structural map at mobile, tablet, and desktop sizes, with no large blank shell regions.'
		].join('\n'),
		assertions,
		codexTimeoutMs: 420_000
	};
}

function routeStyleBlocks(page: string): string {
	return [...page.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi)]
		.map((match) => match[1])
		.join('\n');
}

function routeMarkup(page: string): string {
	return page.replace(/<style(?:\s[^>]*)?>[\s\S]*?<\/style>/gi, '');
}

function visibleText(markup: string): string {
	return markup
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function countMatches(input: string, regex: RegExp): number {
	return [...input.matchAll(regex)].length;
}

function sourceAudit(projectDir: string): string[] {
	const failures: string[] = [];
	const pagePath = resolve(projectDir, 'src/routes/+page.svelte');
	const layoutPath = resolve(projectDir, 'src/layout.css');
	const page = existsSync(pagePath) ? readFileSync(pagePath, 'utf8') : '';
	const layout = existsSync(layoutPath) ? readFileSync(layoutPath, 'utf8') : '';
	const routeStyle = routeStyleBlocks(page);
	const markup = routeMarkup(page);
	const text = visibleText(markup);
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

	const allowedText = new Set([
		'topbar',
		'navigation',
		'rail',
		'summary',
		'primary',
		'secondary',
		'utility',
		'actions'
	]);
	const textWords = text.toLowerCase().match(/[a-z0-9$%.]+/g) ?? [];
	const badWords = [...new Set(textWords.filter((word) => !allowedText.has(word)))];
	if (badWords.length > 0) {
		failures.push(`non-generic visible text: ${badWords.slice(0, 8).join(', ')}`);
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

	const primitiveArea = /<\s*(span|p|article|li|small|strong)\b[^>]*data-layout-area=/i;
	if (primitiveArea.test(markup)) failures.push('nested primitive data-layout-area');

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

	const broadAreaSelector =
		/\[data-layout=['"][^'"]+-shell['"]\]\s+\[data-layout-area=['"](rail|topbar|navigation|summary|primary|secondary|utility|actions)['"]\]/;
	if (broadAreaSelector.test(layout)) failures.push('broad descendant shell-area selector');

	return failures;
}

process.env.DRYUI_E2E_DRYUI_BUILD_SKILL_OVERRIDE = skill;

console.log(`[layout-tighten] running v10-consolidated-layout with ${skill}`);

const results = await Promise.all(
	cases.map(async (testCase) => {
		const result = await runScenario(scenarioFor(testCase), {
			keepProject: true,
			verbose: false,
			streamCodex: false,
			useLocalFeedbackMcp: true,
			visualFeedbackPass: false,
			agentBackend: 'codex',
			agentModel: 'gpt-5.5',
			effort: 'low',
			permissionMode: 'danger-full-access',
			codexTimeoutMs: 420_000,
			runLabel: 'layout-tighten-v10-consolidated-layout'
		});
		const auditFailures = sourceAudit(result.projectDir);
		console.log(formatScenarioResult(result));
		console.log(
			`  source-audit: ${auditFailures.length === 0 ? 'PASS' : `FAIL - ${auditFailures.join('; ')}`}`
		);
		return { case: testCase.id, result, auditFailures };
	})
);

const summary = results.map(({ case: caseId, result, auditFailures }) => ({
	variant: 'v10-consolidated-layout',
	case: caseId,
	ok: result.ok && auditFailures.length === 0,
	formalOk: result.ok,
	auditOk: auditFailures.length === 0,
	projectDir: result.projectDir,
	logDir: result.logDir,
	devServer: result.devServer,
	agentSeconds: result.phases.find((phase) => phase.name.startsWith('agent-'))?.durationMs
		? Math.round(result.phases.find((phase) => phase.name.startsWith('agent-'))!.durationMs / 100) /
			10
		: null,
	assertionFailures: result.assertionFailures,
	auditFailures
}));

writeFileSync(resolve(batch, 'v10-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(`LAYOUT_TIGHTEN_V10_SUMMARY ${JSON.stringify(summary, null, 2)}`);

if (summary.some((entry) => !entry.ok)) {
	process.exitCode = 1;
}
