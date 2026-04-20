import { describe, expect, test } from 'bun:test';
import {
	FIELD_CAP,
	buildContextualHelp,
	esc,
	formatHelp,
	header,
	row,
	toonAddPlan,
	toonComponent,
	toonComponentList,
	toonComposition,
	toonDiagnoseResult,
	toonError,
	toonInstallPlan,
	toonProjectDetection,
	toonReviewResult,
	toonTokens,
	toonWorkspaceReport,
	truncateField
} from '../../../packages/mcp/src/toon.ts';
import type {
	ComponentDef,
	CompositionComponentDef,
	CompositionRecipeDef
} from '../../../packages/mcp/src/spec-types.ts';
import type { ReviewResult } from '../../../packages/mcp/src/reviewer.ts';
import type { DiagnoseResult } from '../../../packages/mcp/src/theme-checker.ts';
import type {
	WorkspaceFinding,
	WorkspaceReport
} from '../../../packages/mcp/src/workspace-audit.ts';
import type {
	AddPlan,
	InstallPlan,
	ProjectDetection,
	ProjectPlanStep
} from '../../../packages/mcp/src/project-planner.ts';
import type { TokenResult } from '../../../packages/mcp/src/tokens.ts';

const ELLIPSIS = '\u2026';
const EM_DASH = '\u2014';

function repeat(pattern: string, length: number): string {
	return pattern.repeat(Math.ceil(length / pattern.length)).slice(0, length);
}

const longField = repeat('long-field-', FIELD_CAP + 32);
const longExample = repeat('<Dialog.Root>open</Dialog.Root>', 420);
const longSnippet = repeat('<Dialog.Content>body</Dialog.Content>', 520);

const dialogComponent = {
	import: '@dryui/ui',
	description: 'Layered dialog shell',
	category: 'overlay',
	tags: ['modal', 'focus'],
	compound: true,
	parts: {
		Root: {
			props: {
				open: { type: 'boolean', bindable: true, default: 'false' }
			}
		},
		Trigger: {
			props: {}
		},
		Content: {
			props: {
				portal: { type: 'boolean', default: 'true' }
			}
		}
	},
	structure: {
		tree: ['Dialog.Root', 'Dialog.Trigger', 'Dialog.Content'],
		note: 'Content should follow Trigger'
	},
	cssVars: {
		'--dry-dialog-gap': 'Gap between sections'
	},
	dataAttributes: [{ name: 'data-state', values: ['open', 'closed'] }],
	example: longExample
} satisfies ComponentDef;

const badgeComponent = {
	import: '@dryui/ui',
	description: 'Inline status badge',
	category: 'feedback',
	tags: ['label', 'status'],
	compound: false,
	props: {
		tone: { type: 'string', default: 'neutral' },
		visible: { type: 'boolean', bindable: true }
	},
	cssVars: {},
	dataAttributes: [],
	example: '<Badge tone="brand">New</Badge>'
} satisfies ComponentDef;

const stackComponent = {
	import: '@dryui/ui',
	description: 'Namespaced layout helpers',
	category: 'layout',
	tags: ['stack', 'layout'],
	compound: true,
	parts: {
		Item: { props: {} },
		Divider: { props: {} }
	},
	structure: {
		tree: ['Stack.Item', 'Stack.Divider']
	},
	cssVars: {},
	dataAttributes: [],
	example: '<Stack.Item>Row</Stack.Item>'
} satisfies ComponentDef;

const componentMap: Record<string, ComponentDef> = {
	Dialog: dialogComponent,
	Badge: badgeComponent,
	Stack: stackComponent
};

const baseDetection = {
	inputPath: '/repo',
	root: '/repo',
	packageJsonPath: '/repo/package.json',
	framework: 'sveltekit',
	packageManager: 'bun',
	status: 'partial',
	dependencies: {
		ui: true,
		primitives: false,
		lint: false,
		feedback: false
	},
	files: {
		appHtml: 'src/app.html',
		appCss: 'src/app.css',
		rootLayout: 'src/routes/+layout.svelte',
		rootPage: 'src/routes/+page.svelte',
		svelteConfig: 'svelte.config.js'
	},
	theme: {
		defaultImported: true,
		darkImported: false,
		themeAuto: false
	},
	lint: {
		preprocessorWired: false
	},
	feedback: {
		layoutPath: null
	},
	warnings: ['Missing dark theme import']
} satisfies ProjectDetection;

