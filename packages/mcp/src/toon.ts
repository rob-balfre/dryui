// TOON (Token-Optimized Object Notation) serializer for DryUI.
// AXI-inspired format: ~40% fewer tokens than JSON for agent consumption.
// Format: resource[count]{fields}: value1,value2,...

import type { ComponentDef, CompositionComponentDef, CompositionRecipeDef, Spec } from './spec-types.js';
import type { ReviewResult } from './reviewer.js';
import type { DiagnoseResult } from './theme-checker.js';
import type { WorkspaceReport, WorkspaceFinding } from './workspace-audit.js';
import type {
	ProjectDetection,
	InstallPlan,
	AddPlan,
	ProjectPlanStep
} from './project-planner.js';

// ── Utilities ──────────────────────────────────────────────

/** Escape commas and newlines in field values for TOON row safety. */
function esc(value: string): string {
	if (value.includes(',') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

/** Format a TOON header line: resource[count]{fields}: */
function header(resource: string, count: number, fields: string[]): string {
	return `${resource}[${count}]{${fields.join(',')}}:`;
}

/** Format a TOON row with indentation. */
function row(...values: (string | number | boolean)[]): string {
	return '  ' + values.map((v) => esc(String(v))).join(',');
}

/** Truncate text and return a hint if it exceeds maxLen. */
function truncate(text: string, maxLen: number, hint: string): string {
	if (text.length <= maxLen) return text;
	return `(truncated, ${text.length} chars -- ${hint})`;
}

// ── Contextual help builder ────────────────────────────────

export type HelpCommand =
	| 'info'
	| 'list'
	| 'compose'
	| 'review'
	| 'diagnose'
	| 'doctor'
	| 'lint'
	| 'detect'
	| 'install';

export type HelpContext = {
	command: HelpCommand;
	hasErrors?: boolean;
	hasFindings?: boolean;
	isEmpty?: boolean;
	componentName?: string;
	query?: string;
	status?: string;
};

/**
 * Build context-aware next-step suggestions.
 * Returns 1-3 help lines for agents to copy-paste.
 */
export function buildContextualHelp(ctx: HelpContext): string[] {
	const hints: string[] = [];

	switch (ctx.command) {
		case 'info':
			if (ctx.componentName) {
				hints.push(`compose "${ctx.componentName.toLowerCase()}" -- see composition patterns`);
				hints.push(`add ${ctx.componentName} -- get starter snippet`);
			}
			break;

		case 'list':
			hints.push('info <Component> -- see full API reference');
			break;

		case 'compose':
			if (ctx.componentName) {
				hints.push(`info ${ctx.componentName} -- full API reference`);
				hints.push(`add ${ctx.componentName} -- starter snippet`);
			}
			break;

		case 'review':
			if (ctx.hasErrors) {
				hints.push('info <Component> -- check API for errored component');
				hints.push('diagnose <file.css> -- check theme if theme warnings present');
			} else if (ctx.isEmpty) {
				hints.push('lint . -- check entire workspace');
			}
			break;

		case 'diagnose':
			if (ctx.hasErrors) {
				hints.push('compose "app shell" -- get correct theme setup');
			} else if (ctx.isEmpty) {
				hints.push('review <file.svelte> -- validate component usage');
			}
			break;

		case 'doctor':
		case 'lint':
			if (ctx.hasFindings) {
				hints.push('lint --max-severity error -- focus on errors only');
				hints.push('review <file.svelte> -- check specific file');
			} else if (ctx.isEmpty) {
				hints.push('detect -- verify project setup');
			}
			break;

		case 'detect':
			if (ctx.status === 'partial' || ctx.status === 'unsupported') {
				hints.push('install -- see step-by-step setup plan');
			} else if (ctx.status === 'ready') {
				hints.push('list -- see available components');
				hints.push('compose "app shell" -- get root layout template');
			}
			break;

		case 'install':
			hints.push('detect -- verify project after completing steps');
			break;
	}

	return hints;
}

/** Format help hints as plain next-step suggestions. */
export function formatHelp(hints: string[]): string {
	if (hints.length === 0) return '';
	const lines = [`next[${hints.length}]:`];
	for (const hint of hints) {
		lines.push('  ' + hint);
	}
	return lines.join('\n');
}

// ── Component info ─────────────────────────────────────────

export function toonComponent(name: string, def: ComponentDef, opts?: { full?: boolean | undefined }): string {
	const full = opts?.full ?? false;
	const lines: string[] = [];

	// Header
	lines.push(
		`${name} -- ${def.description}`,
		`category: ${def.category} | tags: ${def.tags.join(',')}`,
		`import: import { ${name} } from '${def.import}'`,
		`compound: ${def.compound}`
	);

	// Structure
	if (def.compound && def.structure?.tree.length) {
		lines.push('', header('structure', def.structure.tree.length, ['node']));
		for (const node of def.structure.tree) {
			lines.push('  ' + node);
		}
		if (def.structure.note) lines.push(`  note: ${def.structure.note}`);
	}

	// Props (simple) or Parts (compound)
	if (def.compound && def.parts) {
		const partEntries = Object.entries(def.parts);
		lines.push('', header('parts', partEntries.length, ['part']));
		for (const [partName, partDef] of partEntries) {
			lines.push(`  ${name}.${partName}`);
			const props = Object.entries(partDef.props ?? {});
			if (props.length > 0) {
				for (const [propName, propDef] of props) {
					const flags = [propDef.type];
					if (propDef.required) flags.push('required');
					if (propDef.default !== undefined) flags.push(`default:${propDef.default}`);
					if (propDef.acceptedValues?.length)
						flags.push(`values:${propDef.acceptedValues.join('|')}`);
					lines.push(`    ${propName}: ${flags.join(' | ')}`);
				}
			}
		}
	} else if (def.props) {
		const propEntries = Object.entries(def.props);
		if (propEntries.length > 0) {
			lines.push('', header('props', propEntries.length, ['name', 'type', 'required', 'default']));
			for (const [propName, propDef] of propEntries) {
				lines.push(
					row(
						propName,
						propDef.type,
						propDef.required ? 'yes' : 'no',
						propDef.default ?? '-'
					)
				);
			}
		}
	}

	// CSS Variables
	const cssEntries = Object.entries(def.cssVars);
	if (cssEntries.length > 0) {
		lines.push('', header('css-vars', cssEntries.length, ['name', 'description']));
		for (const [varName, desc] of cssEntries) {
			lines.push(row(varName, desc));
		}
	}

	// Data Attributes
	if (def.dataAttributes.length > 0) {
		lines.push(
			'',
			header('data-attrs', def.dataAttributes.length, ['name', 'values'])
		);
		for (const attr of def.dataAttributes) {
			lines.push(row(attr.name, attr.values?.join('|') ?? '-'));
		}
	}

	// Example
	if (def.example) {
		const example = full ? def.example : truncate(def.example, 400, `use add ${name} for full snippet`);
		lines.push('', 'example:', example);
	}

	// Contextual help
	const help = buildContextualHelp({ command: 'info', componentName: name });
	if (help.length > 0) {
		lines.push('', formatHelp(help));
	}

	return lines.join('\n');
}

// ── Component list ─────────────────────────────────────────

export function toonComponentList(
	components: Record<string, ComponentDef>,
	category?: string
): string {
	const entries = Object.entries(components);
	const filtered = category
		? entries.filter(([, def]) => def.category.toLowerCase() === category.toLowerCase())
		: entries;

	if (filtered.length === 0) {
		const cats = [...new Set(entries.map(([, d]) => d.category))].sort();
		return `components[0]: no matches\navailable categories: ${cats.join(', ')}`;
	}

	// Group by category
	const groups: Record<string, Array<[string, ComponentDef]>> = {};
	for (const entry of filtered) {
		const cat = entry[1].category;
		(groups[cat] ??= []).push(entry);
	}

	const lines: string[] = [header('components', filtered.length, ['name', 'category', 'compound', 'description'])];
	const sortedCats = Object.keys(groups).sort();
	for (const cat of sortedCats) {
		const items = groups[cat] ?? [];
		for (const [name, def] of items) {
			lines.push(row(name, cat, def.compound, def.description));
		}
	}

	// Contextual help
	const help = buildContextualHelp({ command: 'list' });
	if (help.length > 0) {
		lines.push('', formatHelp(help));
	}

	return lines.join('\n');
}

// ── Composition ────────────────────────────────────────────

export function toonComposition(
	results: { componentMatches: readonly CompositionComponentDef[]; recipeMatches: readonly CompositionRecipeDef[] },
	opts?: { full?: boolean | undefined }
): string {
	const full = opts?.full ?? false;
	const lines: string[] = [];
	const totalMatches = results.componentMatches.length + results.recipeMatches.length;

	if (totalMatches === 0) {
		return 'matches[0]: none';
	}

	// Component matches
	for (const comp of results.componentMatches) {
		lines.push(`-- ${comp.component}: ${comp.useWhen}`);

		for (const alt of comp.alternatives) {
			const snippet = full
				? alt.snippet
				: truncate(alt.snippet, 500, `use info ${alt.component} for full snippet`);
			lines.push(`  ${alt.rank}. ${alt.component} (${alt.useWhen})`);
			lines.push(
				snippet
					.split('\n')
					.map((l) => '     ' + l)
					.join('\n')
			);
		}

		for (const ap of comp.antiPatterns) {
			lines.push(`  anti-pattern: ${ap.pattern}`);
			lines.push(`    reason: ${ap.reason} | fix: ${ap.fix}`);
		}

		if (comp.combinesWith.length) {
			lines.push(`  combines-with: ${comp.combinesWith.join(',')}`);
		}
		lines.push('');
	}

	// Recipe matches
	for (const recipe of results.recipeMatches) {
		const snippet = full
			? recipe.snippet
			: truncate(recipe.snippet, 500, `use compose "${recipe.name}" --full for complete code`);
		lines.push(`-- recipe: ${recipe.name}`);
		lines.push(`  ${recipe.description}`);
		lines.push(`  components: ${recipe.components.join(',')}`);
		lines.push('  code:');
		lines.push(
			snippet
				.split('\n')
				.map((l) => '    ' + l)
				.join('\n')
		);
		lines.push('');
	}

	// Contextual help
	const firstComponent = results.componentMatches[0]?.alternatives[0]?.component
		?? results.recipeMatches[0]?.components[0]
		?? undefined;
	const ctx: HelpContext = { command: 'compose' };
	if (firstComponent) ctx.componentName = firstComponent;
	const help = buildContextualHelp(ctx);
	if (help.length > 0) {
		lines.push(formatHelp(help));
	}

	return lines.join('\n').trimEnd();
}

// ── Review result ──────────────────────────────────────────

export function toonReviewResult(result: ReviewResult): string {
	const lines: string[] = [];
	const hasBlockers = result.issues.some((i) => i.severity === 'error');
	const autoFixable = result.issues.filter((i) => i.fix !== null).length;

	if (result.issues.length === 0) {
		lines.push('issues[0]: clean');
		lines.push(`hasBlockers: false | autoFixable: 0`);
	} else {
		lines.push(header('issues', result.issues.length, ['severity', 'line', 'code', 'message']));
		for (const issue of result.issues) {
			lines.push(row(issue.severity, issue.line, issue.code, issue.message));
			if (issue.fix) {
				lines.push(`    fix: ${issue.fix}`);
			}
		}
		lines.push(`hasBlockers: ${hasBlockers} | autoFixable: ${autoFixable}`);
	}

	lines.push(result.summary);

	// Contextual help
	const help = buildContextualHelp({
		command: 'review',
		hasErrors: hasBlockers,
		isEmpty: result.issues.length === 0
	});
	if (help.length > 0) {
		lines.push('', formatHelp(help));
	}

	return lines.join('\n');
}

// ── Diagnose result ────────────────────────────────────────

export function toonDiagnoseResult(result: DiagnoseResult): string {
	const lines: string[] = [];
	const { variables } = result;
	// variables.required = count of required tokens that were found (not total required)
	// Count missing-token issues to derive total required tokens
	const missingCount = result.issues.filter((i) => i.code === 'missing-token').length;
	const totalRequired = variables.required + missingCount;
	const coverage = totalRequired > 0 ? Math.round((variables.required / totalRequired) * 100) : 100;

	lines.push(
		`tokens: ${variables.found} found, ${variables.required} required, ${variables.extra} extra | coverage: ${coverage}%`
	);

	if (result.issues.length === 0) {
		lines.push('issues[0]: clean');
	} else {
		lines.push(header('issues', result.issues.length, ['severity', 'code', 'variable', 'message']));
		for (const issue of result.issues) {
			lines.push(row(issue.severity, issue.code, issue.variable, issue.message));
			if (issue.fix) {
				lines.push(`    fix: ${issue.fix}`);
			}
		}
	}

	lines.push(result.summary);

	// Contextual help
	const hasErrors = result.issues.some((i) => i.severity === 'error');
	const help = buildContextualHelp({
		command: 'diagnose',
		hasErrors,
		isEmpty: result.issues.length === 0
	});
	if (help.length > 0) {
		lines.push('', formatHelp(help));
	}

	return lines.join('\n');
}

// ── Workspace report (doctor/lint) ─────────────────────────

const MAX_FINDINGS_DEFAULT = 50;

export function toonWorkspaceReport(
	report: WorkspaceReport,
	opts?: { title?: string | undefined; command?: 'doctor' | 'lint' | undefined; full?: boolean | undefined }
): string {
	const full = opts?.full ?? false;
	const title = opts?.title ?? 'workspace';
	const command: HelpCommand = opts?.command ?? (title.includes('lint') ? 'lint' : 'doctor');
	const lines: string[] = [];

	lines.push(`${title} | root: ${report.root}`);
	lines.push(
		`scanned: ${report.scannedFiles} files | errors: ${report.summary.error} | warnings: ${report.summary.warning} | info: ${report.summary.info}`
	);

	// Top rule (pre-computed aggregate)
	if (report.summary.byRule && Object.keys(report.summary.byRule).length > 0) {
		const sorted = Object.entries(report.summary.byRule).sort(([, a], [, b]) => b - a);
		const topRule = sorted[0];
		if (topRule) {
			lines.push(`top-rule: ${topRule[0]} (${topRule[1]} occurrences)`);
		}
	}

	if (report.findings.length === 0) {
		lines.push('findings[0]: clean');
	} else {
		const findings = full
			? report.findings
			: report.findings.slice(0, MAX_FINDINGS_DEFAULT);
		const truncated = !full && report.findings.length > MAX_FINDINGS_DEFAULT;

		lines.push(
			header('findings', findings.length, ['severity', 'rule', 'file', 'line', 'message'])
		);
		for (const f of findings) {
			lines.push(row(f.severity, f.ruleId, f.file, f.line ?? '-', f.message));
			if (f.suggestedFixes.length > 0) {
				for (const fix of f.suggestedFixes) {
					lines.push(`    fix: ${fix.description}${fix.replacement ? ` -> ${fix.replacement}` : ''}`);
				}
			}
		}

		if (truncated) {
			lines.push(
				`  (showing ${MAX_FINDINGS_DEFAULT} of ${report.findings.length} -- use --full to see all)`
			);
		}
	}

	if (report.warnings.length > 0) {
		lines.push('', header('warnings', report.warnings.length, ['message']));
		for (const w of report.warnings) {
			lines.push('  ' + w);
		}
	}

	// Contextual help
	const help = buildContextualHelp({
		command,
		hasFindings: report.findings.length > 0,
		isEmpty: report.findings.length === 0
	});
	if (help.length > 0) {
		lines.push('', formatHelp(help));
	}

	return lines.join('\n');
}

// ── Project detection ──────────────────────────────────────

export function toonProjectDetection(detection: ProjectDetection): string {
	const lines: string[] = [];

	lines.push(
		`project: ${detection.status} | framework: ${detection.framework} | pkg-manager: ${detection.packageManager}`
	);
	lines.push(`root: ${detection.root ?? '(not found)'}`);
	lines.push(
		`deps: ui=${detection.dependencies.ui}, primitives=${detection.dependencies.primitives}`
	);
	lines.push(
		`theme: default=${detection.theme.defaultImported}, dark=${detection.theme.darkImported}, auto=${detection.theme.themeAuto}`
	);

	if (detection.warnings.length > 0) {
		lines.push(header('warnings', detection.warnings.length, ['message']));
		for (const w of detection.warnings) {
			lines.push('  ' + w);
		}
	}

	// Contextual help
	const help = buildContextualHelp({ command: 'detect', status: detection.status });
	if (help.length > 0) {
		lines.push('', formatHelp(help));
	}

	return lines.join('\n');
}

// ── Install plan ───────────────────────────────────────────

function toonStep(step: ProjectPlanStep, index: number): string {
	const parts = [`${index + 1}. [${step.status}] ${step.title}: ${step.description}`];
	if (step.command) parts.push(`   cmd: ${step.command}`);
	if (step.path) parts.push(`   file: ${step.path}`);
	return parts.join('\n');
}

export function toonInstallPlan(plan: InstallPlan): string {
	const lines: string[] = [];

	lines.push(toonProjectDetection(plan.detection));
	lines.push('');

	if (plan.steps.length === 0) {
		lines.push('steps[0]: none needed');
	} else {
		lines.push(header('steps', plan.steps.length, ['status', 'title', 'description']));
		for (const [i, step] of plan.steps.entries()) {
			lines.push(toonStep(step, i));
		}
	}

	// Contextual help
	const help = buildContextualHelp({ command: 'install' });
	if (help.length > 0) {
		lines.push('', formatHelp(help));
	}

	return lines.join('\n');
}

// ── Add plan ───────────────────────────────────────────────

export function toonAddPlan(plan: AddPlan): string {
	const lines: string[] = [];

	lines.push(`add: ${plan.name} | target: ${plan.target ?? '(choose)'}` );
	if (plan.importStatement) {
		lines.push(`import: ${plan.importStatement}`);
	}
	lines.push('');

	// Install prerequisites
	if (plan.installPlan.steps.length > 0) {
		lines.push(header('install-steps', plan.installPlan.steps.length, ['status', 'title']));
		for (const [i, step] of plan.installPlan.steps.entries()) {
			lines.push(toonStep(step, i));
		}
		lines.push('');
	}

	// Add steps
	if (plan.steps.length > 0) {
		lines.push(header('add-steps', plan.steps.length, ['status', 'title']));
		for (const [i, step] of plan.steps.entries()) {
			lines.push(toonStep(step, i));
		}
	}

	if (plan.warnings.length > 0) {
		lines.push('', header('warnings', plan.warnings.length, ['message']));
		for (const w of plan.warnings) {
			lines.push('  ' + w);
		}
	}

	return lines.join('\n');
}

// ── Structured error ───────────────────────────────────────

export function toonError(code: string, message: string, suggestions?: string[]): string {
	const lines = [`error[1]{code,message}: ${esc(code)},${esc(message)}`];
	if (suggestions?.length) {
		lines.push(header('suggestions', suggestions.length, ['value']));
		for (const s of suggestions) {
			lines.push('  ' + s);
		}
	}
	return lines.join('\n');
}
