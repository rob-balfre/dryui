import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { checkThemeImportOrder, fixThemeImportOrder } from '@dryui/lint/rules';
import { ruleSuggestedFix } from '@dryui/lint/rule-catalog';
import {
	detectProject,
	type ProjectDetection,
	type ProjectPlannerSpec
} from './project-planner.js';
import { checkComponent } from './component-checker.js';
import { diagnoseTheme } from './theme-checker.js';

export type WorkspaceSeverity = 'error' | 'warning' | 'info';

export interface WorkspaceFix {
	readonly description: string;
	readonly replacement?: string;
}

export interface WorkspaceFinding {
	readonly file: string;
	readonly line: number | null;
	readonly column: number | null;
	readonly ruleId: string;
	readonly severity: WorkspaceSeverity;
	readonly fixable: boolean;
	readonly message: string;
	readonly suggestedFixes: readonly WorkspaceFix[];
}

export interface WorkspaceReport {
	readonly root: string;
	readonly projects: readonly ProjectDetection[];
	readonly scope: {
		readonly include: readonly string[];
		readonly exclude: readonly string[];
		readonly changed: boolean;
	};
	readonly scannedFiles: number;
	readonly skippedFiles: number;
	readonly findings: readonly WorkspaceFinding[];
	readonly warnings: readonly string[];
	readonly summary: {
		readonly error: number;
		readonly warning: number;
		readonly info: number;
		readonly byRule: Readonly<Record<string, number>>;
	};
}

export interface WorkspaceAuditOptions {
	readonly cwd?: string;
	readonly include?: readonly string[];
	readonly exclude?: readonly string[];
	readonly changed?: boolean;
	readonly maxSeverity?: WorkspaceSeverity;
	/**
	 * Optional lint-category filter. Restricts the component-level scan to the
	 * named categories (e.g. `new Set(['polish'])` for a polish-only pass).
	 * Theme and project-level findings always run; only the per-file component
	 * lint respects the filter.
	 */
	readonly categoryFilter?: ReadonlySet<'correctness' | 'a11y' | 'polish'>;
}

export interface WorkspaceAuditSpec extends Pick<ProjectPlannerSpec, 'themeImports'> {
	readonly components: Record<
		string,
		{
			readonly compound?: boolean;
			readonly props?: Record<string, unknown>;
			readonly parts?: Record<string, { readonly props: Record<string, unknown> }>;
			readonly cssVars?: Record<string, string>;
		}
	>;
}

const DEFAULT_INCLUDE = [
	'packages/ui',
	'packages/primitives',
	'apps/docs',
	'apps/playground'
] as const;
const DEFAULT_EXCLUDED_SEGMENTS = new Set([
	'.git',
	'.svelte-kit',
	'__fixtures__',
	'build',
	'coverage',
	'dist',
	'fixtures',
	'node_modules',
	'reports',
	'test',
	'tests'
]);
const DEFAULT_EXCLUDED_PATHS = new Set<string>();
const MAX_SEVERITY: Record<WorkspaceSeverity, number> = { info: 0, warning: 1, error: 2 };
const DRYUI_THEME_DIRECTIVE_RE = /\/\*\s*@dryui-theme\s*\*\//;

function normalizePath(path: string): string {
	return path.replaceAll('\\', '/').replace(/^\.\/+/, '');
}

function resolveRoot(inputPath?: string): string {
	const candidate = resolve(inputPath ?? process.cwd());
	if (existsSync(candidate) && statSync(candidate).isFile()) {
		return dirname(candidate);
	}
	return candidate;
}

function hasGlob(pattern: string): boolean {
	return /[*?[{]/.test(pattern);
}

function matchesPattern(path: string, pattern: string): boolean {
	const normalizedPath = normalizePath(path);
	const normalizedPattern = normalizePath(pattern).replace(/\/+$/, '');
	if (!normalizedPattern || normalizedPattern === '.') return true;
	if (!hasGlob(normalizedPattern)) {
		return (
			normalizedPath === normalizedPattern || normalizedPath.startsWith(`${normalizedPattern}/`)
		);
	}

	const escaped = normalizedPattern
		.replace(/[.+^${}()|[\]\\]/g, '\\$&')
		.replace(/\*\*\//g, '(?:.*/)?')
		.replace(/\*\*/g, '.*')
		.replace(/\*/g, '[^/]*')
		.replace(/\?/g, '[^/]');
	return new RegExp(`^${escaped}$`).test(normalizedPath);
}

function collectFiles(root: string, current = root): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(current, { withFileTypes: true })) {
		const absPath = resolve(current, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === 'node_modules' || entry.name === '.git') continue;
			files.push(...collectFiles(root, absPath));
			continue;
		}
		if (!entry.isFile()) continue;
		files.push(normalizePath(relative(root, absPath)));
	}
	return files;
}