function makeStep(overrides: Partial<ProjectPlanStep> = {}): ProjectPlanStep {
	return {
		kind: 'edit-file',
		status: 'pending',
		title: 'Update file',
		description: 'Adjust project wiring',
		...overrides
	};
}

function makeFinding(index: number, overrides: Partial<WorkspaceFinding> = {}): WorkspaceFinding {
	return {
		file: `packages/ui/src/component-${index}.svelte`,
		line: index + 1,
		column: 1,
		ruleId: index < 30 ? 'rule-a' : 'rule-b',
		severity: index === 0 ? 'error' : 'warning',
		fixable: true,
		message: index === 0 ? longField : `Finding ${index}`,
		suggestedFixes: [
			{
				description: index === 0 ? longField : `Fix finding ${index}`,
				replacement: index === 0 ? longField : undefined
			}
		],
		...overrides
	};
}

describe('toon utilities', () => {
	test('escapes row values and truncates long fields predictably', () => {
		expect(esc('plain')).toBe('plain');
		expect(esc('alpha,beta\n"quoted"')).toBe('"alpha,beta\n""quoted"""');
		expect(header('items', 2, ['name', 'value'])).toBe('items[2]{name,value}:');
		expect(row('alpha,beta', 7, true)).toBe('  "alpha,beta",7,true');

		const [truncated, didTruncate] = truncateField(longField);
		expect(didTruncate).toBe(true);
		expect(truncated).toHaveLength(FIELD_CAP);
		expect(truncated.endsWith(ELLIPSIS)).toBe(true);

		const [boundaryValue, boundaryTruncated] = truncateField('x'.repeat(FIELD_CAP));
		expect(boundaryTruncated).toBe(false);
		expect(boundaryValue).toHaveLength(FIELD_CAP);
	});

	test('builds contextual help blocks for ready project detection', () => {
		const hints = buildContextualHelp({ command: 'detect', status: 'ready' });

		expect(hints).toEqual([
			'list -- see available components',
			'compose "app shell" -- get root layout template'
		]);
		expect(formatHelp(hints)).toBe(
			'next[2]:\n  list -- see available components\n  compose "app shell" -- get root layout template'
		);
		expect(formatHelp([])).toBe('');
	});
});

describe('toonComponent', () => {
	test('formats compound metadata, truncates long canonical examples, and emits help', () => {
		const output = toonComponent('Dialog', dialogComponent);

		expect(output).toContain('Dialog -- Layered dialog shell');
		expect(output).toContain('kind: compound');
		expect(output).toContain('required-parts: Root,Trigger,Content');
		expect(output).toContain('bindables: Root.open');
		expect(output).toContain('structure[3]{node}:');
		expect(output).toContain('  note: Content should follow Trigger');
		expect(output).toContain('parts[3]{part}:');
		expect(output).toContain('css-vars[1]{name,description}:');
		expect(output).toContain('data-attrs[1]{name,values}:');
		expect(output).toContain(
			`canonical:\n(truncated, 420 chars total ${EM_DASH} use add Dialog for complete body)`
		);
		expect(output).toContain('compose "dialog" -- see composition patterns');
		expect(output).toContain('add Dialog -- get starter snippet');

		const fullOutput = toonComponent('Dialog', dialogComponent, { full: true, includeHelp: false });
		expect(fullOutput).toContain(`canonical:\n${longExample}`);
		expect(fullOutput).not.toContain('next[');
	});
});

