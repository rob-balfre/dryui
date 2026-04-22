import { readFileSync, statSync, type Stats } from 'node:fs';
import { relative, resolve } from 'node:path';
import { checkComponent } from '../component-checker.js';
import { diagnoseTheme } from '../theme-checker.js';
import { scanWorkspace, type WorkspaceReport } from '../workspace-audit.js';
import { FIELD_CAP, formatHelp, header, row, truncateField } from '../toon.js';
import type { Spec } from '../spec-types.js';
import { enrichDiagnostic } from '../enrich-diagnostics.js';
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

interface IssueAggregates {
	readonly counts: Record<CheckSeverity, number>;
	readonly hasBlockers: boolean;
	readonly autoFixable: number;
}

interface CheckInput {
	readonly path?: string;
}

interface CheckOptions {
	readonly cwd?: string;
}

export interface CheckResult {
	readonly text: string;
	readonly diagnostics: readonly DryUiRepairIssue[];
}

function cap(value: string, max = FIELD_CAP): string {
	return truncateField(value, max)[0];
}

function displayPath(absPath: string): string {
	const rel = relative(process.cwd(), absPath);
	return rel && !rel.startsWith('..') ? rel : absPath;
}

function deriveAggregates(issues: readonly CheckIssue[]): IssueAggregates {
	const counts: Record<CheckSeverity, number> = { error: 0, warning: 0, suggestion: 0, info: 0 };
	let autoFixable = 0;
	let hasBlockers = false;
	for (const issue of issues) {
		counts[issue.severity] += 1;
		if (issue.suggestedFix !== null) autoFixable += 1;
		if (issue.severity === 'error') hasBlockers = true;
	}
	return { counts, hasBlockers, autoFixable };
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
	readonly summary: string;
	readonly nextHints: readonly string[];
	readonly extraBlocks?: readonly string[];
}

function renderCheckReport(opts: CheckReportOptions): string {
	const { counts, hasBlockers, autoFixable } = deriveAggregates(opts.issues);
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

	lines.push('', `summary: ${opts.summary}`, '', formatHelp([...opts.nextHints]));
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
	const result = diagnoseTheme(css, spec, absPath);
	const rel = displayPath(absPath);
	const issues: CheckIssue[] = result.issues.map((issue) => ({
		file: rel,
		line: null,
		rule: issue.code,
		severity: issue.severity,
		message: issue.message,
		suggestedFix: issue.fix
	}));
	const diagnostics = dedupeDiagnostics(
		result.issues.map((issue) =>
			enrichDiagnostic({
				source: 'theme' as const,
				code: issue.code,
				severity: issue.severity as DryUiRepairIssueSeverity,
				message: issue.message,
				file: rel
			})
		)
	);

	const missingCount = result.issues.filter((issue) => issue.code === 'missing-token').length;
	const totalRequired = result.variables.required + missingCount;
	const coverage =
		totalRequired > 0 ? Math.round((result.variables.required / totalRequired) * 100) : 100;

	const text = renderCheckReport({
		kind: 'theme',
		targetLine: `target: ${rel} | coverage: ${coverage}%`,
		issues,
		summary: result.summary,
		nextHints: [
			'ask --scope list "" -- browse available components and tokens',
			'ask --scope setup "" -- review project bootstrap and theme guidance'
		]
	});
	return { text, diagnostics };
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

	const text = renderCheckReport({
		kind: 'component',
		targetLine: `target: ${rel}`,
		issues,
		summary: result.summary,
		nextHints: [
			'ask --scope component "<Component>" -- inspect the relevant component API before fixing',
			'ask --scope recipe "<pattern>" -- look up a better DryUI pattern if the current markup is off'
		]
	});
	return { text, diagnostics };
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
			const source: DryUiRepairIssueSource = finding.ruleId.startsWith('theme/')
				? 'theme'
				: finding.ruleId.startsWith('project/')
					? 'lint'
					: 'workspace';
			return enrichDiagnostic({
				source,
				code: finding.ruleId,
				severity: finding.severity as DryUiRepairIssueSeverity,
				message: finding.message,
				file: finding.file,
				...(finding.line !== null ? { line: finding.line } : {}),
				...(finding.column !== null ? { column: finding.column } : {})
			});
		})
	);

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
		summary: `${result.summary.error} errors, ${result.summary.warning} warnings, ${result.summary.info} info`,
		extraBlocks,
		nextHints: [
			'ask --scope component "<Component>" -- inspect a flagged component before fixing it',
			'ask --scope setup "" -- review project setup and adoption guidance'
		]
	});
	return { text, diagnostics };
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
