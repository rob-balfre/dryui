import { ruleMessage } from './rule-catalog.js';

export interface Violation {
	rule: string;
	message: string;
	line: number;
}

const SCRIPT_BLOCK_RE = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
const STYLE_BLOCK_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;

interface NativeElementRule {
	tag: string;
	component: string;
	allowedDirs: ReadonlySet<string>;
	re: RegExp;
}

const BANNED_COMPONENTS = ['Grid', 'Stack', 'Flex'] as const;

const BANNED_COMPONENT_IMPORT_RE = new RegExp(
	`\\b(${BANNED_COMPONENTS.join('|')})\\b.*from\\s+['"]@dryui/ui`,
	'g'
);

const BANNED_COMPONENT_USAGE_RE = new RegExp(
	`<(${BANNED_COMPONENTS.join('|')})(\\.|\\s|>|\\/)`,
	'g'
);

const BANNED_COMPONENT_WORD_RES: ReadonlyArray<readonly [string, RegExp]> = BANNED_COMPONENTS.map(
	(comp) => [comp, new RegExp(`\\b${comp}\\b`)] as const
);

const INLINE_STYLE_RE = /\bstyle\s*=/g;

const STYLE_DIRECTIVE_RE = /\bstyle:\w+/g;

const FLEX_DISPLAY_RE = /display\s*:\s*flex(?![a-z-])/g;

