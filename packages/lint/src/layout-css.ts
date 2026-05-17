import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
	buildLineIndex,
	declarationEntries,
	lookupLine,
	parseCssBlocks,
	splitTopLevel,
	stripCssComments
} from './css-scan.js';
import { checkStyle, type Violation } from './rules.js';
import { createLintPolicy, type LintPolicy, type LintRuleId } from './lint-policy.js';
import { evaluateLayoutContract, type LayoutContractDiagnostic } from './layout-contract.js';
import {
	appendViolationLog,
	formatViolationReport,
	type ViolationLogFile
} from './violation-report.js';

export interface LayoutCssCheckOptions {
	readonly includeGenericStyleRules?: boolean;
}

export interface DryuiLayoutCssPluginOptions {
	/**
	 * Project root. Defaults to Vite's resolved root when available, then cwd.
	 */
	readonly root?: string;
	/**
	 * Canonical layout stylesheet relative to root.
	 */
	readonly file?: string;
	/**
	 * Canonical app stylesheet relative to root. Set to false to skip global
	 * app CSS checks.
	 */
	readonly appFile?: string | false;
	/**
	 * Append violation reports to a log file. Pass true for .dryui/lint.log,
	 * or pass a custom path. Relative paths resolve from the Vite project root.
	 */
	readonly logFile?: ViolationLogFile;
}

export interface VitePluginLike {
	readonly name: string;
	readonly enforce?: 'pre' | 'post';
	config?(): { ssr?: { noExternal?: ReadonlyArray<string> } } | void;
	configResolved?(config: { root?: string; logger?: { warn(message: string): void } }): void;
	configureServer?(server: {
		watcher?: { add(path: string): void };
		config?: { logger?: { warn(message: string): void } };
	}): void;
	buildStart?(): void;
	handleHotUpdate?(context: {
		file: string;
		server?: { config?: { logger?: { warn(message: string): void } } };
	}): void;
}

const DEFAULT_LAYOUT_CSS_FILE = 'src/layout.css';
const DEFAULT_APP_CSS_FILE = 'src/app.css';

const DIAGNOSTIC_RULE_IDS = {
	'layout-css-at-rule': 'dryui/layout-css-at-rule',
	'layout-css-selector': 'dryui/layout-css-selector',
	'layout-css-property': 'dryui/layout-css-property',
	'layout-css-value': 'dryui/layout-css-value'
} as const satisfies Record<LayoutContractDiagnostic['rule'], LintRuleId>;

function diagnosticRuleId(diagnostic: LayoutContractDiagnostic): LintRuleId {
	return DIAGNOSTIC_RULE_IDS[diagnostic.rule];
}

function adaptLayoutContractDiagnostics(
	diagnostics: readonly LayoutContractDiagnostic[],
	policy: LintPolicy
): Violation[] {
	const violations: Violation[] = [];
	for (const diagnostic of diagnostics) {
		const violation = policy.violation(
			diagnosticRuleId(diagnostic),
			diagnostic.line,
			diagnostic.values
		);
		if (violation) violations.push(violation);
	}
	return violations;
}

