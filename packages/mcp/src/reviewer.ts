// DryUI Component Code Review Engine
// Pure string/regex parsing — no Svelte compiler required.

import { ruleMessage, ruleSuggestedFix } from '@dryui/lint/rule-catalog';
import { buildLineOffsets, escapeRegExp, lineAtOffset } from './utils.js';

export interface Issue {
	readonly severity: 'error' | 'warning' | 'suggestion';
	readonly code: string;
	readonly line: number;
	readonly message: string;
	readonly fix: string | null;
}

export interface ReviewResult {
	readonly issues: Issue[];
	readonly summary: string;
	readonly filename?: string;
}

export interface PropDef {
	readonly type: string;
	readonly required?: boolean;
}

export interface ComponentDef {
	readonly compound: boolean;
	readonly props?: Record<string, PropDef>;
	readonly parts?: Record<string, { readonly props: Record<string, PropDef> }>;
	readonly cssVars: Record<string, string>;
}

interface TagInfo {
	readonly name: string;
	readonly line: number;
	readonly props: string[];
	readonly hasSpread: boolean;
	readonly selfClosing: boolean;
}

interface ReviewContext {
	readonly code: string;
	readonly template: string;
	readonly lineOffsets: number[];
}

function stripScriptAndStyle(code: string): string {
	return code
		.replace(/<script[^>]*>[\s\S]*?<\/script>/g, (m) => '\n'.repeat(countNewlines(m)))
		.replace(/<style[^>]*>[\s\S]*?<\/style>/g, (m) => '\n'.repeat(countNewlines(m)));
}

function extractImports(code: string): Set<string> {
	const imports = new Set<string>();
	const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/);
	if (!scriptMatch) return imports;

	const scriptContent = scriptMatch[1] ?? '';
	const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]@dryui\/(ui|primitives)['"]/g;
	let match: RegExpExecArray | null;

	while ((match = importRegex.exec(scriptContent)) !== null) {
		const raw = match[1] ?? '';
		const names = raw.split(',');
		for (const name of names) {
			const trimmed = name.trim();
			if (trimmed) imports.add(trimmed);
		}
	}

	return imports;
}

function extractTags(ctx: ReviewContext): TagInfo[] {
	const { template, lineOffsets } = ctx;
	const tagRegex = /<([A-Z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)*)\s*([^>]*?)(\/)?>/g;
	const tags: TagInfo[] = [];
	let match: RegExpExecArray | null;

	while ((match = tagRegex.exec(template)) !== null) {
		const name = match[1] ?? '';
		const attrsStr = match[2] ?? '';
		const selfClosing = match[3] === '/';
		const line = lineAtOffset(lineOffsets, match.index);
		const props = extractPropsFromAttrs(attrsStr);
		const hasSpread = /\{\.\.\./.test(attrsStr);

		tags.push({ name, line, props, hasSpread, selfClosing });
	}

	return tags;
}

function extractStyles(code: string): string | null {
	const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/);
	return styleMatch ? (styleMatch[1] ?? null) : null;
}

// Extraction helpers

function countNewlines(str: string): number {
	let count = 0;
	for (let i = 0; i < str.length; i++) {
		if (str[i] === '\n') count++;
	}
	return count;
}

function stripBraceExpressions(str: string): string {
	let result = '';
	let depth = 0;
	for (let i = 0; i < str.length; i++) {
		if (str[i] === '{') {
			if (depth === 0) result += '{}';
			depth++;
		} else if (str[i] === '}') {
			depth--;
		} else if (depth === 0) {
			result += str[i];
		}
	}
	return result;
}

