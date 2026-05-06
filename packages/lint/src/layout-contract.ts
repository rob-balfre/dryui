import {
	buildLineIndex,
	declarationEntries,
	lookupLine,
	parseCssBlocks,
	splitCssWhitespace,
	splitTopLevel,
	stripCssComments
} from './css-scan.js';

export type LayoutContractRule =
	| 'layout-css-at-rule'
	| 'layout-css-selector'
	| 'layout-css-property'
	| 'layout-css-value';

export interface LayoutContractDiagnostic {
	readonly rule: LayoutContractRule;
	readonly line: number;
	readonly values: Record<string, string | number>;
}

export interface LayoutContractFacts {
	readonly selectors: readonly string[];
	readonly atRules: readonly string[];
	readonly declarations: readonly LayoutContractDeclarationFact[];
}

export interface LayoutContractDeclarationFact {
	readonly selector: string;
	readonly property: string;
	readonly value: string;
	readonly line: number;
}

export interface LayoutContractResult {
	readonly facts: LayoutContractFacts;
	readonly diagnostics: readonly LayoutContractDiagnostic[];
}

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

function selectorPartIsLayoutScoped(part: string): boolean {
	const normalized = part.replace(/\s+/g, ' ').trim();
	if (!normalized) return false;
	const layoutMatches = [...normalized.matchAll(DATA_LAYOUT_ATTR_RE)];
	const areaMatches = [...normalized.matchAll(DATA_LAYOUT_AREA_ATTR_RE)];
	if (layoutMatches.length === 0) return false;
	if (areaMatches.length > 0 && areaMatches[0]!.index! < layoutMatches[0]!.index!) return false;

	const withoutHooks = normalized
		.replace(DATA_LAYOUT_ATTR_RE, ' ')
		.replace(DATA_LAYOUT_AREA_ATTR_RE, ' ')
		.replace(/>/g, ' ')
		.trim();
	return withoutHooks.length === 0;
}

function selectorIsLayoutScoped(selector: string): boolean {
	return splitTopLevel(selector, ',').every(selectorPartIsLayoutScoped);
}

function containerAtRuleIsPage(selector: string): boolean {
	return /^@container\s+page(?:\s|\()/.test(selector.replace(/\s+/g, ' ').trim());
}

function scanLayoutCss(
	content: string,
	start: number,
	end: number,
	lineOf: (index: number) => number,
	facts: MutableLayoutContractFacts,
	diagnostics: LayoutContractDiagnostic[]
): void {
	for (const block of parseCssBlocks(content, start, end)) {
		if (block.selector.startsWith('@')) {
			const atRule = block.selector.split(/\s+/)[0] ?? block.selector;
			facts.atRules.push(block.selector);
			if (atRule === '@container' && containerAtRuleIsPage(block.selector)) {
				scanLayoutCss(content, block.bodyStart, block.bodyEnd, lineOf, facts, diagnostics);
				continue;
			}
			diagnostics.push({
				rule: 'layout-css-at-rule',
				line: lineOf(block.bodyStart - block.selector.length - 1),
				values: { atRule: block.selector }
			});
			continue;
		}

		facts.selectors.push(block.selector);
		if (!selectorIsLayoutScoped(block.selector)) {
			diagnostics.push({
				rule: 'layout-css-selector',
				line: lineOf(block.bodyStart - block.selector.length - 1),
				values: { selector: block.selector }
			});
		}

		for (const declaration of declarationEntries(content, block.bodyStart, block.bodyEnd)) {
			const line = lineOf(declaration.index);
			facts.declarations.push({
				selector: block.selector,
				property: declaration.property,
				value: declaration.value,
				line
			});
			if (!isAllowedProperty(declaration.property)) {
				diagnostics.push({
					rule: 'layout-css-property',
					line,
					values: { property: declaration.property }
				});
				continue;
			}

			if (!isAllowedValue(declaration.property, declaration.value)) {
				diagnostics.push({
					rule: 'layout-css-value',
					line,
					values: {
						property: declaration.property,
						value: declaration.value
					}
				});
			}
		}
	}

	const topLevelStatements = content.slice(start, end).matchAll(/@[^{;]+;/g);
	for (const match of topLevelStatements) {
		const atRule = (match[0].trim().split(/\s+/)[0] ?? match[0]).replace(/;$/, '');
		diagnostics.push({
			rule: 'layout-css-at-rule',
			line: lineOf(start + (match.index ?? 0)),
			values: { atRule }
		});
	}
}

interface MutableLayoutContractFacts {
	readonly selectors: string[];
	readonly atRules: string[];
	readonly declarations: LayoutContractDeclarationFact[];
}

export function evaluateLayoutContract(content: string): LayoutContractResult {
	const scan = stripCssComments(content);
	const lineStarts = buildLineIndex(content);
	const lineOf = (index: number) => lookupLine(lineStarts, index);
	const facts: MutableLayoutContractFacts = { selectors: [], atRules: [], declarations: [] };
	const diagnostics: LayoutContractDiagnostic[] = [];
	scanLayoutCss(scan, 0, scan.length, lineOf, facts, diagnostics);
	return { facts, diagnostics };
}
