import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkStyle, type Violation } from './rules.js';
import { createLintPolicy, type LintPolicy, type LintRuleId } from './lint-policy.js';
import {
	buildLineIndex,
	declarationEntries,
	lookupLine,
	parseCssBlocks,
	splitCssWhitespace,
	splitTopLevel,
	stripCssComments
} from './css-scan.js';

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
}

export interface VitePluginLike {
	readonly name: string;
	readonly enforce?: 'pre' | 'post';
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

const DATA_LAYOUT_ATTR_RE = /\[data-layout(?:\s*[*^$|~]?=\s*(?:"[^"]*"|'[^']*'|[^\]\s]+))?\]/g;
const DATA_LAYOUT_AREA_ATTR_RE =
	/\[data-layout-area(?:\s*[*^$|~]?=\s*(?:"[^"]*"|'[^']*'|[^\]\s]+))?\]/g;

const DISPLAY_VALUES = new Set(['grid', 'inline-grid', 'flex', 'inline-flex', 'contents']);

const GRID_PROPERTIES = new Set([
	'grid',
	'grid-area',
	'grid-auto-columns',
	'grid-auto-flow',
	'grid-auto-rows',
	'grid-column',
	'grid-column-end',
	'grid-column-start',
	'grid-row',
	'grid-row-end',
	'grid-row-start',
	'grid-template',
	'grid-template-areas',
	'grid-template-columns',
	'grid-template-rows'
]);

const FLEX_PROPERTIES = new Set([
	'flex',
	'flex-basis',
	'flex-direction',
	'flex-flow',
	'flex-grow',
	'flex-shrink',
	'flex-wrap',
	'order'
]);

const CONTAINER_PROPERTIES = new Set(['container', 'container-name', 'container-type']);

const BLOCK_SIZE_PROPERTIES = new Set(['block-size', 'min-block-size', 'max-block-size']);

const SPACING_PROPERTIES = new Set([
	'gap',
	'row-gap',
	'column-gap',
	'margin',
	'margin-block',
	'margin-block-start',
	'margin-block-end',
	'margin-inline',
	'margin-inline-start',
	'margin-inline-end',
	'margin-top',
	'margin-right',
	'margin-bottom',
	'margin-left',
	'padding',
	'padding-block',
	'padding-block-start',
	'padding-block-end',
	'padding-inline',
	'padding-inline-start',
	'padding-inline-end',
	'padding-top',
	'padding-right',
	'padding-bottom',
	'padding-left'
]);

const ALIGNMENT_PROPERTIES = new Set([
	'align-content',
	'align-items',
	'align-self',
	'justify-content',
	'justify-items',
	'justify-self',
	'place-content',
	'place-items',
	'place-self'
]);

const ALIGNMENT_KEYWORDS = new Set([
	'normal',
	'stretch',
	'start',
	'end',
	'center',
	'baseline',
	'first baseline',
	'last baseline',
	'self-start',
	'self-end',
	'flex-start',
	'flex-end',
	'left',
	'right',
	'safe start',
	'safe end',
	'safe center',
	'unsafe start',
	'unsafe end',
	'unsafe center'
]);

const CONTENT_ALIGNMENT_KEYWORDS = new Set([
	...ALIGNMENT_KEYWORDS,
	'space-between',
	'space-around',
	'space-evenly'
]);

function isAllowedProperty(property: string): boolean {
	return (
		property === 'display' ||
		GRID_PROPERTIES.has(property) ||
		FLEX_PROPERTIES.has(property) ||
		CONTAINER_PROPERTIES.has(property) ||
		BLOCK_SIZE_PROPERTIES.has(property) ||
		SPACING_PROPERTIES.has(property) ||
		ALIGNMENT_PROPERTIES.has(property)
	);
}

function isDrySpaceToken(value: string): boolean {
	return /^var\(--dry-space-[-_a-zA-Z0-9]+\)$/.test(value);
}

function isSimpleDrySpaceCalc(value: string): boolean {
	if (!/^calc\(.+\)$/.test(value)) return false;
	const inner = value.slice(5, -1).trim();
	if (!inner) return false;
	const sanitized = inner
		.replace(/var\(--dry-space-[-_a-zA-Z0-9]+\)/g, 'TOKEN')
		.replace(/\b0\b/g, 'ZERO')
		.replace(/\s+/g, ' ')
		.trim();
	return /^(?:TOKEN|ZERO)(?:\s*[-+*/]\s*(?:TOKEN|ZERO|\d+(?:\.\d+)?))*$/.test(sanitized);
}

function isAllowedSpacingValue(property: string, value: string): boolean {
	const parts = splitCssWhitespace(value);
	if (parts.length === 0 || parts.length > 4) return false;
	return parts.every((part) => {
		if (part === '0') return true;
		if (property.startsWith('margin') && part === 'auto') return true;
		if (isDrySpaceToken(part)) return true;
		if (isSimpleDrySpaceCalc(part)) return true;
		return false;
	});
}

function allowedAlignmentValues(property: string): ReadonlySet<string> {
	return property.endsWith('-content') || property === 'place-content'
		? CONTENT_ALIGNMENT_KEYWORDS
		: ALIGNMENT_KEYWORDS;
}

function isAllowedAlignmentValue(property: string, value: string): boolean {
	const normalized = value.replace(/\s+/g, ' ').trim();
	if (allowedAlignmentValues(property).has(normalized)) return true;
	const values = property.startsWith('place-')
		? normalized.split(/\s+/).filter(Boolean)
		: [normalized];
	if (values.length === 0 || values.length > 2) return false;
	const allowed = allowedAlignmentValues(property);
	return values.every((part) => allowed.has(part));
}

function isSafeLayoutValue(value: string): boolean {
	const normalized = value.replace(/\s+/g, ' ').trim();
	if (!normalized) return false;
	if (/[{};!]/.test(normalized)) return false;
	if (/\burl\s*\(/i.test(normalized)) return false;
	return /^[a-zA-Z0-9_\-'"().,%/\s+*]+$/.test(normalized);
}

function isAllowedDisplayValue(value: string): boolean {
	return DISPLAY_VALUES.has(value.replace(/\s+/g, ' ').trim());
}

function isAllowedGridTemplateAreasValue(value: string): boolean {
	const normalized = value.replace(/\s+/g, ' ').trim();
	if (normalized === 'none') return true;
	return /^(?:(['"])[._a-zA-Z0-9 -]+\1\s*)+$/.test(normalized);
}

function isAllowedGridValue(property: string, value: string): boolean {
	if (property === 'grid-template-areas') return isAllowedGridTemplateAreasValue(value);
	return isSafeLayoutValue(value);
}

function isCssIdentifier(value: string): boolean {
	return /^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(value);
}

function isAllowedContainerValue(property: string, value: string): boolean {
	const normalized = value.replace(/\s+/g, ' ').trim();
	if (property === 'container-type') return ['normal', 'size', 'inline-size'].includes(normalized);
	if (property === 'container-name') {
		return normalized === 'none' || normalized.split(/\s+/).every(isCssIdentifier);
	}
	return isSafeLayoutValue(normalized);
}

function isAllowedValue(property: string, value: string): boolean {
	if (property === 'display') return isAllowedDisplayValue(value);
	if (GRID_PROPERTIES.has(property)) return isAllowedGridValue(property, value);
	if (FLEX_PROPERTIES.has(property)) return isSafeLayoutValue(value);
	if (CONTAINER_PROPERTIES.has(property)) return isAllowedContainerValue(property, value);
	if (BLOCK_SIZE_PROPERTIES.has(property)) return isSafeLayoutValue(value);
	if (SPACING_PROPERTIES.has(property)) return isAllowedSpacingValue(property, value);
	if (ALIGNMENT_PROPERTIES.has(property)) return isAllowedAlignmentValue(property, value);
	return false;
}

function selectorIsLayoutHook(selector: string): boolean {
	return splitTopLevel(selector, ',').every((part) => {
		const withoutHooks = part
			.replace(DATA_LAYOUT_ATTR_RE, ' ')
			.replace(DATA_LAYOUT_AREA_ATTR_RE, ' ')
			.replace(/>/g, ' ')
			.trim();
		return withoutHooks.length === 0;
	});
}

function scanLayoutCss(
	content: string,
	start: number,
	end: number,
	lineOf: (index: number) => number,
	policy: LintPolicy
): Violation[] {
	const violations: Violation[] = [];
	const addViolation = (
		ruleId: LintRuleId,
		line: number,
		values: Record<string, string | number> = {}
	) => {
		const violation = policy.violation(ruleId, line, values);
		if (violation) violations.push(violation);
	};

	for (const block of parseCssBlocks(content, start, end)) {
		if (block.selector.startsWith('@')) {
			const atRule = block.selector.split(/\s+/)[0] ?? block.selector;
			if (atRule === '@container') {
				violations.push(...scanLayoutCss(content, block.bodyStart, block.bodyEnd, lineOf, policy));
				continue;
			}
			addViolation(
				'dryui/layout-css-at-rule',
				lineOf(block.bodyStart - block.selector.length - 1),
				{
					atRule
				}
			);
			continue;
		}

		if (!selectorIsLayoutHook(block.selector)) {
			addViolation(
				'dryui/layout-css-selector',
				lineOf(block.bodyStart - block.selector.length - 1),
				{ selector: block.selector }
			);
		}

		for (const declaration of declarationEntries(content, block.bodyStart, block.bodyEnd)) {
			if (!isAllowedProperty(declaration.property)) {
				addViolation('dryui/layout-css-property', lineOf(declaration.index), {
					property: declaration.property
				});
				continue;
			}

			if (!isAllowedValue(declaration.property, declaration.value)) {
				addViolation('dryui/layout-css-value', lineOf(declaration.index), {
					property: declaration.property,
					value: declaration.value
				});
			}
		}
	}

	const topLevelStatements = content.slice(start, end).matchAll(/@[^{;]+;/g);
	for (const match of topLevelStatements) {
		const atRule = (match[0].trim().split(/\s+/)[0] ?? match[0]).replace(/;$/, '');
		addViolation('dryui/layout-css-at-rule', lineOf(start + (match.index ?? 0)), { atRule });
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
	const scan = stripCssComments(content);
	const lineStarts = buildLineIndex(content);
	const lineOf = (index: number) => lookupLine(lineStarts, index);
	const policy = createLintPolicy({ target: 'layout-css', filename, source: content });
	const violations = scanLayoutCss(scan, 0, scan.length, lineOf, policy);
	if (options.includeGenericStyleRules ?? true) {
		violations.push(...checkStyle(content, {}, filename));
	}
	return uniqueViolations(violations).sort((left, right) => {
		if (left.line !== right.line) return left.line - right.line;
		if (left.rule !== right.rule) return left.rule.localeCompare(right.rule);
		return left.message.localeCompare(right.message);
	});
}

function formatViolation(filename: string, violation: Violation): string {
	return `[${violation.rule}] ${filename}:${violation.line} - ${violation.message}`;
}

function layoutCssError(filename: string, violations: readonly Violation[]): Error {
	const messages = violations.map((violation) => formatViolation(filename, violation)).join('\n');
	return new Error(`DryUI layout.css violations:\n${messages}`);
}

function normalizePath(path: string): string {
	return path.replace(/\\/g, '/');
}

export function dryuiLayoutCss(options: DryuiLayoutCssPluginOptions = {}): VitePluginLike {
	const relativeFile = options.file ?? DEFAULT_LAYOUT_CSS_FILE;
	let root = options.root ?? process.cwd();
	let logger: { warn(message: string): void } = console;
	let warnedMissing = false;

	const absoluteFile = () => resolve(root, relativeFile);
	const warnMissing = () => {
		if (warnedMissing) return;
		warnedMissing = true;
		logger.warn(`[dryui/layout-css] ${relativeFile} was not found; skipping layout.css lint.`);
	};
	const checkFile = () => {
		const file = absoluteFile();
		if (!existsSync(file)) {
			warnMissing();
			return;
		}
		warnedMissing = false;
		const violations = checkLayoutCss(readFileSync(file, 'utf-8'), relativeFile);
		if (violations.length > 0) throw layoutCssError(relativeFile, violations);
	};

	return {
		name: 'dryui-layout-css',
		enforce: 'pre',
		configResolved(config) {
			root = options.root ?? config.root ?? root;
			logger = config.logger ?? logger;
		},
		configureServer(server) {
			logger = server.config?.logger ?? logger;
			server.watcher?.add(absoluteFile());
		},
		buildStart() {
			checkFile();
		},
		handleHotUpdate(context) {
			const changed = normalizePath(resolve(context.file));
			const target = normalizePath(absoluteFile());
			if (changed !== target) return;
			logger = context.server?.config?.logger ?? logger;
			checkFile();
		}
	};
}