const FLEX_PROPS_RE =
	/(?:^|[;\s{])(?:flex-direction|flex-wrap|flex-grow|flex-shrink|flex-basis|flex)\s*:/gm;

const COMPONENT_CLASS_RE = /<([A-Z][a-zA-Z0-9.]*)[^>]*?\bclass\s*=/gs;

// Components that officially accept a `class` prop and forward it to the root
// element. These are opt-in exceptions to the `dryui/no-component-class` rule:
// passing class= here is supported and documented, so we do not flag it.
const COMPONENTS_ACCEPTING_CLASS: ReadonlySet<string> = new Set([
	'Button',
	'Heading',
	'Text',
	'Typography.Heading',
	'Typography.Text'
]);

const CSS_IGNORE_RE = /<!--\s*svelte-ignore\s+css_unused_selector\s*-->/g;

const SVELTE_ELEMENT_RE = /<svelte:element(\s|>|\/)/g;

const WIDTH_RE = /(?:^|[;\s{])(?:(?:max|min)-)?(?:width|inline-size)\s*:\s*([^;}]+)/gm;

// Typographic measure units (ch, ex, em) track text content, not viewport layout.
// e.g. `max-width: 55ch` constrains text column to ~55 characters — allowed.
const MEASURE_UNIT_RE = /(?:^|[^a-zA-Z0-9])-?[\d.]+(ch|ex|em)(?![a-zA-Z0-9])/;
// Disallowed viewport/pixel units that freeze layout at a size breakpoint.
const PIXEL_UNIT_RE =
	/(?:^|[^a-zA-Z0-9])-?[\d.]+(px|rem|vw|vh|%|vmin|vmax|svw|svh|lvw|lvh|dvw|dvh|pt|pc|cm|mm|in)(?![a-zA-Z0-9])/i;
const ALL_UNSET_RE = /(?:^|[;\s{])all\s*:\s*unset(?![a-z-])/gm;
const IMPORTANT_RE = /!important\b/g;
const CSS_COMMENT_RE = /\/\*[\s\S]*?\*\//g;

const GLOBAL_SELECTOR_RE = /:global\s*\(/g;

const MEDIA_QUERY_RE = /@media\s+[^{]+\{/g;
const ALLOWED_MEDIA_RE = /prefers-reduced-motion|prefers-color-scheme/;

const FOCUS_RING_LITERAL_RE = /outline\s*:\s*2px\s+solid\s+var\(--dry-color-focus-ring\)/g;

const NATIVE_ELEMENT_RULES: NativeElementRule[] = [
	{
		tag: 'button',
		component: 'Button',
		allowedDirs: new Set(['button', 'card', 'mega-menu', 'tree']),
		re: /<button(\s|>|\/)/g
	},
	{
		tag: 'dialog',
		component: 'Dialog',
		allowedDirs: new Set(['dialog', 'alert-dialog', 'drawer', 'command-palette', 'internal']),
		re: /<dialog(\s|>|\/)/g
	},
	{ tag: 'hr', component: 'Separator', allowedDirs: new Set(['separator']), re: /<hr(\s|>|\/)/g },
	{
		tag: 'input',
		component: 'Input',
		allowedDirs: new Set([
			'input',
			'number-input',
			'pin-input',
			'time-input',
			'date-time-input',
			'date-field',
			'combobox',
			'multi-select-combobox',
			'select',
			'phone-input',
			'rating',
			'date-picker',
			'data-grid',
			'rich-text-editor',
			'checkbox',
			'radio-group',
			'slider',
			'alpha-slider',
			'color-picker',
			'tags-input',
			'transfer',
			'file-upload',
			'input-group',
			'command-palette'
		]),
		re: /<input(\s|>|\/)/g
	},
	{
		tag: 'select',
		component: 'Select',
		allowedDirs: new Set(['select', 'input-group', 'phone-input']),
		re: /<select(\s|>|\/)/g
	},
	{
		tag: 'table',
		component: 'Table',
		allowedDirs: new Set(['table', 'data-grid']),
		re: /<table(\s|>|\/)/g
	},
	{
		tag: 'textarea',
		component: 'Textarea',
		allowedDirs: new Set(['textarea', 'prompt-input']),
		re: /<textarea(\s|>|\/)/g
	}
];

function buildLineIndex(content: string): number[] {
	const starts = [0];
	for (let i = 0; i < content.length; i++) {
		if (content.charCodeAt(i) === 10 /* \n */) starts.push(i + 1);
	}
	return starts;
}

function lookupLine(lineStarts: number[], index: number): number {
	// binary search for the largest line start <= index
	let lo = 0;
	let hi = lineStarts.length - 1;
	while (lo < hi) {
		const mid = (lo + hi + 1) >>> 1;
		if (lineStarts[mid]! <= index) lo = mid;
		else hi = mid - 1;
	}
	return lo + 1;
}

function blockStartLine(content: string, lineStarts: number[], blockIndex: number): number {
	const tagEnd = content.indexOf('>', blockIndex);
	const contentStart = tagEnd === -1 ? blockIndex : tagEnd + 1;
	return lookupLine(lineStarts, contentStart);
}

function offsetViolations(violations: Violation[], lineOffset: number): Violation[] {
	return violations.map((violation) => ({
		...violation,
		line: lineOffset + violation.line - 1
	}));
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

interface TagMatch {
	index: number;
	text: string;
}

function findOpeningTags(content: string, tagName: string): TagMatch[] {
	const matches: TagMatch[] = [];
	const needle = `<${tagName}`;
	let index = 0;

	while (index < content.length) {
		const commentIndex = content.indexOf('<!--', index);
		const tagIndex = content.indexOf(needle, index);

		if (tagIndex === -1) break;

		if (commentIndex !== -1 && commentIndex < tagIndex) {
			const commentEnd = content.indexOf('-->', commentIndex + 4);
			index = commentEnd === -1 ? content.length : commentEnd + 3;
			continue;
		}

		const boundary = content[tagIndex + needle.length];
		if (boundary && /[A-Za-z0-9:-]/.test(boundary)) {
			index = tagIndex + needle.length;
			continue;
		}

		let cursor = tagIndex + needle.length;
		let quote: '"' | "'" | null = null;
		let expressionDepth = 0;

		while (cursor < content.length) {
			const char = content[cursor]!;

			if (quote) {
				if (char === quote && content[cursor - 1] !== '\\') quote = null;
				cursor += 1;
				continue;
			}

			if (char === '"' || char === "'") {
				quote = char;
				cursor += 1;
				continue;
			}

			if (char === '{') {
				expressionDepth += 1;
				cursor += 1;
				continue;
			}

			if (char === '}') {
				expressionDepth = Math.max(0, expressionDepth - 1);
				cursor += 1;
				continue;
			}

			if (char === '>' && expressionDepth === 0) {
				cursor += 1;
				break;
			}

			cursor += 1;
		}

		matches.push({
			index: tagIndex,
			text: content.slice(tagIndex, cursor)
		});
		index = cursor;
	}

	return matches;
}

function anchorHasHref(tagText: string): boolean {
	return /\{href\}/.test(tagText) || /(?<![\w:-])href\s*=/.test(tagText);
}

export function checkScript(content: string): Violation[] {
	const violations: Violation[] = [];
	const lineStarts = buildLineIndex(content);
	const lines = content.split('\n');
	const allowed = (_ruleId: string) => true;

	if (allowed('dryui/no-layout-component')) {
		for (const match of content.matchAll(BANNED_COMPONENT_IMPORT_RE)) {
			const line = lookupLine(lineStarts, match.index);
			const lineText = lines[line - 1] ?? '';
			if (!lineText.includes('@dryui/ui')) continue;
			for (const [comp, re] of BANNED_COMPONENT_WORD_RES) {
				if (re.test(lineText)) {
					violations.push({
						rule: 'dryui/no-layout-component',
						message: ruleMessage('dryui/no-layout-component', {
							action: 'import',
							target: comp,
							guidance: 'raw CSS grid with custom properties instead'
						}),
						line
					});
				}
			}
		}
	}

	// project/theme-import-order is a correctness rule; the `project/` prefix
	// routes it to the catalog entry `theme-import-order`.
	if (allowed('project/theme-import-order')) {
		violations.push(...checkThemeImportOrder(content, lineStarts));
	}

	const seen = new Set<string>();
	return violations.filter((v) => {
		const key = `${v.line}:${v.message}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

// Theme import order check

const SIDE_EFFECT_IMPORT_RE = /^[ \t]*import\s+['"]([^'"]+)['"]\s*;?\s*$/gm;
const THEME_IMPORT_RE = /^@dryui\/ui\/themes\/[^'"]*\.css$/;
const LOCAL_CSS_IMPORT_RE = /\.(css|pcss|postcss|scss)$/i;

interface SideEffectImport {
	path: string;
	line: number;
}

/**
 * Detect mixed imports of `@dryui/ui/themes/*.css` and local CSS in the wrong
 * order. The theme CSS defines `--dry-*` defaults. Local CSS that overrides
 * those tokens MUST be imported AFTER the theme CSS, otherwise the theme defaults
 * clobber the overrides and the theme appears unchanged.
 *
 * This operates only on side-effect imports (`import 'path';`), which is the
 * convention for CSS in Vite/SvelteKit. Named imports and re-exports are
 * ignored because they are not CSS.
 */
export function checkThemeImportOrder(
	content: string,
	lineStarts: number[] = buildLineIndex(content)
): Violation[] {
	const sideEffectImports: SideEffectImport[] = [];
	for (const match of content.matchAll(SIDE_EFFECT_IMPORT_RE)) {
		const path = match[1];
		if (!path) continue;
		sideEffectImports.push({
			path,
			line: lookupLine(lineStarts, match.index ?? 0)
		});
	}

	if (sideEffectImports.length < 2) return [];

	// Find first theme import and first local CSS import.
	let firstThemeIdx = -1;
	let firstLocalCssIdx = -1;
	for (let i = 0; i < sideEffectImports.length; i++) {
		const imp = sideEffectImports[i]!;
		if (THEME_IMPORT_RE.test(imp.path)) {
			if (firstThemeIdx === -1) firstThemeIdx = i;
			continue;
		}
		// Local CSS is a relative path ending in a CSS-like extension.
		// Also accept bare specifier ending in .css (e.g. package exports).
		if (LOCAL_CSS_IMPORT_RE.test(imp.path) && !imp.path.startsWith('@dryui/ui/themes/')) {
			if (firstLocalCssIdx === -1) firstLocalCssIdx = i;
		}
	}

	if (firstThemeIdx === -1 || firstLocalCssIdx === -1) return [];
	if (firstLocalCssIdx >= firstThemeIdx) return []; // correct order

	const localImport = sideEffectImports[firstLocalCssIdx]!;
	return [
		{
			// Rule id uses the `project/` prefix to align with project-scoped findings
			// in workspace-audit (e.g. `project/missing-theme-import`). The underlying
			// catalog entry is keyed as `theme-import-order` for message lookup.
			rule: 'project/theme-import-order',
			message: ruleMessage('theme-import-order'),
			line: localImport.line
		}
	];
}

/**
 * Autofix: return the same content with side-effect imports reordered so that
 * `@dryui/ui/themes/*.css` imports come BEFORE any local CSS side-effect import.
 * Non-import lines and named imports are preserved in place.
 */
export function fixThemeImportOrder(content: string): string {
	// Collect each side-effect import with its start/end offsets.
	interface ImportSpan {
		start: number;
		end: number; // exclusive, end of the line (up to and including the trailing newline or EOF)
		path: string;
		text: string;
	}
	const spans: ImportSpan[] = [];
	for (const match of content.matchAll(SIDE_EFFECT_IMPORT_RE)) {
		const path = match[1];
		if (!path) continue;
		const start = match.index ?? 0;
		// End of the matched line: advance to the next newline (inclusive).
		let end = start + match[0].length;
		if (content[end] === '\n') end += 1;
		spans.push({ start, end, path, text: content.slice(start, end) });
	}

	if (spans.length < 2) return content;

	// Classify each span.
	const themeSpans: ImportSpan[] = [];
	const localCssSpans: ImportSpan[] = [];
	for (const span of spans) {
		if (THEME_IMPORT_RE.test(span.path)) themeSpans.push(span);
		else if (LOCAL_CSS_IMPORT_RE.test(span.path) && !span.path.startsWith('@dryui/ui/themes/'))
			localCssSpans.push(span);
	}

	if (themeSpans.length === 0 || localCssSpans.length === 0) return content;
	const firstTheme = themeSpans[0]!;
	const firstLocal = localCssSpans[0]!;
	if (firstLocal.start >= firstTheme.start) return content;

	// Rebuild: collect every theme import text, concatenate, then stitch into the
	// spot of the first local-CSS import. Blank out each theme span in-place (via
	// replacement with empty string). We do this right-to-left to keep offsets valid.
	const removals = [...themeSpans].sort((a, b) => b.start - a.start);
	let out = content;
	for (const span of removals) {
		out = out.slice(0, span.start) + out.slice(span.end);
	}
	// Insert theme imports (in original order) BEFORE the first local-CSS import.
	// Recompute firstLocal position in the new string by searching for its text.
	const insertion = themeSpans.map((s) => s.text).join('');
	const insertAt = out.indexOf(firstLocal.text);
	if (insertAt === -1) return content; // safety
	return out.slice(0, insertAt) + insertion + out.slice(insertAt);
}

const SCRIPT_OR_STYLE_BLOCK_RE = /<(?:script|style)[\s>][\s\S]*?<\/(?:script|style)>/gi;

export function stripBlocks(content: string): string {
	return content.replace(SCRIPT_OR_STYLE_BLOCK_RE, (m) => {
		let count = 0;
		for (let i = 0; i < m.length; i++) {
			if (m.charCodeAt(i) === 10 /* \n */) count++;
		}
		return '\n'.repeat(count);
	});
}

function stripCssComments(content: string): string {
	return content.replace(CSS_COMMENT_RE, (m) => {
		// Preserve length and newlines so match indices and line numbers stay stable.
		let out = '';
		for (let i = 0; i < m.length; i++) {
			out += m.charCodeAt(i) === 10 /* \n */ ? '\n' : ' ';
		}
		return out;
	});
}

function getParentDir(filename?: string): string {
	if (!filename) return '';
	// Parent dir = last segment of the parent path. Platform-agnostic and
	// avoids a node:path import so this module works in browser/bun contexts.
	const normalized = filename.replace(/\\/g, '/');
	const lastSlash = normalized.lastIndexOf('/');
	if (lastSlash === -1) return '';
	const parent = normalized.slice(0, lastSlash);
	const prevSlash = parent.lastIndexOf('/');
	return parent.slice(prevSlash + 1).toLowerCase();
}

function createNativeElementMessage(rule: NativeElementRule): string {
	return ruleMessage('dryui/no-raw-native-element', {
		tag: rule.tag,
		component: rule.component,
		closing: rule.tag === 'hr' ? ' /' : ''
	});
}

export function checkMarkup(content: string, filename?: string): Violation[] {
	const violations: Violation[] = [];
	const markup = stripBlocks(content);
	const parentDir = getParentDir(filename);
	const lineStarts = buildLineIndex(markup);
	const lineOf = (i: number) => lookupLine(lineStarts, i);
	const file: FileContext = {
		content: markup,
		lines: markup.split('\n'),
		lineStarts
	};
	const allowed = (_ruleId: string) => true;

	if (allowed('dryui/no-inline-style')) {
		for (const match of markup.matchAll(INLINE_STYLE_RE)) {
			violations.push({
				rule: 'dryui/no-inline-style',
				message: ruleMessage('dryui/no-inline-style'),
				line: lineOf(match.index)
			});
		}
	}

	if (allowed('dryui/no-style-directive')) {
		for (const match of markup.matchAll(STYLE_DIRECTIVE_RE)) {
			violations.push({
				rule: 'dryui/no-style-directive',
				message: ruleMessage('dryui/no-style-directive'),
				line: lineOf(match.index)
			});
		}
	}

	if (allowed('dryui/no-layout-component')) {
		for (const match of markup.matchAll(BANNED_COMPONENT_USAGE_RE)) {
			const comp = match[1];
			violations.push({
				rule: 'dryui/no-layout-component',
				message: ruleMessage('dryui/no-layout-component', {
					action: 'use',
					target: `<${comp}>`,
					guidance: 'raw CSS grid with custom properties instead'
				}),
				line: lineOf(match.index)
			});
		}
	}

	if (allowed('dryui/no-component-class')) {
		for (const match of markup.matchAll(COMPONENT_CLASS_RE)) {
			const comp = match[1] ?? 'Component';
			if (COMPONENTS_ACCEPTING_CLASS.has(comp)) continue;
			violations.push({
				rule: 'dryui/no-component-class',
				message: ruleMessage('dryui/no-component-class', { component: comp }),
				line: lineOf(match.index)
			});
		}
	}

	if (allowed('dryui/no-css-ignore')) {
		for (const match of markup.matchAll(CSS_IGNORE_RE)) {
			violations.push({
				rule: 'dryui/no-css-ignore',
				message: ruleMessage('dryui/no-css-ignore'),
				line: lineOf(match.index)
			});
		}
	}

	if (allowed('dryui/no-svelte-element')) {
		for (const match of markup.matchAll(SVELTE_ELEMENT_RE)) {
			if (hasAllowComment(file, match.index, 'svelte-element')) continue;
			violations.push({
				rule: 'dryui/no-svelte-element',
				message: ruleMessage('dryui/no-svelte-element'),
				line: lineOf(match.index)
			});
		}
	}

	if (allowed('dryui/no-anchor-without-href')) {
		for (const tag of findOpeningTags(markup, 'a')) {
			if (anchorHasHref(tag.text)) continue;
			violations.push({
				rule: 'dryui/no-anchor-without-href',
				message: ruleMessage('dryui/no-anchor-without-href'),
				line: lineOf(tag.index)
			});
		}
	}

	if (allowed('dryui/no-raw-native-element')) {
		for (const rule of NATIVE_ELEMENT_RULES) {
			if (rule.allowedDirs.has(parentDir)) continue;

			for (const match of markup.matchAll(rule.re)) {
				violations.push({
					rule: 'dryui/no-raw-native-element',
					message: createNativeElementMessage(rule),
					line: lineOf(match.index)
				});
			}
		}
	}

	return violations;
}

interface FileContext {
	content: string;
	lines: string[];
	lineStarts: number[];
}

function hasAllowComment(file: FileContext, matchIndex: number, keyword: string): boolean {
	// Skip leading non-alpha chars (regex may capture a delimiter on the prior line)
	let idx = matchIndex;
	while (idx < file.content.length && /[^a-zA-Z]/.test(file.content[idx]!)) idx++;
	const declLine = lookupLine(file.lineStarts, idx);
	if (declLine <= 1) return false;
	const prevLine = file.lines[declLine - 2] ?? '';
	return prevLine.includes(`dryui-allow ${keyword}`);
}

export interface StyleContext {
	readonly chipGroupExemptClasses?: ReadonlySet<string>;
}

/**
 * Extract the CSS selector immediately preceding a property match.
 * Walks backward to find the last `{` and captures the selector block before it.
 */
function selectorAtOffset(css: string, propertyIndex: number): string {
	// Find the last `{` at or before propertyIndex
	const braceIdx = css.lastIndexOf('{', propertyIndex);
	if (braceIdx === -1) return '';
	// Find the previous `}` or `;` or start-of-string to delimit the selector start
	let start = 0;
	for (let i = braceIdx - 1; i >= 0; i--) {
		const ch = css[i];
		if (ch === '}' || ch === ';') {
			start = i + 1;
			break;
		}
	}
	return css.slice(start, braceIdx).trim();
}

/**
 * Returns true when the CSS selector targets an element marked exempt.
 * Exempt targets:
 *   - `[data-chip-group]` attribute selector (with or without tag prefix)
 *   - `.foo` where `foo` is in exemptClasses (ChipGroup root or direct child)
 *   - `.parent > .child` where parent is exempt (covers immediate children)
 */
function selectorIsChipGroupExempt(selector: string, exemptClasses: ReadonlySet<string>): boolean {
	if (!selector) return false;
	// Normalize: collapse whitespace
	const norm = selector.replace(/\s+/g, ' ').trim();
	// `[data-chip-group]` attribute selector matches the ChipGroup root directly
	if (/\[data-chip-group(?:[=\]~|^$*])/i.test(norm)) return true;
	if (exemptClasses.size === 0) return false;
	// Match any class in the selector against the exempt set. A selector like
	// `.chip-group > .chip` is exempt when `chip-group` or `chip` is exempt.
	const classMatches = norm.match(/\.[-_a-zA-Z0-9]+/g) ?? [];
	for (const raw of classMatches) {
		if (exemptClasses.has(raw.slice(1))) return true;
	}
	return false;
}

export function checkStyle(
	content: string,
	context: StyleContext = {},
	_filename?: string
): Violation[] {
	const violations: Violation[] = [];
	// `scan` has comments blanked out (length-preserving) so rule regexes don't
	// flag property names that appear in prose comments like
	// `/* flex-wrap is the sanctioned primitive */`. `file` keeps the original
	// content so `hasAllowComment` can still see `/* dryui-allow flex */` on the
	// preceding line.
	const scan = stripCssComments(content);
	const file: FileContext = {
		content,
		lines: content.split('\n'),
		lineStarts: buildLineIndex(content)
	};
	const lineOf = (i: number) => lookupLine(file.lineStarts, i);
	const exemptClasses = context.chipGroupExemptClasses ?? new Set<string>();
	const inChipGroupScope = (idx: number): boolean =>
		selectorIsChipGroupExempt(selectorAtOffset(scan, idx), exemptClasses);
	const allowed = (_ruleId: string) => true;

	if (allowed('dryui/no-flex')) {
		for (const match of scan.matchAll(FLEX_DISPLAY_RE)) {
			if (hasAllowComment(file, match.index, 'flex')) continue;
			if (inChipGroupScope(match.index)) continue;
			violations.push({
				rule: 'dryui/no-flex',
				message: ruleMessage('dryui/no-flex', {
					value: 'display: flex',
					guidance: 'display: grid instead'
				}),
				line: lineOf(match.index)
			});
		}

		for (const match of scan.matchAll(FLEX_PROPS_RE)) {
			if (hasAllowComment(file, match.index, 'flex')) continue;
			if (inChipGroupScope(match.index)) continue;
			const prop = match[0].trim().replace(/;/, '').split(':')[0]!.trim();
			violations.push({
				rule: 'dryui/no-flex',
				message: ruleMessage('dryui/no-flex', {
					value: prop,
					guidance: 'CSS grid equivalents instead'
				}),
				line: lineOf(match.index)
			});
		}
	}

	if (allowed('dryui/no-width')) {
		for (const match of scan.matchAll(WIDTH_RE)) {
			if (hasAllowComment(file, match.index, 'width')) continue;
			const rawValue = (match[1] ?? '').trim();
			// Allow typographic measure units (ch, ex, em) — they track text content,
			// not viewport layout. e.g. `max-width: 55ch` constrains text columns.
			// Reject if the value also contains pixel/viewport units (mixed calcs stay banned).
			if (MEASURE_UNIT_RE.test(rawValue) && !PIXEL_UNIT_RE.test(rawValue)) continue;
			violations.push({
				rule: 'dryui/no-width',
				message: ruleMessage('dryui/no-width'),
				line: lineOf(match.index)
			});
		}
	}

	if (allowed('dryui/no-all-unset')) {
		for (const match of scan.matchAll(ALL_UNSET_RE)) {
			violations.push({
				rule: 'dryui/no-all-unset',
				message: ruleMessage('dryui/no-all-unset'),
				line: lineOf(match.index)
			});
		}
	}

	if (allowed('dryui/no-important')) {
		for (const match of scan.matchAll(IMPORTANT_RE)) {
			if (hasAllowComment(file, match.index, 'important')) continue;
			violations.push({
				rule: 'dryui/no-important',
				message: ruleMessage('dryui/no-important'),
				line: lineOf(match.index)
			});
		}
	}

	if (allowed('dryui/no-global')) {
		for (const match of scan.matchAll(GLOBAL_SELECTOR_RE)) {
			violations.push({
				rule: 'dryui/no-global',
				message: ruleMessage('dryui/no-global'),
				line: lineOf(match.index)
			});
		}
	}

	if (allowed('dryui/no-media-sizing')) {
		for (const match of scan.matchAll(MEDIA_QUERY_RE)) {
			const query = match[0];
			if (!ALLOWED_MEDIA_RE.test(query)) {
				violations.push({
					rule: 'dryui/no-media-sizing',
					message: ruleMessage('dryui/no-media-sizing'),
					line: lineOf(match.index)
				});
			}
		}
	}

	if (allowed('dryui/prefer-focus-ring-token')) {
		for (const match of scan.matchAll(FOCUS_RING_LITERAL_RE)) {
			violations.push({
				rule: 'dryui/prefer-focus-ring-token',
				message: ruleMessage('dryui/prefer-focus-ring-token'),
				line: lineOf(match.index)
			});
		}
	}

	return violations;
}

/**
 * Scan markup for elements carrying `data-chip-group` and their direct children.
 * Returns the set of class names (without the leading dot) that are exempt from
 * `dryui/no-flex`. The ChipGroup.Root component marks its root element with
 * `data-chip-group` and uses flexbox to wrap chips — chip layout is intentionally
 * flex-based and must not trigger the rule.
 */
function collectChipGroupClasses(content: string): Set<string> {
	const exempt = new Set<string>();
	const markup = stripBlocks(content);

	// Match any opening tag with data-chip-group attribute.
	// Capture the full tag so we can pull its class list and find the matching end.
	const chipGroupTagRe =
		/<([a-zA-Z][a-zA-Z0-9-]*|[A-Z][a-zA-Z0-9.]*)([^>]*\bdata-chip-group(?:=["'][^"']*["'])?[^>]*)>/g;

	for (const match of markup.matchAll(chipGroupTagRe)) {
		const attrs = match[2] ?? '';
		// Pull classes from the root element itself.
		for (const cls of extractClassNames(attrs)) exempt.add(cls);

		// Also pull classes from the immediate children. Naive: walk forward from
		// the match, tracking depth, and capture all direct-child opening tags.
		const tagName = match[1] ?? '';
		const bodyStart = (match.index ?? 0) + match[0].length;
		collectDirectChildClasses(markup, bodyStart, tagName, exempt);
	}

	// ChipGroup.Root from @dryui/ui also qualifies — users compose it by name.
	// `<ChipGroup.Root>` itself is exempt; its scoped class names won't show up
	// in user CSS (it's a component), but any class wrapper around it might.
	return exempt;
}

function extractClassNames(attrsStr: string): string[] {
	const out: string[] = [];
	// class="foo bar baz" — ignore expressions, only capture literal tokens.
	const staticClassRe = /\bclass\s*=\s*"([^"]*)"/g;
	const staticClassReSingle = /\bclass\s*=\s*'([^']*)'/g;
	for (const re of [staticClassRe, staticClassReSingle]) {
		for (const m of attrsStr.matchAll(re)) {
			for (const token of (m[1] ?? '').split(/\s+/)) {
				if (token && /^[-_a-zA-Z][-_a-zA-Z0-9]*$/.test(token)) out.push(token);
			}
		}
	}
	// class:foo or class:foo={cond} — Svelte's conditional class directive.
	const directiveRe = /\bclass:([-_a-zA-Z][-_a-zA-Z0-9]*)/g;
	for (const m of attrsStr.matchAll(directiveRe)) {
		const name = m[1];
		if (name) out.push(name);
	}
	return out;
}

function collectDirectChildClasses(
	markup: string,
	start: number,
	_parentTag: string,
	out: Set<string>
): void {
	// Walk the markup from `start` tracking tag nesting. For each depth-1 opening
	// tag (an immediate child of the chip-group root), harvest its class list.
	// Stop when depth returns to 0 (matching close of the chip-group root).
	//
	// Simpler rule: `depth` counts how deep we are BELOW the chip-group root.
	// Entering the function: depth = 0 means we're inside the chip-group, scanning
	// its immediate children. Opening a non-self-closing tag increments depth; a
	// closing tag decrements. When depth drops below 0 we've left the root.
	let depth = 0;
	let pos = start;

	while (pos < markup.length) {
		const next = markup.indexOf('<', pos);
		if (next === -1) break;

		// Comment skip
		if (markup.startsWith('<!--', next)) {
			const end = markup.indexOf('-->', next + 4);
			pos = end === -1 ? markup.length : end + 3;
			continue;
		}

		if (markup.startsWith('</', next)) {
			const gt = markup.indexOf('>', next);
			if (gt === -1) break;
			if (depth === 0) {
				// The first unbalanced closing tag at our level closes the chip-group
				// root (or the structure is malformed). Either way, we're done.
				return;
			}
			depth -= 1;
			pos = gt + 1;
			continue;
		}

		// Opening or self-closing tag.
		const gt = markup.indexOf('>', next);
		if (gt === -1) break;
		const tagText = markup.slice(next, gt + 1);
		const tagNameMatch = /^<([a-zA-Z][a-zA-Z0-9-]*|[A-Z][a-zA-Z0-9.]*)\b/.exec(tagText);
		const tagName = tagNameMatch ? (tagNameMatch[1] ?? '') : '';
		const selfClosing = /\/>$/.test(tagText);
		const voidTag =
			/^(br|hr|img|input|meta|link|source|track|wbr|area|base|col|embed|param)$/i.test(tagName);

		if (depth === 0 && tagName) {
			for (const cls of extractClassNames(tagText)) out.add(cls);
		}

		if (!selfClosing && !voidTag) depth += 1;

		pos = gt + 1;
	}
}

export function checkSvelteFile(content: string, filename?: string): Violation[] {
	const lineStarts = buildLineIndex(content);
	const violations: Violation[] = [...checkMarkup(content, filename)];
	const chipGroupExemptClasses = collectChipGroupClasses(content);

	for (const match of content.matchAll(SCRIPT_BLOCK_RE)) {
		const script = match[1] ?? '';
		const startLine = blockStartLine(content, lineStarts, match.index ?? 0);
		violations.push(...offsetViolations(checkScript(script), startLine));
	}

	for (const match of content.matchAll(STYLE_BLOCK_RE)) {
		const style = match[1] ?? '';
		const startLine = blockStartLine(content, lineStarts, match.index ?? 0);
		violations.push(
			...offsetViolations(checkStyle(style, { chipGroupExemptClasses }, filename), startLine)
		);
	}

	return uniqueViolations(violations).sort((left, right) => {
		if (left.line !== right.line) return left.line - right.line;
		if (left.rule !== right.rule) return left.rule.localeCompare(right.rule);
		return left.message.localeCompare(right.message);
	});
}