function extractPropsFromAttrs(attrsStr: string): string[] {
	const props: string[] = [];
	if (!attrsStr.trim()) return props;

	// Strip quoted strings and brace expressions to avoid matching values as prop names.
	// Replace "..." and '...' with placeholders first, then strip balanced brace expressions.
	const stripped = stripBraceExpressions(
		attrsStr.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''")
	);

	// bind:propName
	const bindRegex = /\bbind:([a-zA-Z_][a-zA-Z0-9_]*)/g;
	let m: RegExpExecArray | null;
	while ((m = bindRegex.exec(stripped)) !== null) {
		const bound = m[1];
		if (bound) props.push('bind:' + bound);
	}

	// propName={ or propName="
	const namedRegex = /\b([a-zA-Z_][a-zA-Z0-9_-]*)\s*=/g;
	while ((m = namedRegex.exec(stripped)) !== null) {
		const propName = m[1];
		if (propName && !props.includes(propName)) {
			props.push(propName);
		}
	}

	// Boolean props: bare identifiers not followed by =
	const boolRegex = /(?<!\.)(?<![:{])\b([a-zA-Z_][a-zA-Z0-9_-]*)\b(?!\s*=)/g;
	while ((m = boolRegex.exec(stripped)) !== null) {
		const propName = m[1];
		if (!propName) continue;
		if (props.includes(propName) || props.includes('bind:' + propName) || propName === 'bind') {
			continue;
		}
		props.push(propName);
	}

	return props;
}

const NATIVE_HTML_ATTRS: ReadonlySet<string> = new Set([
	// Global attributes
	'id',
	'class',
	'style',
	'title',
	'lang',
	'dir',
	'tabindex',
	'hidden',
	'role',
	'slot',
	'is',
	'part',
	'translate',
	'draggable',
	'contenteditable',
	'spellcheck',
	'autocapitalize',
	'inputmode',
	'enterkeyhint',
	// children (Svelte snippet)
	'children',
	// Form-related
	'name',
	'value',
	'type',
	'placeholder',
	'required',
	'readonly',
	'disabled',
	'checked',
	'selected',
	'multiple',
	'autofocus',
	'autocomplete',
	'pattern',
	'min',
	'max',
	'step',
	'minlength',
	'maxlength',
	'form',
	'formaction',
	'formmethod',
	'formtarget',
	'formnovalidate',
	'accept',
	'capture',
	'list',
	'size',
	// Links/media
	'href',
	'target',
	'rel',
	'download',
	'src',
	'alt',
	'width',
	'height',
	'loading',
	'decoding',
	'crossorigin',
	'referrerpolicy',
	// Accessibility
	'for',
	'htmlFor'
]);

function isPropAllowed(propName: string): boolean {
	if (NATIVE_HTML_ATTRS.has(propName)) return true;
	if (propName.startsWith('aria-')) return true;
	if (propName.startsWith('data-')) return true;
	if (propName.startsWith('on')) return true;
	if (propName.startsWith('bind:')) return true;
	return false;
}

function checkBareCompound(
	tags: TagInfo[],
	spec: { components: Record<string, ComponentDef> }
): Issue[] {
	const issues: Issue[] = [];
	for (const tag of tags) {
		if (tag.name.includes('.')) continue;
		const def = spec.components[tag.name];
		if (!def?.compound) continue;

		const partNames = Object.keys(def.parts ?? {});
		const hasRootPart = partNames.includes('Root');
		const firstPart = partNames.find((part) => part !== 'Root');

		if (hasRootPart) {
			issues.push({
				severity: 'error',
				code: 'bare-compound',
				line: tag.line,
				message: ruleMessage('bare-compound', {
					name: tag.name,
					variant: 'compound',
					target: `<${tag.name}.Root>`
				}),
				fix: ruleSuggestedFix('bare-compound', {
					target: `<${tag.name}.Root>`
				})
			});
			continue;
		}

		issues.push({
			severity: 'error',
			code: 'bare-compound',
			line: tag.line,
			message: ruleMessage('bare-compound', {
				name: tag.name,
				variant: 'namespaced',
				target: `a part like <${tag.name}.${firstPart ?? 'Text'}>`
			}),
			fix: ruleSuggestedFix('bare-compound', {
				target: `<${tag.name}.${firstPart ?? 'Text'}>`
			})
		});
	}
	return issues;
}

function checkUnknownComponent(
	tags: TagInfo[],
	imports: Set<string>,
	spec: { components: Record<string, ComponentDef> }
): Issue[] {
	const issues: Issue[] = [];
	for (const tag of tags) {
		const root = tag.name.split('.')[0] ?? tag.name;
		if (imports.has(root) && !spec.components[root]) {
			issues.push({
				severity: 'error',
				code: 'unknown-component',
				line: tag.line,
				message: ruleMessage('unknown-component', { name: tag.name }),
				fix: null
			});
		}
	}
	return issues;
}

function checkInvalidPartName(
	tags: TagInfo[],
	spec: { components: Record<string, ComponentDef> }
): Issue[] {
	const issues: Issue[] = [];
	for (const tag of tags) {
		if (!tag.name.includes('.')) continue;
		const parts = tag.name.split('.');
		const root = parts[0] ?? '';
		const part = parts[1] ?? '';
		if (!root || !part) continue;
		const def = spec.components[root];
		if (!def?.compound || !def.parts) continue;
		if (!def.parts[part]) {
			const validParts = Object.keys(def.parts);
			issues.push({
				severity: 'error',
				code: 'invalid-part',
				line: tag.line,
				message: ruleMessage('invalid-part', {
					root,
					part,
					validParts: validParts.join(', ')
				}),
				fix: null
			});
		}
	}
	return issues;
}

function checkInvalidProp(
	tags: TagInfo[],
	spec: { components: Record<string, ComponentDef> }
): Issue[] {
	const issues: Issue[] = [];
	for (const tag of tags) {
		const segments = tag.name.split('.');
		const root = segments[0] ?? '';
		const part = segments[1];
		if (!root) continue;
		const def = spec.components[root];
		if (!def) continue;

		let specProps: Record<string, PropDef> | undefined;

		if (part) {
			// Compound part — look up part props.
			specProps = def.parts?.[part]?.props;
		} else if (!def.compound) {
			// Non-compound component — use top-level props.
			specProps = def.props;
		} else {
			// Bare compound usage (already flagged by checkBareCompound) — skip.
			continue;
		}

		if (!specProps) continue;

		for (const prop of tag.props) {
			// Normalise bind:x -> x for spec lookup.
			const checkName = prop.startsWith('bind:') ? prop.slice(5) : prop;
			if (isPropAllowed(prop)) continue;
			if (!specProps[checkName]) {
				issues.push({
					severity: 'error',
					code: 'invalid-prop',
					line: tag.line,
					message: ruleMessage('invalid-prop', {
						name: tag.name,
						prop: checkName
					}),
					fix: null
				});
			}
		}
	}
	return issues;
}

function checkMissingRequiredProp(
	tags: TagInfo[],
	spec: { components: Record<string, ComponentDef> }
): Issue[] {
	const issues: Issue[] = [];
	for (const tag of tags) {
		if (tag.hasSpread) continue;

		const segments = tag.name.split('.');
		const root = segments[0] ?? '';
		const part = segments[1];
		if (!root) continue;
		const def = spec.components[root];
		if (!def) continue;

		let specProps: Record<string, PropDef> | undefined;

		if (part) {
			specProps = def.parts?.[part]?.props;
		} else if (!def.compound) {
			specProps = def.props;
		} else {
			continue;
		}

		if (!specProps) continue;

		// Normalise tag props (strip bind: prefix) for lookup.
		const tagPropNames = new Set(tag.props.map((p) => (p.startsWith('bind:') ? p.slice(5) : p)));

		for (const [propName, propDef] of Object.entries(specProps)) {
			if (propDef.required && !tagPropNames.has(propName)) {
				// In Svelte 5, nested content is implicitly passed as the `children`
				// snippet prop, so only flag missing `children` on self-closing tags.
				if (propName === 'children' && !tag.selfClosing) continue;

				issues.push({
					severity: 'error',
					code: 'missing-required-prop',
					line: tag.line,
					message: ruleMessage('missing-required-prop', {
						name: tag.name,
						prop: propName
					}),
					fix: ruleSuggestedFix('missing-required-prop', { prop: propName })
				});
			}
		}
	}
	return issues;
}

function checkOrphanedPart(
	tags: TagInfo[],
	spec: { components: Record<string, ComponentDef> }
): Issue[] {
	const issues: Issue[] = [];
	const allNames = new Set(tags.map((t) => t.name));

	for (const tag of tags) {
		if (!tag.name.includes('.')) continue;
		const root = tag.name.split('.')[0] ?? '';
		if (!root) continue;
		const def = spec.components[root];
		if (!def?.compound || !def.parts?.Root) continue;
		if (!allNames.has(`${root}.Root`)) {
			issues.push({
				severity: 'error',
				code: 'orphaned-part',
				line: tag.line,
				message: ruleMessage('orphaned-part', {
					name: tag.name,
					root
				}),
				fix: ruleSuggestedFix('orphaned-part', { root })
			});
		}
	}
	return issues;
}

function checkMissingLabel(tags: TagInfo[], ctx: ReviewContext): Issue[] {
	const issues: Issue[] = [];
	const { template, lineOffsets } = ctx;

	for (const tag of tags) {
		if (tag.name !== 'Input' && tag.name !== 'Select.Root' && tag.name !== 'Combobox.Input')
			continue;
		const hasAriaLabel = tag.props.some((p) => p === 'aria-label');
		if (hasAriaLabel) continue;

		// Find the offset of this tag in the template to check proximity.
		const tagOffset = findTagOffset(template, tag.name, tag.line, lineOffsets);
		const wrappedByField =
			tagOffset !== -1 &&
			template.lastIndexOf('<Field.Root', tagOffset) !== -1 &&
			template.indexOf('</Field.Root>', tagOffset) !== -1;

		if (!wrappedByField) {
			issues.push({
				severity: 'error',
				code: 'missing-label',
				line: tag.line,
				message: ruleMessage('missing-label', { name: tag.name }),
				fix: ruleSuggestedFix('missing-label')
			});
		}
	}
	return issues;
}

/** Find the offset of a tag occurrence at a given line in the template. */
function findTagOffset(
	template: string,
	tagName: string,
	targetLine: number,
	lineOffsets: number[]
): number {
	const regex = new RegExp(`<${tagName.replace('.', '\\.')}[\\s/>]`, 'g');
	let match: RegExpExecArray | null;
	while ((match = regex.exec(template)) !== null) {
		const line = lineAtOffset(lineOffsets, match.index);
		if (line === targetLine) return match.index;
	}
	return -1;
}

function checkImageWithoutAlt(tags: TagInfo[]): Issue[] {
	const issues: Issue[] = [];
	for (const tag of tags) {
		if (tag.name !== 'Avatar') continue;
		const hasAlt = tag.props.includes('alt');
		const hasFallback = tag.props.includes('fallback');
		if (!hasAlt && !hasFallback) {
			issues.push({
				severity: 'error',
				code: 'missing-alt',
				line: tag.line,
				message: ruleMessage('missing-alt'),
				fix: ruleSuggestedFix('missing-alt')
			});
		}
	}
	return issues;
}

/**
 * Detect whether a CSS style block contains complex layout patterns that
 * indicate intentional, non-trivial layout work where a simple
 * "use grid instead" suggestion would be unhelpful.
 *
 * Suppression triggers:
 * - grid-template-columns with >3 track values
 * - grid-template-areas (named template areas)
 * - Complex track functions: minmax(), repeat() with auto-fill/auto-fit, subgrid
 * - fr units mixed with fixed units in 4+ tracks
 * - Complex flex patterns: flex-wrap + order, or flex-basis with calc()
 */
function isComplexLayoutContext(styles: string): boolean {
	// Named template areas — always complex
	if (/grid-template-areas\s*:/.test(styles)) return true;

	// subgrid keyword
	if (/\bsubgrid\b/.test(styles)) return true;

	// minmax() in grid tracks
	if (/grid-template-columns\s*:[^;]*minmax\s*\(/.test(styles)) return true;

	// repeat() with auto-fill or auto-fit
	if (/grid-template-columns\s*:[^;]*repeat\s*\(\s*auto-(?:fill|fit)/.test(styles)) return true;

	// Count track values in grid-template-columns
	const gtcMatch = styles.match(/grid-template-columns\s*:\s*([^;]+)/);
	if (gtcMatch) {
		const trackValue = (gtcMatch[1] ?? '').trim();
		// Split on whitespace, but respect parenthesised groups like minmax(...) or repeat(...)
		const tracks = splitTrackValues(trackValue);
		if (tracks.length > 3) return true;
	}

	// Complex flex: flex-wrap combined with order, or flex-basis with calc()
	if (/flex-wrap\s*:/.test(styles) && /\border\s*:/.test(styles)) return true;
	if (/flex-basis\s*:[^;]*calc\s*\(/.test(styles)) return true;

	return false;
}

/**
 * Split a grid-template-columns value into individual track tokens,
 * respecting parenthesised groups (e.g. minmax(200px, 1fr) is one token).
 */
function splitTrackValues(value: string): string[] {
	const tracks: string[] = [];
	let current = '';
	let depth = 0;

	for (let i = 0; i < value.length; i++) {
		const ch = value[i]!;
		if (ch === '(') {
			depth++;
			current += ch;
		} else if (ch === ')') {
			depth--;
			current += ch;
		} else if (/\s/.test(ch) && depth === 0) {
			const trimmed = current.trim();
			if (trimmed) tracks.push(trimmed);
			current = '';
		} else {
			current += ch;
		}
	}
	const last = current.trim();
	if (last) tracks.push(last);

	return tracks;
}

function checkCustomFlexLayout(styles: string, code: string): Issue[] {
	const issues: Issue[] = [];
	if (/display:\s*(?:inline-)?flex/.test(styles)) {
		// Suppress for complex layout contexts where "use grid" is not helpful
		if (isComplexLayoutContext(styles)) return issues;

		const startLine = getStyleBlockStartLine(code);
		const localLine = findLineInBlock(styles, /display:\s*(?:inline-)?flex/);
		issues.push({
			severity: 'error',
			code: 'prefer-grid-layout',
			line: styleLineToFileLine(localLine, startLine),
			message: ruleMessage('prefer-grid-layout'),
			fix: ruleSuggestedFix('prefer-grid-layout')
		});
	}
	return issues;
}

function checkCustomFieldMarkup(ctx: ReviewContext): Issue[] {
	const issues: Issue[] = [];
	const { template, lineOffsets } = ctx;

	const fieldClassRegex = /class=["']field["']/g;
	let match: RegExpExecArray | null;

	while ((match = fieldClassRegex.exec(template)) !== null) {
		const line = lineAtOffset(lineOffsets, match.index);
		issues.push({
			severity: 'error',
			code: 'use-field-component',
			line,
			message: ruleMessage('use-field-component'),
			fix: ruleSuggestedFix('use-field-component')
		});
	}

	// Check for <span> followed by <input, <select, or <textarea (manual label+input pairing)
	const manualFieldRegex = /<span[^>]*>[\s\S]*?<\/span>\s*<(?:input|select|textarea)[\s/>]/g;

	while ((match = manualFieldRegex.exec(template)) !== null) {
		const line = lineAtOffset(lineOffsets, match.index);
		issues.push({
			severity: 'error',
			code: 'use-field-component',
			line,
			message: ruleMessage('use-field-component'),
			fix: ruleSuggestedFix('use-field-component')
		});
	}

	return issues;
}

function checkRawStyledButton(ctx: ReviewContext): Issue[] {
	const issues: Issue[] = [];
	const { template, lineOffsets } = ctx;
	const rawBtnRegex = /<button\s[^>]*class=/g;
	let match: RegExpExecArray | null;

	while ((match = rawBtnRegex.exec(template)) !== null) {
		const line = lineAtOffset(lineOffsets, match.index);
		issues.push({
			severity: 'error',
			code: 'use-button-component',
			line,
			message: ruleMessage('use-button-component'),
			fix: ruleSuggestedFix('use-button-component')
		});
	}
	return issues;
}

function checkCustomMaxWidthCentering(styles: string, code: string): Issue[] {
	const issues: Issue[] = [];
	if (/max-width/.test(styles) && /margin[^;]*auto/.test(styles)) {
		const startLine = getStyleBlockStartLine(code);
		const localLine = findLineInBlock(styles, /max-width/);
		issues.push({
			severity: 'error',
			code: 'use-container-component',
			line: styleLineToFileLine(localLine, startLine),
			message: ruleMessage('use-container-component'),
			fix: ruleSuggestedFix('use-container-component')
		});
	}
	return issues;
}

function classRuleHasDisplayGrid(styles: string, className: string): boolean {
	const escaped = escapeRegExp(className);
	const selectorRe = new RegExp(
		`\\.${escaped}(?=[\\s\\[:.#,{>+~]|$)[^{]*\\{[^}]*display\\s*:\\s*grid\\b`,
		's'
	);
	return selectorRe.test(styles);
}

function checkInteractiveCardWrapper(ctx: ReviewContext, styles: string): Issue[] {
	const issues: Issue[] = [];
	const { template, lineOffsets } = ctx;
	const wrapperRegex = /<([a-z][a-zA-Z0-9:-]*)\s[^>]*class=(["'])([^"']+)\2[^>]*>([\s\S]*?)<\/\1>/g;
	let match: RegExpExecArray | null;

	while ((match = wrapperRegex.exec(template)) !== null) {
		const classAttr = match[3] ?? '';
		const inner = match[4] ?? '';
		if (!/<Card\.Root\b[^>]*\bas=(["'])(button|a)\1/.test(inner)) continue;

		const classNames = classAttr.split(/\s+/).filter(Boolean);
		if (classNames.some((className) => classRuleHasDisplayGrid(styles, className))) continue;

		issues.push({
			severity: 'warning',
			code: 'interactive-card-wrapper',
			line: lineAtOffset(lineOffsets, match.index),
			message: ruleMessage('interactive-card-wrapper'),
			fix: ruleSuggestedFix('interactive-card-wrapper')
		});
	}

	return issues;
}

function getStyleBlockStartLine(code: string): number {
	const idx = code.search(/<style[^>]*>/);
	if (idx === -1) return 1;
	const lineOffsets = buildLineOffsets(code);
	// The content starts after the <style> tag itself.
	const tagEndIdx = code.indexOf('>', idx) + 1;
	return lineAtOffset(lineOffsets, tagEndIdx);
}

function styleLineToFileLine(lineInStyleBlock: number, styleStartLine: number): number {
	return styleStartLine + lineInStyleBlock - 1;
}

function findLineInBlock(block: string, regex: RegExp): number {
	const lines = block.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line !== undefined && regex.test(line)) return i + 1; // 1-based within block
	}
	return 1;
}

function checkHardcodedColors(styles: string, code: string): Issue[] {
	const issues: Issue[] = [];
	const colorRegex = /(?:^|;)\s*(?:color|background(?:-color)?)\s*:\s*(?!.*var\s*\()/m;
	if (colorRegex.test(styles)) {
		const startLine = getStyleBlockStartLine(code);
		const localLine = findLineInBlock(
			styles,
			/(?:color|background(?:-color)?)\s*:\s*(?!.*var\s*\()/
		);
		issues.push({
			severity: 'suggestion',
			code: 'hardcoded-color',
			line: styleLineToFileLine(localLine, startLine),
			message: ruleMessage('hardcoded-color'),
			fix: ruleSuggestedFix('hardcoded-color')
		});
	}
	return issues;
}

function checkManualCentering(styles: string, code: string): Issue[] {
	const issues: Issue[] = [];
	if (/max-width/.test(styles) && /margin:\s*[^;]*auto/.test(styles)) {
		const startLine = getStyleBlockStartLine(code);
		const localLine = findLineInBlock(styles, /max-width/);
		issues.push({
			severity: 'suggestion',
			code: 'prefer-container',
			line: styleLineToFileLine(localLine, startLine),
			message: ruleMessage('prefer-container'),
			fix: ruleSuggestedFix('prefer-container')
		});
	}
	return issues;
}

function checkCustomThemeOverrides(styles: string, code: string): Issue[] {
	if (!styles || !/--dry-/.test(styles)) return [];
	return [
		{
			severity: 'suggestion',
			code: 'theme-in-style',
			line: getStyleBlockStartLine(code),
			message: ruleMessage('theme-in-style'),
			fix: null
		}
	];
}

function checkRawHr(ctx: ReviewContext): Issue[] {
	const issues: Issue[] = [];
	const { template, lineOffsets } = ctx;
	const hrRegex = /<hr[\s/>]/g;
	let match: RegExpExecArray | null;

	while ((match = hrRegex.exec(template)) !== null) {
		const line = lineAtOffset(lineOffsets, match.index);
		issues.push({
			severity: 'error',
			code: 'prefer-separator',
			line,
			message: ruleMessage('prefer-separator'),
			fix: ruleSuggestedFix('prefer-separator')
		});
	}
	return issues;
}

export function reviewComponent(
	code: string,
	spec: { components: Record<string, ComponentDef> },
	filename?: string
): ReviewResult {
	const ctx: ReviewContext = {
		code,
		template: stripScriptAndStyle(code),
		lineOffsets: buildLineOffsets(code)
	};
	const imports = extractImports(code);
	const tags = extractTags(ctx);
	const styles = extractStyles(code);
	const issues: Issue[] = [];

	issues.push(...checkBareCompound(tags, spec));
	issues.push(...checkUnknownComponent(tags, imports, spec));
	issues.push(...checkInvalidPartName(tags, spec));
	issues.push(...checkInvalidProp(tags, spec));
	issues.push(...checkMissingRequiredProp(tags, spec));

	issues.push(...checkOrphanedPart(tags, spec));
	issues.push(...checkMissingLabel(tags, ctx));
	issues.push(...checkImageWithoutAlt(tags));
	issues.push(...checkCustomFieldMarkup(ctx));
	issues.push(...checkRawStyledButton(ctx));
	if (styles) {
		issues.push(...checkCustomFlexLayout(styles, code));
		issues.push(...checkCustomMaxWidthCentering(styles, code));
		issues.push(...checkInteractiveCardWrapper(ctx, styles));
	}

	if (styles) {
		issues.push(...checkHardcodedColors(styles, code));
		issues.push(...checkManualCentering(styles, code));
		issues.push(...checkCustomThemeOverrides(styles, code));
	}
	issues.push(...checkRawHr(ctx));

	issues.sort((a, b) => a.line - b.line);

	let errors = 0;
	let warnings = 0;
	let suggestions = 0;
	for (const issue of issues) {
		if (issue.severity === 'error') errors += 1;
		else if (issue.severity === 'warning') warnings += 1;
		else suggestions += 1;
	}
	const summary =
		issues.length === 0
			? 'No issues found'
			: `${errors} error${errors !== 1 ? 's' : ''}, ${warnings} warning${warnings !== 1 ? 's' : ''}, ${suggestions} suggestion${suggestions !== 1 ? 's' : ''}`;

	return { issues, summary, ...(filename ? { filename } : {}) };
}