function collectChangedFiles(root: string): Set<string> {
	try {
		execFileSync('git', ['-C', root, 'rev-parse', '--verify', 'HEAD'], { stdio: 'ignore' });
		const canonicalRoot = realpathSync.native(root);
		const repoRoot = realpathSync.native(
			execFileSync('git', ['-C', root, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
		);
		const files = new Set<string>();
		const outputs = [
			execFileSync('git', ['-C', repoRoot, 'diff', '--name-only', 'HEAD', '--'], {
				encoding: 'utf8'
			}),
			execFileSync('git', ['-C', repoRoot, 'diff', '--name-only', '--cached', 'HEAD', '--'], {
				encoding: 'utf8'
			}),
			execFileSync('git', ['-C', repoRoot, 'ls-files', '--others', '--exclude-standard'], {
				encoding: 'utf8'
			})
		];

		for (const output of outputs) {
			for (const line of output.split('\n')) {
				const changedPath = line.trim();
				if (!changedPath) continue;
				const absPath = resolve(repoRoot, changedPath);
				const relativePath = normalizePath(relative(canonicalRoot, absPath));
				if (relativePath.startsWith('..')) continue;
				files.add(relativePath);
			}
		}
		return files;
	} catch {
		throw new Error('The --changed option requires a Git repository with an existing HEAD commit.');
	}
}

function defaultInclude(root: string): string[] {
	const included = DEFAULT_INCLUDE.filter((entry) => existsSync(resolve(root, entry)));
	return included.length > 0 ? included : ['.'];
}

function isDefaultExcluded(path: string): boolean {
	const normalized = normalizePath(path);
	if (normalized.endsWith('.d.ts') || normalized.endsWith('.svelte.d.ts')) return true;
	if (DEFAULT_EXCLUDED_PATHS.has(normalized)) return true;

	const segments = normalized.split('/');
	return segments.some((segment) => DEFAULT_EXCLUDED_SEGMENTS.has(segment));
}

function shouldScanFile(
	path: string,
	include: readonly string[],
	exclude: readonly string[],
	changedFiles: Set<string> | null,
	explicitInclude: boolean
): boolean {
	const normalized = normalizePath(path);
	const included =
		include.length > 0
			? include.some((pattern) => matchesPattern(normalized, pattern))
			: DEFAULT_INCLUDE.some((pattern) => matchesPattern(normalized, pattern));
	if (!included) return false;
	if (!explicitInclude && isDefaultExcluded(normalized)) return false;
	if (exclude.some((pattern) => matchesPattern(normalized, pattern))) return false;
	if (changedFiles && !matchesChangedFile(normalized, changedFiles)) return false;
	return true;
}

function matchesChangedFile(path: string, changedFiles: Set<string>): boolean {
	const normalized = normalizePath(path);
	for (const changed of changedFiles) {
		if (changed === normalized) return true;
		if (changed.endsWith(`/${normalized}`)) return true;
		if (normalized.endsWith(`/${changed}`)) return true;
	}
	return false;
}

function isThemeCssFilename(path: string): boolean {
	return /\.theme\.css$/i.test(normalizePath(path));
}

function hasDryThemeDirective(content: string): boolean {
	return DRYUI_THEME_DIRECTIVE_RE.test(content.slice(0, 2000));
}

function shouldAnalyzeCssThemeFile(
	path: string,
	content: string,
	projectCssFiles: ReadonlySet<string>
): boolean {
	const normalized = normalizePath(path);
	return (
		content.includes('--dry-') ||
		isThemeCssFilename(normalized) ||
		hasDryThemeDirective(content) ||
		projectCssFiles.has(normalized)
	);
}

function severityAtOrAbove(
	severity: WorkspaceSeverity,
	maxSeverity: WorkspaceSeverity | undefined
): boolean {
	if (!maxSeverity) return true;
	return MAX_SEVERITY[severity] >= MAX_SEVERITY[maxSeverity];
}

function compareFindings(left: WorkspaceFinding, right: WorkspaceFinding): number {
	const severityDelta = MAX_SEVERITY[right.severity] - MAX_SEVERITY[left.severity];
	if (severityDelta !== 0) return severityDelta;
	const fileDelta = left.file.localeCompare(right.file);
	if (fileDelta !== 0) return fileDelta;
	const lineDelta =
		(left.line ?? Number.MAX_SAFE_INTEGER) - (right.line ?? Number.MAX_SAFE_INTEGER);
	if (lineDelta !== 0) return lineDelta;
	return left.ruleId.localeCompare(right.ruleId);
}

function toFinding(
	file: string,
	line: number | null,
	ruleId: string,
	severity: WorkspaceSeverity,
	message: string,
	fix: string | null
): WorkspaceFinding {
	return {
		file,
		line,
		column: null,
		ruleId,
		severity,
		fixable: fix !== null,
		message,
		suggestedFixes: fix ? [{ description: 'Apply suggested fix', replacement: fix }] : []
	};
}

function projectFindings(
	root: string,
	packageJsonPath: string,
	spec: WorkspaceAuditSpec
): { findings: WorkspaceFinding[]; project: ProjectDetection; warnings: string[] } {
	const result = detectProject(spec, packageJsonPath);
	const findings: WorkspaceFinding[] = [];
	const warnings = [...result.warnings];
	const packageFile = normalizePath(relative(root, packageJsonPath));

	if (result.framework === 'unknown') {
		return { findings, project: result, warnings };
	}

	if (!result.dependencies.ui) {
		findings.push(
			toFinding(
				packageFile,
				null,
				'project/missing-ui-dependency',
				'error',
				'Install @dryui/ui before using DryUI components.',
				'bun add @dryui/ui'
			)
		);
	}

	if (!result.theme.defaultImported || !result.theme.darkImported) {
		const targetPath =
			result.files.appCss ?? result.files.rootLayout ?? result.files.appHtml ?? packageJsonPath;
		findings.push(
			toFinding(
				normalizePath(relative(root, targetPath)),
				null,
				'project/missing-theme-import',
				'error',
				'Add both DryUI theme imports to the app shell.',
				`import '${spec.themeImports.default}';\nimport '${spec.themeImports.dark}';`
			)
		);
	}

	if (!result.theme.themeAuto) {
		const targetPath = result.files.appHtml ?? packageJsonPath;
		findings.push(
			toFinding(
				normalizePath(relative(root, targetPath)),
				null,
				'project/missing-theme-auto',
				'error',
				'Set the root html element to theme-auto mode.',
				'<html class="theme-auto">'
			)
		);
	}

	return { findings, project: result, warnings };
}

function reviewFindings(
	root: string,
	filePath: string,
	content: string,
	spec: WorkspaceAuditSpec,
	categoryFilter: WorkspaceAuditOptions['categoryFilter']
): WorkspaceFinding[] {
	const result = checkComponent(
		content,
		spec as Parameters<typeof checkComponent>[1],
		normalizePath(relative(root, filePath)),
		{ ...(categoryFilter ? { categoryFilter } : {}) }
	);
	return result.issues.map((issue) =>
		toFinding(
			normalizePath(relative(root, filePath)),
			issue.line,
			// Rules scoped to the project (e.g. `project/theme-import-order`) cross
			// file boundaries and must keep that prefix. Everything else is a
			// component-level finding and is scoped under `component/`.
			issue.code.startsWith('project/') ? issue.code : `component/${issue.code}`,
			issue.severity === 'suggestion' ? 'info' : issue.severity,
			issue.message,
			issue.fix
		)
	);
}

function themeFindings(
	root: string,
	filePath: string,
	content: string,
	spec: WorkspaceAuditSpec
): WorkspaceFinding[] {
	const result = diagnoseTheme(content, spec as Parameters<typeof diagnoseTheme>[1], filePath);
	return result.issues.map((issue) =>
		toFinding(
			normalizePath(relative(root, filePath)),
			null,
			`theme/${issue.code}`,
			issue.severity,
			issue.message,
			issue.fix
		)
	);
}

/**
 * Scan a .ts/.js/.mjs/.cjs file for theme-import-order violations. This catches
 * the common SvelteKit root-layout bug where `../app.css` is imported before
 * `@dryui/ui/themes/default.css`, silently clobbering token overrides.
 */
function moduleImportFindings(root: string, filePath: string, content: string): WorkspaceFinding[] {
	const violations = checkThemeImportOrder(content);
	if (violations.length === 0) return [];
	const rel = normalizePath(relative(root, filePath));
	const fixedContent = fixThemeImportOrder(content);
	return violations.map((v) => ({
		file: rel,
		line: v.line,
		column: null,
		ruleId: 'project/theme-import-order',
		severity: 'error' as const,
		fixable: fixedContent !== content,
		message: v.message,
		suggestedFixes:
			fixedContent !== content
				? [
						{
							description:
								ruleSuggestedFix('theme-import-order') ??
								'Reorder imports: theme CSS before local CSS.',
							replacement: fixedContent
						}
					]
				: []
	}));
}

type WorkspaceSummary = {
	error: number;
	warning: number;
	info: number;
	byRule: Record<string, number>;
};

export function scanWorkspace(
	spec: WorkspaceAuditSpec,
	options: WorkspaceAuditOptions = {}
): WorkspaceReport {
	const root = resolveRoot(options.cwd);
	const explicitInclude = Boolean(options.include?.length);
	const include = explicitInclude ? [...(options.include ?? [])] : defaultInclude(root);
	const exclude = options.exclude ? [...options.exclude] : [];
	const files = collectFiles(root);
	const changed = options.changed ?? false;
	const changedFiles = changed ? collectChangedFiles(root) : null;
	const findings: WorkspaceFinding[] = [];
	const projects: ProjectDetection[] = [];
	const warnings: string[] = [];

	if (
		!options.include?.length &&
		include.every((entry) => DEFAULT_INCLUDE.includes(entry as (typeof DEFAULT_INCLUDE)[number]))
	) {
		warnings.push(
			'Using the default DryUI workspace scan scope and excluding experimental packages.'
		);
	}
	if (changed) {
		warnings.push(
			'Scanning only modified, staged, and untracked files relative to the current HEAD.'
		);
	}

	const scanFiles = files.filter((file) =>
		shouldScanFile(file, include, exclude, changedFiles, explicitInclude)
	);
	const scannedFiles = scanFiles.length;
	const skippedFiles = files.length - scannedFiles;
	const projectCssFiles = new Set<string>();

	for (const file of files) {
		if (!file.endsWith('package.json')) continue;
		try {
			const absPath = resolve(root, file);
			const parsed = JSON.parse(readFileSync(absPath, 'utf8')) as {
				dependencies?: Record<string, string>;
				devDependencies?: Record<string, string>;
			};
			const dependencyNames = new Set([
				...Object.keys(parsed.dependencies ?? {}),
				...Object.keys(parsed.devDependencies ?? {})
			]);
			if (!dependencyNames.has('svelte') && !dependencyNames.has('@sveltejs/kit')) continue;
			const project = detectProject(spec, absPath);
			if (project.dependencies.ui && project.files.appCss) {
				projectCssFiles.add(normalizePath(relative(root, project.files.appCss)));
			}
		} catch {
			// The main scan loop reports invalid package JSON. This pre-pass only
			// gathers project CSS context for theme-file routing.
		}
	}

	for (const file of scanFiles) {
		const absPath = resolve(root, file);
		const content = readFileSync(absPath, 'utf8');

		if (file.endsWith('package.json')) {
			try {
				const parsed = JSON.parse(content) as {
					dependencies?: Record<string, string>;
					devDependencies?: Record<string, string>;
				};
				const dependencyNames = new Set([
					...Object.keys(parsed.dependencies ?? {}),
					...Object.keys(parsed.devDependencies ?? {})
				]);
				if (dependencyNames.has('svelte') || dependencyNames.has('@sveltejs/kit')) {
					const project = projectFindings(root, absPath, spec);
					projects.push(project.project);
					findings.push(...project.findings);
					warnings.push(...project.warnings);
				}
			} catch {
				findings.push(
					toFinding(
						file,
						null,
						'workspace/invalid-package-json',
						'warning',
						'Package metadata could not be parsed.',
						null
					)
				);
			}
			continue;
		}

		if (file.endsWith('.svelte')) {
			findings.push(...reviewFindings(root, absPath, content, spec, options.categoryFilter));
			continue;
		}

		if (file.endsWith('.css') && shouldAnalyzeCssThemeFile(file, content, projectCssFiles)) {
			findings.push(...themeFindings(root, absPath, content, spec));
			continue;
		}

		if (/\.(ts|js|mjs|cjs)$/.test(file)) {
			findings.push(...moduleImportFindings(root, absPath, content));
		}
	}

	const filteredFindings = findings
		.filter((finding) => severityAtOrAbove(finding.severity, options.maxSeverity))
		.sort(compareFindings);
	const summary: WorkspaceSummary = filteredFindings.reduce<WorkspaceSummary>(
		(acc, finding) => {
			acc[finding.severity] += 1;
			acc.byRule[finding.ruleId] = (acc.byRule[finding.ruleId] ?? 0) + 1;
			return acc;
		},
		{ error: 0, warning: 0, info: 0, byRule: {} }
	);

	return {
		root,
		projects,
		scope: {
			include,
			exclude,
			changed
		},
		scannedFiles,
		skippedFiles,
		findings: filteredFindings,
		warnings,
		summary
	};
}
