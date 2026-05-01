import { readFileSync, statSync, type Stats } from 'node:fs';
import { resolve } from 'node:path';
import { checkComponent } from '../component-checker.js';
import { checkLayoutCss } from '@dryui/lint/layout-css';
import { diagnoseTheme } from '../theme-checker.js';
import { scanWorkspace, type WorkspaceReport } from '../workspace-audit.js';
import { FIELD_CAP, formatHelp, header, row, truncateField } from '../toon.js';
import type { Spec } from '../spec-types.js';
import { enrichDiagnostic } from '../enrich-diagnostics.js';
import { displayPath } from '../utils.js';
import type {
	DryUiRepairIssue,
	DryUiRepairIssueSeverity,
	DryUiRepairIssueSource
} from '../repair-types.js';
import { StructuredToolError } from './tool-error.js';

type CheckSeverity = 'error' | 'warning' | 'suggestion' | 'info';

interface CheckIssue {
	readonly file: string;
	readonly line: number | null;
	readonly rule: string;
	readonly severity: CheckSeverity;
	readonly message: string;
	readonly suggestedFix: string | null;
}

interface CheckInput {
	readonly path?: string;
}

interface CheckOptions {
	readonly cwd?: string;
}

/**
 * Aggregate view of the enriched diagnostics that the JSON block (and the
 * TOON header) serialise. `autoFixable` and `hasBlockers` are computed from
 * the post-enrichment diagnostics so the two transports agree.
 *
 * Today `autoFixable` is always 0 because {@link makeFixPair} is a stub; no
 * rule ships a structured diff yet. That is intentional and the honest signal
 * to agents: treat `autoFixable=false` as "apply `hint`, then re-check".
 */
export interface CheckSummary {
	readonly hasBlockers: boolean;
	readonly autoFixable: number;
	readonly counts: {
		readonly error: number;
		readonly warning: number;
		readonly suggestion: number;
		readonly info: number;
		readonly total: number;
	};
}

export interface CheckResult {
	readonly text: string;
	readonly diagnostics: readonly DryUiRepairIssue[];
	readonly summary: CheckSummary;
}

function cap(value: string, max = FIELD_CAP): string {
	return truncateField(value, max)[0];
}

/**
 * Summary computed from the enriched (post-dedup) diagnostics so the TOON
 * `hasBlockers | autoFixable` header and the JSON `summary` block agree. The
 * `autoFixable` count deliberately uses `d.autoFixable === true` rather than
 * the prose `suggestedFix` string; prose guidance is not a structured diff
 * and agents cannot apply it without the `hint`.
 */
function deriveDiagnosticSummary(diagnostics: readonly DryUiRepairIssue[]): CheckSummary {
	const counts = { error: 0, warning: 0, suggestion: 0, info: 0, total: 0 };
	let autoFixable = 0;
	let hasBlockers = false;
	for (const d of diagnostics) {
		counts[d.severity] += 1;
		counts.total += 1;
		if (d.autoFixable === true) autoFixable += 1;
		if (d.severity === 'error') hasBlockers = true;
	}
	return { hasBlockers, autoFixable, counts };
}

function renderIssues(issues: readonly CheckIssue[]): string[] {
	if (issues.length === 0) return ['issues[0]: clean'];

	const lines = [header('issues', issues.length, ['file', 'line', 'rule', 'severity', 'message'])];
	for (const issue of issues) {
		lines.push(row(issue.file, issue.line ?? '-', issue.rule, issue.severity, cap(issue.message)));
		if (issue.suggestedFix) {
			lines.push(`    fix: ${cap(issue.suggestedFix)}`);
		}
	}
	return lines;
}

function renderCounts(counts: Record<CheckSeverity, number>): string {
	return `severityCounts: error=${counts.error} | warning=${counts.warning} | suggestion=${counts.suggestion} | info=${counts.info}`;
}

interface CheckReportOptions {
	readonly kind: string;
	readonly targetLine: string;
	readonly issues: readonly CheckIssue[];
	readonly diagnosticSummary: CheckSummary;
	readonly summaryLine: string;
	readonly nextHints: readonly string[];
	readonly extraBlocks?: readonly string[];
}

function renderCheckReport(opts: CheckReportOptions): string {
	const { hasBlockers, autoFixable, counts } = opts.diagnosticSummary;
	const lines: string[] = [
		`kind: ${opts.kind}`,
		opts.targetLine,
		`hasBlockers: ${hasBlockers} | autoFixable: ${autoFixable}`,
		renderCounts(counts),
		'',
		...renderIssues(opts.issues)
	];

	if (opts.extraBlocks && opts.extraBlocks.length > 0) {
		for (const block of opts.extraBlocks) {
			lines.push('', block);
		}
	}

	lines.push('', `summary: ${opts.summaryLine}`, '', formatHelp([...opts.nextHints]));
	return lines.join('\n');
}

