import {
	createLintPolicy,
	lintViolation,
	type LintMessageValues,
	type LintPolicy,
	type LintRuleId,
	type Violation
} from './lint-policy.js';
import { buildLineIndex, lookupLine, stripCssComments } from './css-scan.js';
import {
	collectDryUiImports,
	collectSvelteScriptBlocks,
	collectSvelteStyleBlocks,
	stripSvelteScriptAndStyleBlocks
} from './svelte-source-facts.js';

export type { Violation } from './lint-policy.js';

const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g;

interface NativeElementRule {
	tag: string;
	component: string;
	allowedDirs: ReadonlySet<string>;
	re: RegExp;
}

const BANNED_COMPONENTS = ['Grid', 'Stack', 'Flex'] as const;

const BANNED_COMPONENT_USAGE_RE = new RegExp(
	`<(${BANNED_COMPONENTS.join('|')})(\\.|\\s|>|\\/)`,
	'g'
);
const BANNED_COMPONENT_SET: ReadonlySet<string> = new Set(BANNED_COMPONENTS);

const INLINE_STYLE_RE = /\bstyle\s*=/g;

const STYLE_DIRECTIVE_RE = /\bstyle:(?:--[-_a-zA-Z0-9]+|[-_a-zA-Z][-_a-zA-Z0-9]*)/g;