function uniqueViolations(violations: Violation[]): Violation[] {
	const seen = new Set<string>();
	return violations.filter((violation) => {
		const key = `${violation.rule}:${violation.line}:${violation.message}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

export function checkLayoutCss(
	content: string,
	filename = DEFAULT_LAYOUT_CSS_FILE,
	options: LayoutCssCheckOptions = {}
): Violation[] {
	const policy = createLintPolicy({ target: 'layout-css', filename, source: content });
	const contract = evaluateLayoutContract(content);
	const violations = adaptLayoutContractDiagnostics(contract.diagnostics, policy);
	if (options.includeGenericStyleRules ?? true) {
		violations.push(...checkStyle(content, {}, filename));
	}
	return uniqueViolations(violations).sort((left, right) => {
		if (left.line !== right.line) return left.line - right.line;
		if (left.rule !== right.rule) return left.rule.localeCompare(right.rule);
		return left.message.localeCompare(right.message);
	});
}

function selectorTargetsBody(selector: string): boolean {
	return splitTopLevel(selector, ',').some((part) =>
		/(^|[\s>+~])body(?=$|[.#:[\s>+~])/.test(part.trim())
	);
}

function isUnconditionalAtRule(selector: string): boolean {
	return /^@layer\b/i.test(selector.trim());
}

export function checkAppCss(content: string, filename = DEFAULT_APP_CSS_FILE): Violation[] {
	const stripped = stripCssComments(content);
	const lineStarts = buildLineIndex(stripped);
	const policy = createLintPolicy({ target: 'style', filename, source: content });
	let firstBodyLine = 1;
	let sawBodySelector = false;
	let hasBodyFontFamily = false;

	const scanBlocks = (start: number, end: number): void => {
		for (const block of parseCssBlocks(stripped, start, end)) {
			if (isUnconditionalAtRule(block.selector)) {
				scanBlocks(block.bodyStart, block.bodyEnd);
				continue;
			}

			if (!selectorTargetsBody(block.selector)) continue;
			const selectorIndex = stripped.lastIndexOf(block.selector, block.bodyStart);
			const line = lookupLine(lineStarts, selectorIndex >= 0 ? selectorIndex : block.bodyStart);
			if (!sawBodySelector) firstBodyLine = line;
			sawBodySelector = true;
			if (
				declarationEntries(stripped, block.bodyStart, block.bodyEnd).some(
					(declaration) => declaration.property === 'font-family' && declaration.value.length > 0
				)
			) {
				hasBodyFontFamily = true;
			}
		}
	};

	scanBlocks(0, stripped.length);
	if (hasBodyFontFamily) return [];

	const violation = policy.violation('dryui/require-body-font-family', firstBodyLine);
	return violation ? [violation] : [];
}

function layoutCssError(
	filename: string,
	source: string,
	violations: readonly Violation[],
	logFile: ViolationLogFile,
	root: string
): Error {
	const messages = formatViolationReport(filename, violations, source);
	const report = `DryUI layout.css violations:\n${messages}`;
	appendViolationLog(logFile, report, { root, label: 'layout-css' });
	return new Error(report);
}

function appCssError(
	filename: string,
	source: string,
	violations: readonly Violation[],
	logFile: ViolationLogFile,
	root: string
): Error {
	const messages = formatViolationReport(filename, violations, source);
	const report = `DryUI app.css violations:\n${messages}`;
	appendViolationLog(logFile, report, { root, label: 'app-css' });
	return new Error(report);
}

function normalizePath(path: string): string {
	return path.replace(/\\/g, '/');
}

export function dryuiLayoutCss(options: DryuiLayoutCssPluginOptions = {}): VitePluginLike {
	const relativeFile = options.file ?? DEFAULT_LAYOUT_CSS_FILE;
	const relativeAppFile =
		options.appFile === false ? null : (options.appFile ?? DEFAULT_APP_CSS_FILE);
	const logFile = options.logFile;
	let root = options.root ?? process.cwd();
	let logger: { warn(message: string): void } = console;
	let warnedMissing = false;

	const absoluteFile = () => resolve(root, relativeFile);
	const absoluteAppFile = () => (relativeAppFile ? resolve(root, relativeAppFile) : null);
	const warnMissing = () => {
		if (warnedMissing) return;
		warnedMissing = true;
		logger.warn(`[dryui/layout-css] ${relativeFile} was not found; skipping layout.css lint.`);
	};
	const checkLayoutFile = () => {
		const file = absoluteFile();
		if (!existsSync(file)) {
			warnMissing();
			return;
		}
		warnedMissing = false;
		const source = readFileSync(file, 'utf-8');
		const violations = checkLayoutCss(source, relativeFile);
		if (violations.length > 0)
			throw layoutCssError(relativeFile, source, violations, logFile, root);
	};
	const checkAppFile = () => {
		if (!relativeAppFile) return;
		const file = absoluteAppFile();
		if (!file || !existsSync(file)) return;
		const source = readFileSync(file, 'utf-8');
		const violations = checkAppCss(source, relativeAppFile);
		if (violations.length > 0)
			throw appCssError(relativeAppFile, source, violations, logFile, root);
	};
	const checkFiles = () => {
		checkLayoutFile();
		checkAppFile();
	};

	return {
		name: 'dryui-layout-css',
		enforce: 'pre',
		// lucide-svelte 1.0.x ships a dist entry that imports './icons/index' without
		// a .js extension. Node's strict ESM resolution rejects it, so vite SSR
		// crashes the moment a consumer (e.g. @dryui/feedback) loads it. vite-plugin-svelte
		// used to auto-noExternal svelte-field packages but stopped covering this case
		// in 7.1.x; force it through vite's bundler instead.
		config() {
			return { ssr: { noExternal: ['lucide-svelte'] } };
		},
		configResolved(config) {
			root = options.root ?? config.root ?? root;
			logger = config.logger ?? logger;
		},
		configureServer(server) {
			logger = server.config?.logger ?? logger;
			server.watcher?.add(absoluteFile());
			const appFile = absoluteAppFile();
			if (appFile) server.watcher?.add(appFile);
		},
		buildStart() {
			checkFiles();
		},
		handleHotUpdate(context) {
			const changed = normalizePath(resolve(context.file));
			const target = normalizePath(absoluteFile());
			const appTarget = absoluteAppFile();
			if (changed !== target && (!appTarget || changed !== normalizePath(appTarget))) return;
			logger = context.server?.config?.logger ?? logger;
			if (changed === target) checkLayoutFile();
			if (appTarget && changed === normalizePath(appTarget)) checkAppFile();
		}
	};
}