// The current rule catalog ships prose guidance, not concrete before/after
// diffs, so we deliberately do NOT fabricate a fix pair from the fix string.
// Agents should treat autoFixable=false as "use hint, then re-check".
// When a rule starts shipping structured diffs we add the mapping here.
function makeFixPair(_suggestedFix: string | null): { before: string; after: string } | undefined {
	return undefined;
}

function dedupeDiagnostics(issues: readonly DryUiRepairIssue[]): readonly DryUiRepairIssue[] {
	const seen = new Set<string>();
	const out: DryUiRepairIssue[] = [];
	for (const issue of issues) {
		const key = `${issue.source}|${issue.code}|${issue.file ?? ''}|${issue.line ?? ''}|${issue.message}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(issue);
	}
	return out;
}

function renderTheme(spec: Spec, absPath: string): CheckResult {
	const css = readFileSync(absPath, 'utf-8');
	const rel = displayPath(absPath);
	const themeResult = diagnoseTheme(css, spec, absPath);

	const themeIssues: CheckIssue[] = themeResult.issues.map((issue) => ({
		file: rel,
		line: null,
		rule: issue.code,
		severity: issue.severity,
		message: issue.message,
		suggestedFix: issue.fix
	}));
	const issues: CheckIssue[] = [...themeIssues];

	const diagnostics = dedupeDiagnostics([
		...themeResult.issues.map((issue) =>
			enrichDiagnostic({
				source: 'theme' as const,
				code: issue.code,
				severity: issue.severity as DryUiRepairIssueSeverity,
				message: issue.message,
				file: rel
			})
		)
	]);
	const summary = deriveDiagnosticSummary(diagnostics);

	const missingCount = themeResult.issues.filter((issue) => issue.code === 'missing-token').length;
	const totalRequired = themeResult.variables.required + missingCount;
	const coverage =
		totalRequired > 0 ? Math.round((themeResult.variables.required / totalRequired) * 100) : 100;

	const summaryLine = themeResult.summary;
	const targetLine = `target: ${rel} | coverage: ${coverage}%`;

	const text = renderCheckReport({
		kind: 'theme',
		targetLine,
		issues,
		diagnosticSummary: summary,
		summaryLine,
		nextHints: [
			'ask --scope list "" -- browse available components and tokens',
			'ask --scope setup "" -- review project bootstrap and theme guidance'
		]
	});
	return { text, diagnostics, summary };
}

function isLayoutCssPath(path: string): boolean {
	return displayPath(path).replaceAll('\\', '/').endsWith('src/layout.css');
}

function renderLayoutCss(absPath: string): CheckResult {
	const css = readFileSync(absPath, 'utf-8');
	const rel = displayPath(absPath);
	const result = checkLayoutCss(css, rel);
	const issues: CheckIssue[] = result.map((issue) => ({
		file: rel,
		line: issue.line,
		rule: issue.rule,
		severity: 'error',
		message: issue.message,
		suggestedFix: null
	}));
	const diagnostics = dedupeDiagnostics(
		result.map((issue) =>
			enrichDiagnostic({
				source: 'lint' as const,
				code: issue.rule,
				severity: 'error' as const,
				message: issue.message,
				file: rel,
				line: issue.line
			})
		)
	);
	const summary = deriveDiagnosticSummary(diagnostics);
	const text = renderCheckReport({
		kind: 'layout-css',
		targetLine: `target: ${rel}`,
		issues,
		diagnosticSummary: summary,
		summaryLine: result.length === 0 ? 'clean' : `${result.length} layout CSS issue(s)`,
		nextHints: ['ask --scope setup "" -- review project bootstrap and layout CSS guidance']
	});
	return { text, diagnostics, summary };
}

function renderComponent(spec: Spec, absPath: string): CheckResult {
	const code = readFileSync(absPath, 'utf-8');
	const result = checkComponent(code, spec, absPath);
	const rel = displayPath(absPath);
	const issues: CheckIssue[] = result.issues.map((issue) => ({
		file: rel,
		line: issue.line,
		rule: issue.code,
		severity: issue.severity,
		message: issue.message,
		suggestedFix: issue.fix
	}));
	const diagnostics = dedupeDiagnostics(
		result.issues.map((issue) => {
			const fix = issue.fix !== null ? makeFixPair(issue.fix) : undefined;
			return enrichDiagnostic({
				source: 'lint',
				code: issue.code,
				severity: issue.severity as DryUiRepairIssueSeverity,
				message: issue.message,
				file: rel,
				line: issue.line,
				...(fix ? { fix } : {})
			});
		})
	);
	const summary = deriveDiagnosticSummary(diagnostics);

	const text = renderCheckReport({
		kind: 'component',
		targetLine: `target: ${rel}`,
		issues,
		diagnosticSummary: summary,
		summaryLine: result.summary,
		nextHints: [
			'ask --scope component "<Component>" -- inspect the relevant component API before fixing',
			'ask --scope recipe "<pattern>" -- look up a better DryUI pattern if the current markup is off'
		]
	});
	return { text, diagnostics, summary };
}

function renderWorkspace(result: WorkspaceReport): CheckResult {
	const issues: CheckIssue[] = result.findings.map((finding) => ({
		file: finding.file,
		line: finding.line,
		rule: finding.ruleId,
		severity: finding.severity,
		message: finding.message,
		suggestedFix:
			finding.suggestedFixes.length > 0
				? finding.suggestedFixes.map((fix) => fix.description).join(' | ')
				: null
	}));
	const diagnostics = dedupeDiagnostics(
		result.findings.map((finding) => {
			// workspace-audit prefixes component-scoped rules with `component/`
			// so the flat rule list stays disambiguated. Strip it here and route
			// to `lint` so enrichDiagnostic produces the same namespaced code
			// (`lint/dryui/<rule>`) as the single-file path, which is what the
			// HINTS registry keys off.
			let source: DryUiRepairIssueSource;
			let code: string;
			if (finding.ruleId.startsWith('theme/')) {
				source = 'theme';
				code = finding.ruleId;
			} else if (finding.ruleId.startsWith('project/')) {
				source = 'lint';
				code = finding.ruleId;
			} else if (finding.ruleId.startsWith('component/')) {
				source = 'lint';
				code = finding.ruleId.slice('component/'.length);
			} else if (finding.ruleId.startsWith('dryui/')) {
				source = 'lint';
				code = finding.ruleId;
			} else {
				source = 'workspace';
				code = finding.ruleId;
			}
			return enrichDiagnostic({
				source,
				code,
				severity: finding.severity as DryUiRepairIssueSeverity,
				message: finding.message,
				file: finding.file,
				...(finding.line !== null ? { line: finding.line } : {}),
				...(finding.column !== null ? { column: finding.column } : {})
			});
		})
	);

	const summary = deriveDiagnosticSummary(diagnostics);
	const extraBlocks: string[] = [];
	if (result.warnings.length > 0) {
		extraBlocks.push(
			[
				header('warnings', result.warnings.length, ['message']),
				...result.warnings.map((warning) => `  ${cap(warning)}`)
			].join('\n')
		);
	}

	const text = renderCheckReport({
		kind: 'workspace',
		targetLine: `target: ${result.root} | scanned: ${result.scannedFiles} files`,
		issues,
		diagnosticSummary: summary,
		summaryLine: `${result.summary.error} errors, ${result.summary.warning} warnings, ${result.summary.info} info`,
		extraBlocks,
		nextHints: [
			'ask --scope component "<Component>" -- inspect a flagged component before fixing it',
			'ask --scope setup "" -- review project setup and adoption guidance'
		]
	});
	return { text, diagnostics, summary };
}

function resolveCheckTarget(inputPath: string | undefined, cwd?: string): string | null {
	if (!inputPath) return null;
	return resolve(cwd ?? process.cwd(), inputPath);
}

function statOrThrow(absPath: string): Stats {
	try {
		return statSync(absPath);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			throw new StructuredToolError('not-found', `Path not found: ${absPath}`, [
				'check',
				'check <file.svelte>',
				'check <theme.css>'
			]);
		}
		throw error;
	}
}

export function runCheckStructured(
	spec: Spec,
	input: CheckInput,
	options: CheckOptions = {}
): CheckResult {
	const absPath = resolveCheckTarget(input.path, options.cwd);

	if (!absPath) {
		return renderWorkspace(scanWorkspace(spec, options.cwd ? { cwd: options.cwd } : {}));
	}

	const stats = statOrThrow(absPath);

	if (stats.isDirectory()) {
		return renderWorkspace(scanWorkspace(spec, { cwd: absPath }));
	}

	if (absPath.endsWith('.svelte')) {
		return renderComponent(spec, absPath);
	}

	if (absPath.endsWith('.css')) {
		if (isLayoutCssPath(absPath)) {
			return renderLayoutCss(absPath);
		}
		return renderTheme(spec, absPath);
	}

	throw new StructuredToolError(
		'unsupported-path',
		`Unsupported path type: ${displayPath(absPath)}`,
		['check', 'check <file.svelte>', 'check <theme.css>', 'check <directory>']
	);
}

/** CLI-friendly wrapper. Returns just the TOON text. */
export function runCheck(spec: Spec, input: CheckInput, options: CheckOptions = {}): string {
	return runCheckStructured(spec, input, options).text;
}
