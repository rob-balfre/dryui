import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { formatScenarioResult, runScenario } from '../../../../scripts/e2e/scenario-harness.ts';

const root = resolve(import.meta.dir, '../../../..');
const batch = resolve(root, 'reports/skill-experiments/2026-05-11/batch-7');
const refs = resolve(root, 'reports/skill-experiments/2026-05-11/batch-5/design-references');
const skill = resolve(batch, 'v6-hybrid-layout/SKILL.md');

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
	{ kind: 'file-contains' as const, path: 'src/layout.css', needle: 'container:' },
	{
		kind: 'file-matches' as const,
		path: 'src/layout.css',
		regex: '@container\\s+[a-z0-9-]+\\s+\\(min-width:\\s*48rem\\)'
	},
	{
		kind: 'file-matches' as const,
		path: 'src/layout.css',
		regex: '@container\\s+[a-z0-9-]+\\s+\\(min-width:\\s*72rem\\)'
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
		name: `hybrid-${testCase.id}`,
		promptImages: [testCase.image],
		prompt: [
			'Use the supplied web-app design image as the reference.',
			'Build only a first-pass colored block layout skeleton using the active dryui-build test skill.',
			'Do not recreate detailed UI controls, charts, forms, tables, icons, images, or component styling.',
			'Extract regions into the required direct-child contract, preserve the reference spacing mode, and implement mobile-first container-query layout in src/layout.css at 48rem and 72rem.',
			'The result should be a faithful structural map at mobile, tablet, and desktop sizes.'
		].join('\n'),
		assertions,
		codexTimeoutMs: 420_000
	};
}

function sourceAudit(projectDir: string): string[] {
	const failures: string[] = [];
	const pagePath = resolve(projectDir, 'src/routes/+page.svelte');
	const layoutPath = resolve(projectDir, 'src/layout.css');
	const page = existsSync(pagePath) ? readFileSync(pagePath, 'utf8') : '';
	const layout = existsSync(layoutPath) ? readFileSync(layoutPath, 'utf8') : '';
	const combined = `${page}\n${layout}`;

	const forbidden = [
		[/^\s*import\b/m, 'route import'],
		[/@dryui\/ui/, '@dryui/ui import/use'],
		[/lucide/i, 'lucide use'],
		[/<\s*(button|input|form|table|img|svg)\b/i, 'real widget/media element'],
		[/@media\b/i, '@media layout breakpoint'],
		[/<style[\s\S]*display\s*:\s*(grid|flex)/i, 'grid/flex in route style']
	] as const;

	for (const [regex, label] of forbidden) {
		if (regex.test(combined)) failures.push(label);
	}

	const containerName = layout.match(/container:\s*([a-z0-9-]+)\s*\/\s*inline-size/i)?.[1];
	if (!containerName) {
		failures.push('missing named container');
	} else {
		for (const width of ['48rem', '72rem']) {
			const query = new RegExp(
				`@container\\s+${containerName}\\s+\\(min-width:\\s*${width}\\)`,
				'i'
			);
			if (!query.test(layout)) failures.push(`missing exact ${width} container query`);
		}
	}

	return failures;
}

process.env.DRYUI_E2E_DRYUI_BUILD_SKILL_OVERRIDE = skill;

console.log(`[layout-tighten] running v6-hybrid with ${skill}`);

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
			runLabel: 'layout-tighten-v6-hybrid'
		});
		const auditFailures = sourceAudit(result.projectDir);
		console.log(formatScenarioResult(result));
		if (auditFailures.length > 0) {
			console.log(`  source-audit: FAIL — ${auditFailures.join('; ')}`);
		} else {
			console.log('  source-audit: PASS');
		}
		return { case: testCase.id, result, auditFailures };
	})
);

const summary = results.map(({ case: caseId, result, auditFailures }) => ({
	variant: 'v6-hybrid',
	case: caseId,
	ok: result.ok && auditFailures.length === 0,
	formalOk: result.ok,
	auditOk: auditFailures.length === 0,
	projectDir: result.projectDir,
	logDir: result.logDir,
	agentSeconds: result.phases.find((phase) => phase.name.startsWith('agent-'))?.durationMs
		? Math.round(result.phases.find((phase) => phase.name.startsWith('agent-'))!.durationMs / 100) /
			10
		: null,
	assertionFailures: result.assertionFailures,
	auditFailures
}));

writeFileSync(resolve(batch, 'v6-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(`LAYOUT_TIGHTEN_V6_SUMMARY ${JSON.stringify(summary, null, 2)}`);

if (summary.some((entry) => !entry.ok)) {
	process.exitCode = 1;
}