describe('toonComponentList', () => {
	test('filters categories case-insensitively and keeps list help', () => {
		const output = toonComponentList(componentMap, 'OVERLAY');

		expect(output).toContain('components[1]{name,category,compound,description}:');
		expect(output).toContain('  Dialog,overlay,true,Layered dialog shell');
		expect(output).not.toContain('Inline status badge');
		expect(output).toContain('info <Component> -- see full API reference');
	});

	test('reports available categories when a filter has no matches', () => {
		const output = toonComponentList(componentMap, 'forms');
		expect(output).toBe(
			'components[0]: no matches\navailable categories: feedback, layout, overlay'
		);
	});
});

describe('toonComposition', () => {
	test('formats component and recipe matches with spec metadata and truncation hints', () => {
		const results = {
			componentMatches: [
				{
					component: 'Dialog',
					useWhen: longField,
					alternatives: [
						{
							rank: 1,
							component: 'Dialog',
							useWhen: longField,
							snippet: longSnippet
						}
					],
					antiPatterns: [
						{
							pattern: 'Dialog without Trigger',
							reason: longField,
							fix: longField
						}
					],
					combinesWith: ['Button', 'Overlay']
				}
			],
			recipeMatches: [
				{
					name: 'app shell',
					description: longField,
					tags: ['layout'],
					components: ['Dialog', 'Stack'],
					snippet: longSnippet
				}
			]
		} satisfies {
			componentMatches: readonly CompositionComponentDef[];
			recipeMatches: readonly CompositionRecipeDef[];
		};

		const output = toonComposition(results, componentMap);

		expect(output).toContain('matches[2]: Dialog');
		expect(output).toContain(
			'kind: compound | required-parts: Root,Trigger,Content | bindables: Root.open'
		);
		expect(output).toContain(
			`(truncated, 420 chars total ${EM_DASH} use info Dialog for complete body)`
		);
		expect(output).toContain(
			`(truncated, 520 chars total ${EM_DASH} use compose "app shell" --full for complete body)`
		);
		expect(output).toContain('anti-pattern: Dialog without Trigger');
		expect(output).toContain('combines-with: Button,Overlay');
		expect(output).toContain(
			`(truncated, 240 chars total ${EM_DASH} use compose <query> --full for complete body)`
		);
		expect(output).toContain('info <Component> -- full API reference');
		expect(output).toContain('add <Component> -- starter snippet');
		expect(output).toContain(ELLIPSIS);
	});

	test('returns an empty marker when no matches are present', () => {
		expect(toonComposition({ componentMatches: [], recipeMatches: [] }, componentMap)).toBe(
			'matches[0]: none'
		);
	});
});

describe('toonReviewResult', () => {
	test('reports blockers, auto-fixes, and truncation hints for review findings', () => {
		const result = {
			issues: [
				{
					severity: 'error',
					line: 7,
					code: 'missing-part',
					message: longField,
					fix: longField
				},
				{
					severity: 'suggestion',
					line: 12,
					code: 'spacing',
					message: 'Align spacing tokens',
					fix: null
				}
			],
			summary: '2 issues found'
		} satisfies ReviewResult;

		const output = toonReviewResult(result);

		expect(output).toContain('issues[2]{severity,line,code,message}:');
		expect(output).toContain('hasBlockers: true | autoFixable: 1');
		expect(output).toContain(
			`(truncated, 240 chars total ${EM_DASH} use review <file.svelte> --full for complete body)`
		);
		expect(output).toContain('info <Component> -- check API for errored component');
		expect(output).toContain('diagnose <file.css> -- check theme if theme warnings present');
	});

	test('emits the clean marker and lint hint when no issues exist', () => {
		const output = toonReviewResult({ issues: [], summary: 'Clean review' });

		expect(output).toContain('issues[0]: clean');
		expect(output).toContain('hasBlockers: false | autoFixable: 0');
		expect(output).toContain('lint . -- check entire workspace');
	});
});