const ATTACH_RE = /\{@attach\b/g;

const FLEX_DISPLAY_RE = /display\s*:\s*flex(?![a-z-])/g;

const FLEX_PROPS_RE =
	/(?:^|[;\s{])(?:flex-direction|flex-wrap|flex-grow|flex-shrink|flex-basis|flex)\s*:/gm;

const COMPONENT_CLASS_RE = /<([A-Z][a-zA-Z0-9.]*)[^>]*?\bclass\s*=/gs;

const CSS_IGNORE_RE = /<!--\s*svelte-ignore\s+css_unused_selector\s*-->/g;

const SVELTE_ELEMENT_RE = /<svelte:element(\s|>|\/)/g;

const TRANSCRIPT_ARTIFACT_TAG_RE =
	/<\/?\s*(tool_use|tool_result|tool_calls?|task-notification|task_notification|subagent-notification|subagent_notification|function_calls?|invoke|parameter)\b[^>]*>/gi;

const TRANSCRIPT_ARTIFACT_TOKEN_RE =
	/\b(toolu_[A-Za-z0-9_-]+|mcp__[A-Za-z0-9_]+__[A-Za-z0-9_]+|TaskOutput|TodoWrite)\b/g;

const TRANSCRIPT_CHANNEL_MARKER_RE =
	/(^|[\n>])[ \t]*(assistant|analysis|commentary|final)\s+to=[A-Za-z0-9_.-]+/g;

const WIDTH_RE = /(?:^|[;\s{])(?:(?:max|min)-)?(?:width|inline-size)\s*:\s*([^;}]+)/gm;

// Typographic measure units (ch, ex, em) track text content, not viewport layout.
// e.g. `max-width: 55ch` constrains text column to ~55 characters — allowed.
const MEASURE_UNIT_RE = /(?:^|[^a-zA-Z0-9])-?[\d.]+(ch|ex|em)(?![a-zA-Z0-9])/;
// Disallowed viewport/pixel units that freeze layout at a size breakpoint.
const PIXEL_UNIT_RE =
	/(?:^|[^a-zA-Z0-9])-?[\d.]+(px|rem|vw|vh|%|vmin|vmax|svw|svh|lvw|lvh|dvw|dvh|pt|pc|cm|mm|in)(?![a-zA-Z0-9])/i;
const ALL_UNSET_RE = /(?:^|[;\s{])all\s*:\s*unset(?![a-z-])/gm;
const IMPORTANT_RE = /!important\b/g;

const GLOBAL_SELECTOR_RE = /:global\s*\(/g;

const MEDIA_QUERY_RE = /@media\s+[^{]+\{/g;
const ALLOWED_MEDIA_RE = /prefers-reduced-motion|prefers-color-scheme/;

const FOCUS_RING_LITERAL_RE = /outline\s*:\s*2px\s+solid\s+var\(--dry-color-focus-ring\)/g;

const RAW_GRID_DISPLAY_RE = /display\s*:\s*(?:inline-)?grid(?![a-z-])/g;

const RAW_GRID_PROPS_RE =
	/(?:^|[;\s{])(?:grid|grid-template(?:-(?:columns|rows|areas))?|grid-auto-(?:flow|columns|rows)|grid-(?:column|row|area)(?:-(?:start|end))?)\s*:/gm;

// Directional "rail" inset shadows (exactly one of offset-x/offset-y non-zero,
// blur zero) clip against border-radius and render as a curved bracket.
// Flagged:
//   inset 2px 0 0 <color>   — left rail
//   inset 0 -1px 0 <color>  — bottom rail
//   inset -2px 0 <color>    — right rail (blur omitted, defaults to 0)
// Allowed:
//   inset 0 0 0 1px <color>  — uniform ring (hugs radius)
//   inset 2px 2px 4px <color> — diagonal drop-like shadow with blur
//   inset 0 0 4px <color>     — soft inner glow
const INSET_SHADOW_RE =
	/\binset\s+(-?\d+(?:\.\d+)?)(?:px|em|rem)?\s+(-?\d+(?:\.\d+)?)(?:px|em|rem)?(?:\s+(-?\d+(?:\.\d+)?)(?:px|em|rem)?)?/g;

const NATIVE_ELEMENT_RULE_TAGS: ReadonlySet<string> = new Set([
	'button',
	'dialog',
	'hr',
	'input',
	'select',
	'table',
	'textarea'
]);

const GENERIC_LAYOUT_NAMES: ReadonlySet<string> = new Set([
	'ui',
	'wrapper',
	'box',
	'container',
	'div',
	'block',
	'el',
	'elem',
	'element',
	'layout',
	'inner',
	'outer'
]);

const NATIVE_ELEMENT_RULES: NativeElementRule[] = [
	{
		tag: 'button',
		component: 'Button',
		allowedDirs: new Set([
			'button',
			'mega-menu',
			'tree',
			// Form-control triggers — render as raw <button> styled with the
			// --dry-form-control-* token family so they stay visually consistent
			// with <Input>/<Textarea> (and immune to ambient --dry-btn-* nesting).
			'select',
			'date-picker',
			'date-range-picker'
		]),
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
			'file-select',
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

function addPolicyViolation(
	policy: LintPolicy,
	violations: Violation[],
	ruleId: LintRuleId,
	line: number,
	values: LintMessageValues = {}
): void {
	const violation = policy.violation(ruleId, line, values);
	if (violation) violations.push(violation);
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
		if (boundary && /[A-Za-z0-9.:-]/.test(boundary)) {
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

type AttributeValueKind = 'literal' | 'expression' | 'boolean';

interface ParsedAttribute {
	readonly name: string;
	readonly value: string | null;
	readonly kind: AttributeValueKind;
}

function skipBalancedExpression(input: string, start: number): number {
	let cursor = start;
	let depth = 0;
	let quote: '"' | "'" | '`' | null = null;

	while (cursor < input.length) {
		const char = input[cursor]!;

		if (quote) {
			if (char === quote && input[cursor - 1] !== '\\') quote = null;
			cursor += 1;
			continue;
		}

		if (char === '"' || char === "'" || char === '`') {
			quote = char;
			cursor += 1;
			continue;
		}

		if (char === '{') {
			depth += 1;
			cursor += 1;
			continue;
		}

		if (char === '}') {
			depth -= 1;
			cursor += 1;
			if (depth <= 0) return cursor;
			continue;
		}

		cursor += 1;
	}

	return cursor;
}

function parseOpeningTagAttributes(tagText: string, tagName: string): ParsedAttribute[] {
	let attrs = tagText.trim();
	const prefix = `<${tagName}`;
	if (attrs.startsWith(prefix)) attrs = attrs.slice(prefix.length);
	attrs = attrs.replace(/\/?>\s*$/, '');

	const parsed: ParsedAttribute[] = [];
	let cursor = 0;

	while (cursor < attrs.length) {
		while (cursor < attrs.length && /\s/.test(attrs[cursor]!)) cursor += 1;
		if (cursor >= attrs.length) break;

		if (attrs.startsWith('{...', cursor) || attrs[cursor] === '{') {
			cursor = skipBalancedExpression(attrs, cursor);
			continue;
		}

		const nameStart = cursor;
		while (cursor < attrs.length && !/[\s=>/]/.test(attrs[cursor]!)) cursor += 1;
		const name = attrs.slice(nameStart, cursor);
		if (!name) {
			cursor += 1;
			continue;
		}

		while (cursor < attrs.length && /\s/.test(attrs[cursor]!)) cursor += 1;
		if (attrs[cursor] !== '=') {
			parsed.push({ name, value: null, kind: 'boolean' });
			continue;
		}

		cursor += 1;
		while (cursor < attrs.length && /\s/.test(attrs[cursor]!)) cursor += 1;

		const valueStart = cursor;
		const quote = attrs[cursor];
		if (quote === '"' || quote === "'") {
			cursor += 1;
			const literalStart = cursor;
			while (cursor < attrs.length && attrs[cursor] !== quote) cursor += 1;
			parsed.push({
				name,
				value: attrs.slice(literalStart, cursor),
				kind: 'literal'
			});
			if (cursor < attrs.length) cursor += 1;
			continue;
		}

		if (attrs[cursor] === '{') {
			cursor = skipBalancedExpression(attrs, cursor);
			parsed.push({
				name,
				value: attrs.slice(valueStart, cursor),
				kind: 'expression'
			});
			continue;
		}

		while (cursor < attrs.length && !/\s/.test(attrs[cursor]!)) cursor += 1;
		parsed.push({
			name,
			value: attrs.slice(valueStart, cursor),
			kind: 'literal'
		});
	}

	return parsed;
}

function attributeByName(attrs: readonly ParsedAttribute[], name: string): ParsedAttribute | null {
	return attrs.find((attr) => attr.name === name) ?? null;
}

function isSvelteComponentTag(tagName: string): boolean {
	return /^[A-Z]/.test(tagName) || tagName.includes('.');
}

const COMPONENT_ONLY_ALLOWED_TAGS: ReadonlySet<string> = new Set(['slot']);

function isComponentOnlyAllowedTag(tagName: string): boolean {
	return (
		isSvelteComponentTag(tagName) ||
		tagName.startsWith('svelte:') ||
		COMPONENT_ONLY_ALLOWED_TAGS.has(tagName)
	);
}

function hasLayoutHook(attrs: readonly ParsedAttribute[]): boolean {
	return (
		attributeByName(attrs, 'data-layout') !== null ||
		attributeByName(attrs, 'data-layout-area') !== null
	);
}

interface AttributedTagMatch extends TagMatch {
	readonly tagName: string;
	readonly attrs: ParsedAttribute[];
}

function findAllOpeningTags(content: string): AttributedTagMatch[] {
	const matches: AttributedTagMatch[] = [];
	let index = 0;

	while (index < content.length) {
		const tagIndex = content.indexOf('<', index);
		if (tagIndex === -1) break;

		if (content.startsWith('<!--', tagIndex)) {
			const commentEnd = content.indexOf('-->', tagIndex + 4);
			index = commentEnd === -1 ? content.length : commentEnd + 3;
			continue;
		}

		const next = content[tagIndex + 1];
		if (!next || next === '/' || next === '!' || next === '?') {
			index = tagIndex + 1;
			continue;
		}

		const tagNameMatch = /^<([A-Za-z][A-Za-z0-9.:-]*)/.exec(content.slice(tagIndex));
		const tagName = tagNameMatch?.[1];
		if (!tagName) {
			index = tagIndex + 1;
			continue;
		}

		let cursor = tagIndex + tagName.length + 1;
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

		const text = content.slice(tagIndex, cursor);
		const attrs = parseOpeningTagAttributes(text, tagName);
		matches.push({
			index: tagIndex,
			text,
			tagName,
			attrs
		});

		index = cursor;
	}

	return matches;
}

export function checkScript(content: string): Violation[] {
	const violations: Violation[] = [];
	const lineStarts = buildLineIndex(content);
	const lines = content.split('\n');
	const policy = createLintPolicy({ target: 'script' });

	if (policy.isRuleEnabled('dryui/no-layout-component')) {
		for (const dryImport of collectDryUiImports(content)) {
			if (dryImport.source !== '@dryui/ui') continue;
			if (!BANNED_COMPONENT_SET.has(dryImport.name)) continue;
			const lineText = lines[dryImport.line - 1] ?? '';
			if (!lineText.includes('@dryui/ui')) continue;
			addPolicyViolation(policy, violations, 'dryui/no-layout-component', dryImport.line, {
				action: 'import',
				target: dryImport.name,
				guidance: 'data-layout hooks with src/layout.css instead'
			});
		}
	}

	// project/theme-import-order is a correctness rule; the `project/` prefix
	// routes it to the catalog entry `theme-import-order`.
	if (policy.isRuleEnabled('project/theme-import-order')) {
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
		// Rule id uses the `project/` prefix to align with project-scoped findings
		// in workspace-audit (e.g. `project/missing-theme-import`).
		lintViolation('project/theme-import-order', localImport.line)
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

const SVELTE_HEAD_BLOCK_RE = /<svelte:head\b[^>]*>[\s\S]*?<\/svelte:head>/gi;

function blankPreservingLayout(content: string): string {
	let out = '';
	for (let i = 0; i < content.length; i++) {
		out += content.charCodeAt(i) === 10 /* \n */ ? '\n' : ' ';
	}
	return out;
}

export function stripBlocks(content: string): string {
	return stripSvelteScriptAndStyleBlocks(content);
}

function stripSvelteHeadBlocks(content: string): string {
	return content.replace(SVELTE_HEAD_BLOCK_RE, blankPreservingLayout);
}

function stripHtmlComments(content: string): string {
	return content.replace(HTML_COMMENT_RE, blankPreservingLayout);
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

function nativeElementViolationValues(rule: NativeElementRule): LintMessageValues {
	return {
		tag: rule.tag,
		component: rule.component,
		closing: rule.tag === 'hr' ? ' /' : ''
	};
}

interface TranscriptArtifactMatch {
	readonly index: number;
	readonly artifact: string;
}

function collectTranscriptArtifactMatches(content: string): TranscriptArtifactMatch[] {
	const matches: TranscriptArtifactMatch[] = [];

	for (const match of content.matchAll(TRANSCRIPT_ARTIFACT_TAG_RE)) {
		const tagName = match[1] ?? 'transcript tag';
		matches.push({
			index: match.index ?? 0,
			artifact: `<${tagName.toLowerCase()}>`
		});
	}

	for (const match of content.matchAll(TRANSCRIPT_ARTIFACT_TOKEN_RE)) {
		const token = match[1] ?? 'transcript token';
		matches.push({
			index: match.index ?? 0,
			artifact: token.startsWith('toolu_')
				? 'toolu_*'
				: token.startsWith('mcp__')
					? 'mcp__*'
					: token
		});
	}

	for (const match of content.matchAll(TRANSCRIPT_CHANNEL_MARKER_RE)) {
		matches.push({
			index: (match.index ?? 0) + (match[1]?.length ?? 0),
			artifact: `${match[2] ?? 'assistant'} to=...`
		});
	}

	return matches.sort((left, right) => left.index - right.index);
}

export function checkMarkup(content: string, filename?: string): Violation[] {
	const violations: Violation[] = [];
	const markup = stripBlocks(content);
	const executableMarkup = stripHtmlComments(markup);
	const parentDir = getParentDir(filename);
	const lineStarts = buildLineIndex(markup);
	const lineOf = (i: number) => lookupLine(lineStarts, i);
	const policy = createLintPolicy({ target: 'markup', filename, source: markup });

	if (policy.isRuleEnabled('dryui/no-inline-style')) {
		for (const match of markup.matchAll(INLINE_STYLE_RE)) {
			addPolicyViolation(policy, violations, 'dryui/no-inline-style', lineOf(match.index));
		}
	}

	if (policy.isRuleEnabled('dryui/no-style-directive')) {
		for (const match of markup.matchAll(STYLE_DIRECTIVE_RE)) {
			addPolicyViolation(policy, violations, 'dryui/no-style-directive', lineOf(match.index));
		}
	}

	if (policy.isRuleEnabled('dryui/no-attach')) {
		for (const match of executableMarkup.matchAll(ATTACH_RE)) {
			addPolicyViolation(policy, violations, 'dryui/no-attach', lineOf(match.index));
		}
	}

	if (policy.isRuleEnabled('dryui/no-raw-element')) {
		const componentOnlyMarkup = stripSvelteHeadBlocks(markup);
		for (const tag of findAllOpeningTags(componentOnlyMarkup)) {
			if (isComponentOnlyAllowedTag(tag.tagName)) continue;
			if (hasLayoutHook(tag.attrs)) continue;
			// Tags with a more specific rule (anchor, NATIVE_ELEMENT_RULES) get
			// targeted guidance from those rules instead of a generic ban.
			if (tag.tagName === 'a' || NATIVE_ELEMENT_RULE_TAGS.has(tag.tagName)) continue;
			addPolicyViolation(policy, violations, 'dryui/no-raw-element', lineOf(tag.index), {
				tag: tag.tagName
			});
		}
	}

	if (policy.isRuleEnabled('dryui/no-generic-layout-name')) {
		for (const tag of findAllOpeningTags(markup)) {
			const dataLayout = attributeByName(tag.attrs, 'data-layout');
			if (!dataLayout || dataLayout.kind !== 'literal' || dataLayout.value === null) continue;
			const value = dataLayout.value.trim().toLowerCase();
			if (!value || !GENERIC_LAYOUT_NAMES.has(value)) continue;
			addPolicyViolation(policy, violations, 'dryui/no-generic-layout-name', lineOf(tag.index), {
				value
			});
		}
	}

	if (policy.isRuleEnabled('dryui/no-layout-component')) {
		for (const match of markup.matchAll(BANNED_COMPONENT_USAGE_RE)) {
			const comp = match[1];
			addPolicyViolation(policy, violations, 'dryui/no-layout-component', lineOf(match.index), {
				action: 'use',
				target: `<${comp}>`,
				guidance: 'data-layout hooks with src/layout.css instead'
			});
		}
	}

	if (policy.isRuleEnabled('dryui/no-component-class')) {
		for (const match of markup.matchAll(COMPONENT_CLASS_RE)) {
			const comp = match[1] ?? 'Component';
			addPolicyViolation(policy, violations, 'dryui/no-component-class', lineOf(match.index), {
				component: comp
			});
		}
	}

	if (policy.isRuleEnabled('dryui/no-css-ignore')) {
		for (const match of markup.matchAll(CSS_IGNORE_RE)) {
			addPolicyViolation(policy, violations, 'dryui/no-css-ignore', lineOf(match.index));
		}
	}

	if (policy.isRuleEnabled('dryui/no-transcript-artifact')) {
		const reportedLines = new Set<number>();
		for (const match of collectTranscriptArtifactMatches(executableMarkup)) {
			const line = lineOf(match.index);
			if (reportedLines.has(line)) continue;
			reportedLines.add(line);
			addPolicyViolation(policy, violations, 'dryui/no-transcript-artifact', line, {
				artifact: match.artifact
			});
		}
	}

	if (policy.isRuleEnabled('dryui/no-svelte-element')) {
		for (const match of markup.matchAll(SVELTE_ELEMENT_RE)) {
			addPolicyViolation(policy, violations, 'dryui/no-svelte-element', lineOf(match.index));
		}
	}

	if (policy.isRuleEnabled('dryui/no-anchor-without-href')) {
		for (const tag of findOpeningTags(markup, 'a')) {
			if (anchorHasHref(tag.text)) continue;
			addPolicyViolation(policy, violations, 'dryui/no-anchor-without-href', lineOf(tag.index));
		}
	}

	if (policy.isRuleEnabled('dryui/no-raw-native-element')) {
		for (const rule of NATIVE_ELEMENT_RULES) {
			if (rule.allowedDirs.has(parentDir)) continue;

			for (const match of markup.matchAll(rule.re)) {
				addPolicyViolation(
					policy,
					violations,
					'dryui/no-raw-native-element',
					lineOf(match.index),
					nativeElementViolationValues(rule)
				);
			}
		}
	}

	return violations;
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
	filename?: string
): Violation[] {
	const violations: Violation[] = [];
	// `scan` has comments blanked out (length-preserving) so rule regexes don't
	// flag property names that appear in prose comments like
	// `/* flex-wrap is the sanctioned primitive */`.
	const scan = stripCssComments(content);
	const lineStarts = buildLineIndex(content);
	const lineOf = (i: number) => lookupLine(lineStarts, i);
	const exemptClasses = context.chipGroupExemptClasses ?? new Set<string>();
	const inChipGroupScope = (idx: number): boolean =>
		selectorIsChipGroupExempt(selectorAtOffset(scan, idx), exemptClasses);
	const policy = createLintPolicy({ target: 'style', filename, source: content });

	if (policy.isRuleEnabled('dryui/no-raw-grid')) {
		for (const match of scan.matchAll(RAW_GRID_DISPLAY_RE)) {
			addPolicyViolation(policy, violations, 'dryui/no-raw-grid', lineOf(match.index), {
				value: match[0].trim()
			});
		}

		for (const match of scan.matchAll(RAW_GRID_PROPS_RE)) {
			const prop = match[0].trim().replace(/;$/, '').split(':')[0]!.trim();
			addPolicyViolation(policy, violations, 'dryui/no-raw-grid', lineOf(match.index), {
				value: prop
			});
		}
	}

	if (policy.isRuleEnabled('dryui/no-flex')) {
		for (const match of scan.matchAll(FLEX_DISPLAY_RE)) {
			if (inChipGroupScope(match.index)) continue;
			addPolicyViolation(policy, violations, 'dryui/no-flex', lineOf(match.index), {
				value: 'display: flex',
				guidance: 'display: grid, or move page-level flex to src/layout.css'
			});
		}

		for (const match of scan.matchAll(FLEX_PROPS_RE)) {
			if (inChipGroupScope(match.index)) continue;
			const prop = match[0].trim().replace(/;/, '').split(':')[0]!.trim();
			addPolicyViolation(policy, violations, 'dryui/no-flex', lineOf(match.index), {
				value: prop,
				guidance: 'CSS grid equivalents, or move page-level flex to src/layout.css'
			});
		}
	}

	if (policy.isRuleEnabled('dryui/no-width')) {
		for (const match of scan.matchAll(WIDTH_RE)) {
			const rawValue = (match[1] ?? '').trim();
			// Allow typographic measure units (ch, ex, em) — they track text content,
			// not viewport layout. e.g. `max-width: 55ch` constrains text columns.
			// Reject if the value also contains pixel/viewport units (mixed calcs stay banned).
			if (MEASURE_UNIT_RE.test(rawValue) && !PIXEL_UNIT_RE.test(rawValue)) continue;
			addPolicyViolation(policy, violations, 'dryui/no-width', lineOf(match.index));
		}
	}

	if (policy.isRuleEnabled('dryui/no-all-unset')) {
		for (const match of scan.matchAll(ALL_UNSET_RE)) {
			addPolicyViolation(policy, violations, 'dryui/no-all-unset', lineOf(match.index));
		}
	}

	if (policy.isRuleEnabled('dryui/no-important')) {
		for (const match of scan.matchAll(IMPORTANT_RE)) {
			addPolicyViolation(policy, violations, 'dryui/no-important', lineOf(match.index));
		}
	}

	if (policy.isRuleEnabled('dryui/no-global')) {
		for (const match of scan.matchAll(GLOBAL_SELECTOR_RE)) {
			addPolicyViolation(policy, violations, 'dryui/no-global', lineOf(match.index));
		}
	}

	if (policy.isRuleEnabled('dryui/no-media-sizing')) {
		for (const match of scan.matchAll(MEDIA_QUERY_RE)) {
			const query = match[0];
			if (!ALLOWED_MEDIA_RE.test(query)) {
				addPolicyViolation(policy, violations, 'dryui/no-media-sizing', lineOf(match.index));
			}
		}
	}

	if (policy.isRuleEnabled('dryui/prefer-focus-ring-token')) {
		for (const match of scan.matchAll(FOCUS_RING_LITERAL_RE)) {
			addPolicyViolation(policy, violations, 'dryui/prefer-focus-ring-token', lineOf(match.index));
		}
	}

	if (policy.isRuleEnabled('dryui/no-partial-inset-shadow') && scan.includes('inset')) {
		for (const match of scan.matchAll(INSET_SHADOW_RE)) {
			const x = parseFloat(match[1]!);
			const y = parseFloat(match[2]!);
			const blur = match[3] !== undefined ? parseFloat(match[3]) : 0;
			if (blur !== 0) continue;
			const xNonZero = x !== 0;
			const yNonZero = y !== 0;
			if (xNonZero !== yNonZero) {
				addPolicyViolation(
					policy,
					violations,
					'dryui/no-partial-inset-shadow',
					lineOf(match.index)
				);
			}
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

export interface SvelteFileCheckOptions {}

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

export function checkSvelteFile(
	content: string,
	filename?: string,
	_options: SvelteFileCheckOptions = {}
): Violation[] {
	const violations: Violation[] = [...checkMarkup(content, filename)];
	const chipGroupExemptClasses = collectChipGroupClasses(content);

	for (const block of collectSvelteScriptBlocks(content)) {
		violations.push(...offsetViolations(checkScript(block.content), block.line));
	}

	for (const block of collectSvelteStyleBlocks(content)) {
		violations.push(
			...offsetViolations(
				checkStyle(block.content, { chipGroupExemptClasses }, filename),
				block.line
			)
		);
	}

	return uniqueViolations(violations).sort((left, right) => {
		if (left.line !== right.line) return left.line - right.line;
		if (left.rule !== right.rule) return left.rule.localeCompare(right.rule);
		return left.message.localeCompare(right.message);
	});
}
