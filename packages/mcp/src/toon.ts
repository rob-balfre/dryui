// TOON (Token-Optimized Object Notation) serializer for DryUI.
// AXI-inspired format: ~40% fewer tokens than JSON for agent consumption.
// Format: resource[count]{fields}: value1,value2,...

import type {
	ComponentDef,
	CompositionComponentDef,
	CompositionRecipeDef,
	Spec
} from './spec-types.js';
import type { ReviewResult } from './component-checker.js';
import type { DiagnoseResult } from './theme-checker.js';
import type { WorkspaceReport, WorkspaceFinding } from './workspace-audit.js';
import type { ProjectDetection, InstallPlan, AddPlan, ProjectPlanStep } from './project-planner.js';
import type { TokenResult } from './tokens.js';
import { componentKind, getBindableProps, getRequiredParts } from './spec-formatters.js';

// ── Utilities ──────────────────────────────────────────────

/** Escape commas and newlines in field values for TOON row safety. */
export function esc(value: string): string {
	if (value.includes(',') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

/** Format a TOON header line: resource[count]{fields}: */
export function header(resource: string, count: number, fields: string[]): string {
	return `${resource}[${count}]{${fields.join(',')}}:`;
}

/** Format a TOON row with indentation. */
export function row(...values: (string | number | boolean)[]): string {
	return '  ' + values.map((v) => esc(String(v))).join(',');
}

/**
 * Block-level truncation hint: `(truncated, N chars total — use <cmd> for complete body)`.
 * Emitted once at the end of a block whenever any child row or body was capped.
 * Agents can match it with a single regex.
 */
function formatTruncationHint(totalChars: number, overrideCmd: string): string {
	return `(truncated, ${totalChars} chars total — use ${overrideCmd} for complete body)`;
}

/** Truncate a body text and replace with the block-level hint if it exceeds maxLen. */
function truncate(text: string, maxLen: number, overrideCmd: string): string {
	if (text.length <= maxLen) return text;
	return formatTruncationHint(text.length, overrideCmd);
}

/**
 * Truncate a row-level field (message / description / reason / fix) with an inline
 * `…` marker. Callers should emit a single block-level `formatTruncationHint` at the
 * end of the row block when any field was capped — use the `[value, wasCapped]` tuple
 * returned here to track that without a second length comparison.
 */
export const FIELD_CAP = 240;
export function truncateField(value: string, max = FIELD_CAP): [string, boolean] {
	if (value.length <= max) return [value, false];
	return [value.slice(0, max - 1) + '…', true];
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
	| 'install'
	| 'tokens';

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
			} else if (ctx.hasFindings) {
				// Warnings-only case: the run is not a CI blocker but still has issues
				// worth surfacing. Point at --full for complete context and doctor for
				// workspace-wide triage.
				hints.push('diagnose <file.css> --full -- see full messages');
				hints.push('doctor --max-severity warning -- triage across workspace');
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

		case 'tokens':
			hints.push('tokens --category color -- filter to color tokens');
			hints.push('diagnose <file.css> -- validate theme overrides');
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

export function toonComponent(
	name: string,
	def: ComponentDef,
	opts?: { full?: boolean | undefined; includeHelp?: boolean | undefined }
): string {
	const full = opts?.full ?? false;
	const includeHelp = opts?.includeHelp ?? true;
	const lines: string[] = [];
	const bindables = getBindableProps(def);
	const requiredParts = getRequiredParts(name, def);

	// Header
	lines.push(
		`${name} -- ${def.description}`,
		`category: ${def.category} | tags: ${def.tags.join(',')}`,
		`import: import { ${name} } from '${def.import}'`,
		`kind: ${componentKind(def)}`,
		`required-parts: ${requiredParts.length ? requiredParts.join(',') : 'none'}`,
		`bindables: ${bindables.length ? bindables.join(',') : 'none'}`
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
	const propNotes: Array<[string, string]> = [];

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
					if (propDef.note) propNotes.push([`${partName}.${propName}`, propDef.note]);
				}
			}
		}
	} else if (def.props) {
		const propEntries = Object.entries(def.props);
		if (propEntries.length > 0) {
			lines.push('', header('props', propEntries.length, ['name', 'type', 'required', 'default']));
			for (const [propName, propDef] of propEntries) {
				lines.push(
					row(propName, propDef.type, propDef.required ? 'yes' : 'no', propDef.default ?? '-')
				);
				if (propDef.note) propNotes.push([propName, propDef.note]);
			}
		}
	}

	// Prop notes — surface adoption context that does not fit on the row itself.
	if (propNotes.length > 0) {
		lines.push('', header('prop-notes', propNotes.length, ['prop', 'note']));
		for (const [prop, note] of propNotes) {
			lines.push(row(prop, note));
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
		lines.push('', header('data-attrs', def.dataAttributes.length, ['name', 'values']));
		for (const attr of def.dataAttributes) {
			lines.push(row(attr.name, attr.values?.join('|') ?? '-'));
		}
	}

	// Example
	if (def.example) {
		const example = full ? def.example : truncate(def.example, 400, `add ${name}`);
		lines.push('', 'canonical:', example);
	}

	// Contextual help
	if (includeHelp) {
		const help = buildContextualHelp({ command: 'info', componentName: name });
		if (help.length > 0) {
			lines.push('', formatHelp(help));
		}
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

	const lines: string[] = [
		header('components', filtered.length, ['name', 'category', 'compound', 'description'])
	];
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
	results: {
		componentMatches: readonly CompositionComponentDef[];
		recipeMatches: readonly CompositionRecipeDef[];
	},
	components: Record<string, ComponentDef>,
	opts?: { full?: boolean | undefined }
): string {
	const full = opts?.full ?? false;
	const lines: string[] = [];
	const totalMatches = results.componentMatches.length + results.recipeMatches.length;

	if (totalMatches === 0) {
		return 'matches[0]: none';
	}

	// Top-level match-count aggregate. Top match is the first component match if any,
	// otherwise the first recipe. Gives agents a pre-computed count so they can skip
	// the whole block when it's empty.
	const topMatch = results.componentMatches[0]?.component ?? results.recipeMatches[0]?.name ?? '';
	lines.push(`matches[${totalMatches}]: ${topMatch}`);
	lines.push('');

	let anyFieldTruncated = false;

	for (const comp of results.componentMatches) {
		const [compUseWhen, t1] = truncateField(comp.useWhen);
		anyFieldTruncated ||= t1;
		lines.push(`-- ${comp.component}: ${compUseWhen}`);

		for (const alt of comp.alternatives) {
			const snippet = full ? alt.snippet : truncate(alt.snippet, 500, `info ${alt.component}`);
			const [altUseWhen, t2] = truncateField(alt.useWhen);
			anyFieldTruncated ||= t2;
			lines.push(`  ${alt.rank}. ${alt.component} (${altUseWhen})`);
			const spec = components[alt.component];
			if (spec) {
				const requiredParts = getRequiredParts(alt.component, spec);
				const bindables = getBindableProps(spec);
				lines.push(
					`     kind: ${componentKind(spec)} | required-parts: ${requiredParts.length ? requiredParts.join(',') : 'none'} | bindables: ${bindables.length ? bindables.join(',') : 'none'}`
				);
				const canonical = full
					? spec.example
					: truncate(spec.example, 240, `info ${alt.component}`);
				lines.push('     canonical:');
				lines.push(
					canonical
						.split('\n')
						.map((line) => `       ${line}`)
						.join('\n')
				);
			}
			lines.push(
				snippet
					.split('\n')
					.map((l) => '     ' + l)
					.join('\n')
			);
		}

		for (const ap of comp.antiPatterns) {
			const [reason, t3] = truncateField(ap.reason);
			const [fix, t4] = truncateField(ap.fix);
			anyFieldTruncated ||= t3 || t4;
			lines.push(`  anti-pattern: ${ap.pattern}`);
			lines.push(`    reason: ${reason} | fix: ${fix}`);
		}

		if (comp.combinesWith.length) {
			lines.push(`  combines-with: ${comp.combinesWith.join(',')}`);
		}
		lines.push('');
	}

	for (const recipe of results.recipeMatches) {
		const snippet = full
			? recipe.snippet
			: truncate(recipe.snippet, 500, `compose "${recipe.name}" --full`);
		const [description, t5] = truncateField(recipe.description);
		anyFieldTruncated ||= t5;
		lines.push(`-- recipe: ${recipe.name}`);
		lines.push(`  ${description}`);
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

	if (anyFieldTruncated) {
		lines.push(formatTruncationHint(FIELD_CAP, 'compose <query> --full'));
		lines.push('');
	}

	const hasComponent =
		results.componentMatches[0]?.alternatives[0]?.component !== undefined ||
		results.recipeMatches[0]?.components[0] !== undefined;
	const ctx: HelpContext = { command: 'compose' };
	if (hasComponent) ctx.componentName = '<Component>';
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
		let anyTruncated = false;
		for (const issue of result.issues) {
			const [message, mt] = truncateField(issue.message);
			anyTruncated ||= mt;
			lines.push(row(issue.severity, issue.line, issue.code, message));
			if (issue.fix) {
				const [fix, ft] = truncateField(issue.fix);
				anyTruncated ||= ft;
				lines.push(`    fix: ${fix}`);
			}
		}
		if (anyTruncated) {
			lines.push(`  ${formatTruncationHint(FIELD_CAP, 'review <file.svelte> --full')}`);
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

	const counts = { error: 0, warning: 0, info: 0 };
	for (const issue of result.issues) {
		counts[issue.severity]++;
	}
	const hasErrors = counts.error > 0;
	const hasWarnings = counts.warning > 0;

	if (result.issues.length === 0) {
		lines.push('issues[0]: clean');
	} else {
		lines.push(`errors: ${counts.error} | warnings: ${counts.warning} | info: ${counts.info}`);

		lines.push(header('issues', result.issues.length, ['severity', 'code', 'variable', 'message']));
		let anyTruncated = false;
		for (const issue of result.issues) {
			const [message, mt] = truncateField(issue.message);
			anyTruncated ||= mt;
			lines.push(row(issue.severity, issue.code, issue.variable, message));
			if (issue.fix) {
				const [fix, ft] = truncateField(issue.fix);
				anyTruncated ||= ft;
				lines.push(`    fix: ${fix}`);
			}
		}
		if (anyTruncated) {
			lines.push(`  ${formatTruncationHint(FIELD_CAP, 'diagnose <file.css> --full')}`);
		}
	}

	lines.push(result.summary);

	const help = buildContextualHelp({
		command: 'diagnose',
		hasErrors,
		hasFindings: hasWarnings,
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
	opts?: {
		title?: string | undefined;
		command?: 'doctor' | 'lint' | undefined;
		full?: boolean | undefined;
	}
): string {
	const full = opts?.full ?? false;
	const title = opts?.title ?? 'workspace';
	const command: HelpCommand = opts?.command ?? (title.includes('lint') ? 'lint' : 'doctor');
	const lines: string[] = [];

	const hasBlockers = report.summary.error > 0;
	const autoFixable = report.findings.filter((f) => f.fixable).length;

	lines.push(`${title} | root: ${report.root}`);
	lines.push(
		`scanned: ${report.scannedFiles} files | errors: ${report.summary.error} | warnings: ${report.summary.warning} | info: ${report.summary.info}`
	);
	lines.push(`hasBlockers: ${hasBlockers} | autoFixable: ${autoFixable}`);

	if (report.summary.byRule) {
		let topRule: [string, number] | null = null;
		for (const entry of Object.entries(report.summary.byRule)) {
			if (!topRule || entry[1] > topRule[1]) topRule = entry;
		}
		if (topRule) {
			lines.push(`top-rule: ${topRule[0]} (${topRule[1]} occurrences)`);
		}
	}

	if (report.findings.length === 0) {
		lines.push('findings[0]: clean');
	} else {
		const findings = full ? report.findings : report.findings.slice(0, MAX_FINDINGS_DEFAULT);
		const truncated = !full && report.findings.length > MAX_FINDINGS_DEFAULT;

		lines.push(
			header('findings', findings.length, ['severity', 'rule', 'file', 'line', 'message'])
		);
		let anyMessageTruncated = false;
		for (const f of findings) {
			const [message, mt] = truncateField(f.message);
			anyMessageTruncated ||= mt;
			lines.push(row(f.severity, f.ruleId, f.file, f.line ?? '-', message));
			for (const fix of f.suggestedFixes) {
				const [fixDesc, dt] = truncateField(fix.description);
				anyMessageTruncated ||= dt;
				let replacementStr = '';
				if (fix.replacement) {
					const [rep, rt] = truncateField(fix.replacement);
					anyMessageTruncated ||= rt;
					replacementStr = ` -> ${rep}`;
				}
				lines.push(`    fix: ${fixDesc}${replacementStr}`);
			}
		}

		if (truncated) {
			lines.push(
				`  (showing ${MAX_FINDINGS_DEFAULT} of ${report.findings.length} — use --full to see all)`
			);
		}
		if (anyMessageTruncated) {
			lines.push(`  ${formatTruncationHint(FIELD_CAP, `review <file> or ${command} --full`)}`);
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

export function toonProjectDetection(
	detection: ProjectDetection,
	opts?: { includeHelp?: boolean | undefined }
): string {
	const includeHelp = opts?.includeHelp ?? true;
	const lines: string[] = [];

	lines.push(
		`project: ${detection.status} | framework: ${detection.framework} | pkg-manager: ${detection.packageManager}`
	);
	lines.push(`root: ${detection.root ?? '(not found)'}`);
	lines.push(
		`deps: ui=${detection.dependencies.ui}, primitives=${detection.dependencies.primitives}, lint=${detection.dependencies.lint}`
	);
	lines.push(
		`theme: default=${detection.theme.defaultImported}, dark=${detection.theme.darkImported}, auto=${detection.theme.themeAuto}`
	);
	lines.push(
		`lint: wired=${detection.lint.preprocessorWired}, svelte-config=${detection.files.svelteConfig ?? '(not found)'}`
	);

	if (detection.warnings.length > 0) {
		lines.push(header('warnings', detection.warnings.length, ['message']));
		for (const w of detection.warnings) {
			lines.push('  ' + w);
		}
	}

	// Contextual help
	if (includeHelp) {
		const help = buildContextualHelp({ command: 'detect', status: detection.status });
		if (help.length > 0) {
			lines.push('', formatHelp(help));
		}
	}

	return lines.join('\n');
}

// ── Install plan ───────────────────────────────────────────

function toonStep(step: ProjectPlanStep, index: number, showSnippets = false): string {
	const parts = [`${index + 1}. [${step.status}] ${step.title}: ${step.description}`];
	if (step.command) parts.push(`   cmd: ${step.command}`);
	if (step.path) parts.push(`   file: ${step.path}`);
	if (showSnippets && step.snippet && step.kind === 'create-file') {
		parts.push(`   ---\n${step.snippet}   ---`);
	}
	return parts.join('\n');
}

export function toonInstallPlan(
	plan: InstallPlan,
	opts?: { includeHelp?: boolean | undefined }
): string {
	const includeHelp = opts?.includeHelp ?? true;
	const lines: string[] = [];
	const isScaffold =
		plan.detection.status === 'unsupported' && plan.steps.some((s) => s.kind === 'create-file');

	lines.push(toonProjectDetection(plan.detection, { includeHelp }));
	lines.push('');

	if (plan.steps.length === 0) {
		lines.push('steps[0]: none needed');
	} else {
		const label = isScaffold ? 'scaffold-steps' : 'steps';
		lines.push(header(label, plan.steps.length, ['status', 'title', 'description']));
		for (const [i, step] of plan.steps.entries()) {
			lines.push(toonStep(step, i, isScaffold));
		}
	}

	// Contextual help
	if (includeHelp) {
		const help = buildContextualHelp({ command: 'install' });
		if (help.length > 0) {
			lines.push('', formatHelp(help));
		}
	}

	return lines.join('\n');
}

// ── Add plan ───────────────────────────────────────────────

export function toonAddPlan(plan: AddPlan): string {
	const lines: string[] = [];

	lines.push(`add: ${plan.name} | target: ${plan.target ?? '(choose)'}`);
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

// ── Token list ────────────────────────────────────────────

export function toonTokens(result: TokenResult, category?: string): string {
	const lines: string[] = [];

	if (result.tokens.length === 0) {
		if (category) {
			lines.push(`tokens[0]: no matches for category "${category}"`);
		} else {
			lines.push('tokens[0]: none found');
		}
	} else {
		// Summary line with category counts
		const countParts: string[] = [];
		for (const [cat, count] of Object.entries(result.counts).sort(([a], [b]) =>
			a.localeCompare(b)
		)) {
			countParts.push(`${cat}:${count}`);
		}
		lines.push(`total: ${result.total} | ${countParts.join(', ')}`);

		lines.push('', header('tokens', result.tokens.length, ['name', 'category', 'light', 'dark']));
		for (const token of result.tokens) {
			lines.push(row(token.name, token.category, token.light, token.dark));
		}
	}

	// Contextual help
	const help = buildContextualHelp({ command: 'tokens' });
	if (help.length > 0) {
		lines.push('', formatHelp(help));
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