describe('toonDiagnoseResult', () => {
	test('computes required-token coverage and error help from missing-token issues', () => {
		const result = {
			variables: { found: 5, required: 3, extra: 2 },
			issues: [
				{
					severity: 'error',
					code: 'missing-token',
					variable: '--dry-fill-brand',
					message: 'Required token is missing',
					fix: 'Add the token to your theme'
				}
			],
			summary: '1 theme error'
		} satisfies DiagnoseResult;

		const output = toonDiagnoseResult(result);

		expect(output).toContain('tokens: 5 found, 3 required, 2 extra | coverage: 75%');
		expect(output).toContain('errors: 1 | warnings: 0 | info: 0');
		expect(output).toContain('compose "app shell" -- get correct theme setup');
	});

	test('reports warning-only theme findings with detailed follow-up guidance', () => {
		const result = {
			variables: { found: 9, required: 3, extra: 1 },
			issues: [
				{
					severity: 'warning',
					code: 'contrast',
					variable: '--dry-text-weak',
					message: longField,
					fix: longField
				},
				{
					severity: 'info',
					code: 'unused-token',
					variable: '--dry-fill-muted',
					message: 'Token is defined but unused',
					fix: null
				}
			],
			summary: '2 findings'
		} satisfies DiagnoseResult;

		const output = toonDiagnoseResult(result);

		expect(output).toContain('tokens: 9 found, 3 required, 1 extra | coverage: 100%');
		expect(output).toContain('errors: 0 | warnings: 1 | info: 1');
		expect(output).toContain(
			`(truncated, 240 chars total ${EM_DASH} use diagnose <file.css> --full for complete body)`
		);
		expect(output).toContain('diagnose <file.css> --full -- see full messages');
		expect(output).toContain('doctor --max-severity warning -- triage across workspace');
	});
});

describe('toonWorkspaceReport', () => {
	test('summarizes workspace findings, caps the default list, and emits fix guidance', () => {
		const findings = Array.from({ length: 51 }, (_, index) => makeFinding(index));
		const report = {
			root: '/repo',
			projects: [baseDetection],
			scope: {
				include: ['packages/ui'],
				exclude: ['dist'],
				changed: false
			},
			scannedFiles: 51,
			skippedFiles: 3,
			findings,
			warnings: ['Skipped generated files'],
			summary: {
				error: 1,
				warning: 50,
				info: 0,
				byRule: {
					'rule-b': 21,
					'rule-a': 30
				}
			}
		} satisfies WorkspaceReport;

		const output = toonWorkspaceReport(report, { title: 'lint workspace', command: 'lint' });

		expect(output).toContain('lint workspace | root: /repo');
		expect(output).toContain('scanned: 51 files | errors: 1 | warnings: 50 | info: 0');
		expect(output).toContain('hasBlockers: true | autoFixable: 51');
		expect(output).toContain('top-rule: rule-a (30 occurrences)');
		expect(output).toContain('findings[50]{severity,rule,file,line,message}:');
		expect(output).toContain(`(showing 50 of 51 ${EM_DASH} use --full to see all)`);
		expect(output).toContain(
			`(truncated, 240 chars total ${EM_DASH} use review <file> or lint --full for complete body)`
		);
		expect(output).toContain('warnings[1]{message}:');
		expect(output).toContain('lint --max-severity error -- focus on errors only');
		expect(output).toContain('review <file.svelte> -- check specific file');
	});
});

