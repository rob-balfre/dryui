import { resolve } from 'node:path';
import { formatScenarioResult, runScenario } from '../../../../scripts/e2e/scenario-harness.ts';

const root = resolve(import.meta.dir, '../../../..');
const batch = resolve(root, 'reports/skill-experiments/2026-05-11/batch-6');
const refs = resolve(root, 'reports/skill-experiments/2026-05-11/batch-5/design-references');

const variants = [
	{ id: 'v4-recipes', skill: resolve(batch, 'v4-app-recipes/SKILL.md') },
	{ id: 'v5-repair', skill: resolve(batch, 'v5-visual-repair/SKILL.md') }
];

const cases = [
	{ id: 'kanban', image: resolve(refs, 'project-kanban.png') },
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
		regex: 'data-layout-area="(topbar|header|navigation|nav|rail|sidebar)"'
	},
	{
		kind: 'file-matches' as const,
		path: 'src/routes/+page.svelte',
		regex: 'data-layout-area="(primary|main|workspace|board|reader|settings|content)"'
	}
];

function scenarioFor(testCase: (typeof cases)[number]) {
	return {
		name: `tighten-${testCase.id}`,
		promptImages: [testCase.image],
		prompt: [
			'Use the supplied web-app design image as the reference.',
			'Build only the first-pass page layout skeleton as colored blocks using the active dryui-build test skill.',
			'Do not recreate detailed UI controls, charts, forms, tables, icons, or images.',
			'Extract the page regions, choose contiguous/guttered spacing from the reference, and implement a mobile-first container-query layout in src/layout.css at 48rem and 72rem.',
			'The output should be a faithful colored block map of the reference at mobile, tablet, and desktop sizes, with short labels for each region.'
		].join('\n'),
		assertions,
		codexTimeoutMs: 420_000
	};
}

const allResults = [];

for (const variant of variants) {
	console.log(`[layout-tighten] running ${variant.id} with ${variant.skill}`);
	process.env.DRYUI_E2E_DRYUI_BUILD_SKILL_OVERRIDE = variant.skill;

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
				runLabel: `layout-tighten-${variant.id}`
			});
			console.log(formatScenarioResult(result));
			return { variant: variant.id, case: testCase.id, result };
		})
	);

	allResults.push(...results);
}

const summary = allResults.map(({ variant, case: caseId, result }) => ({
	variant,
	case: caseId,
	ok: result.ok,
	projectDir: result.projectDir,
	logDir: result.logDir,
	durationMs: result.phases.reduce((sum, phase) => sum + phase.durationMs, 0),
	failures: result.assertionFailures
}));

console.log(`LAYOUT_TIGHTEN_SUMMARY ${JSON.stringify(summary, null, 2)}`);

if (summary.some((entry) => !entry.ok)) {
	process.exitCode = 1;
}