describe('project planning formatters', () => {
	test('formats project detection state and ready/partial help correctly', () => {
		const partialOutput = toonProjectDetection(baseDetection);

		expect(partialOutput).toContain('project: partial | framework: sveltekit | pkg-manager: bun');
		expect(partialOutput).toContain('deps: ui=true, primitives=false, lint=false');
		expect(partialOutput).toContain('theme: default=true, dark=false, auto=false');
		expect(partialOutput).toContain('lint: wired=false, svelte-config=svelte.config.js');
		expect(partialOutput).toContain('warnings[1]{message}:');
		expect(partialOutput).toContain('install -- see step-by-step setup plan');

		const readyOutput = toonProjectDetection({
			...baseDetection,
			status: 'ready',
			dependencies: {
				...baseDetection.dependencies,
				primitives: true,
				lint: true
			},
			theme: {
				defaultImported: true,
				darkImported: true,
				themeAuto: true
			},
			lint: {
				preprocessorWired: true
			},
			warnings: []
		});

		expect(readyOutput).toContain('list -- see available components');
		expect(readyOutput).toContain('compose "app shell" -- get root layout template');
	});

	test('formats scaffold install plans with file snippets and no extra help when disabled', () => {
		const plan = {
			detection: {
				...baseDetection,
				status: 'unsupported',
				framework: 'unknown',
				packageManager: 'npm',
				dependencies: {
					ui: false,
					primitives: false,
					lint: false,
					feedback: false
				},
				theme: {
					defaultImported: false,
					darkImported: false,
					themeAuto: false
				},
				warnings: []
			},
			steps: [
				makeStep({
					kind: 'create-file',
					title: 'Create root layout',
					description: 'Add the initial app shell',
					path: 'src/routes/+layout.svelte',
					snippet: '<script></script>'
				}),
				makeStep({
					kind: 'run-command',
					title: 'Install UI package',
					description: 'Add the DryUI runtime',
					command: 'bun add @dryui/ui'
				})
			]
		} satisfies InstallPlan;

		const output = toonInstallPlan(plan, { includeHelp: false });

		expect(output).toContain('scaffold-steps[2]{status,title,description}:');
		expect(output).toContain('1. [pending] Create root layout: Add the initial app shell');
		expect(output).toContain('file: src/routes/+layout.svelte');
		expect(output).toContain('---\n<script></script>   ---');
		expect(output).not.toContain('next[');
	});

	test('formats add plans with install steps, add steps, and warnings', () => {
		const plan = {
			detection: baseDetection,
			installPlan: {
				detection: baseDetection,
				steps: [
					makeStep({
						kind: 'run-command',
						title: 'Install feedback package',
						description: 'Add the feedback runtime',
						command: 'bun add @dryui/feedback'
					})
				]
			},
			targetType: 'component',
			name: 'Dialog',
			importStatement: "import { Dialog } from '@dryui/ui'",
			snippet: '<Dialog.Root />',
			target: 'src/routes/+page.svelte',
			steps: [
				makeStep({
					title: 'Render Dialog',
					description: 'Insert the dialog markup',
					path: 'src/routes/+page.svelte'
				})
			],
			warnings: ['Existing imports are grouped manually']
		} satisfies AddPlan;

		const output = toonAddPlan(plan);

		expect(output).toContain('add: Dialog | target: src/routes/+page.svelte');
		expect(output).toContain("import: import { Dialog } from '@dryui/ui'");
		expect(output).toContain('install-steps[1]{status,title}:');
		expect(output).toContain('add-steps[1]{status,title}:');
		expect(output).toContain('warnings[1]{message}:');
	});
});

describe('token and error formatters', () => {
	test('formats token summaries with alphabetized category counts', () => {
		const result = {
			tokens: [
				{ name: '--dry-space-2', category: 'space', light: '0.5rem', dark: '0.5rem' },
				{ name: '--dry-color-brand', category: 'color', light: '#3366ff', dark: '#88aaff' }
			],
			counts: { space: 1, color: 1 } as TokenResult['counts'],
			total: 2
		} satisfies TokenResult;

		const output = toonTokens(result);

		expect(output).toContain('total: 2 | color:1, space:1');
		expect(output).toContain('tokens[2]{name,category,light,dark}:');
		expect(output).toContain('tokens --category color -- filter to color tokens');
		expect(output).toContain('diagnose <file.css> -- validate theme overrides');
	});

	test('formats empty token results and escaped errors', () => {
		const emptyOutput = toonTokens(
			{ tokens: [], counts: {} as TokenResult['counts'], total: 0 },
			'radius'
		);
		expect(emptyOutput).toContain('tokens[0]: no matches for category "radius"');

		const errorOutput = toonError('bad,code', 'line 1\n"quoted"', ['use list', 'use info']);
		expect(errorOutput).toBe(
			'error[1]{code,message}: "bad,code","line 1\n""quoted"""\n' +
				'suggestions[2]{value}:\n' +
				'  use list\n' +
				'  use info'
		);
	});
});
