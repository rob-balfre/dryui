import path from 'node:path';

export interface Violation {
	rule: string;
	message: string;
	line: number;
}

interface NativeElementRule {
	tag: string;
	component: string;
	allowedDirs: ReadonlySet<string>;
	re: RegExp;
}

const BANNED_COMPONENTS = ['Grid', 'Stack', 'Flex'];

const BANNED_COMPONENT_IMPORT_RE = new RegExp(
	`\\b(${BANNED_COMPONENTS.join('|')})\\b.*from\\s+['"]@dryui/ui`,
	'g'
);

const BANNED_COMPONENT_USAGE_RE = new RegExp(
	`<(${BANNED_COMPONENTS.join('|')})(\\.|\\s|>|\\/)`,
	'g'
);

const INLINE_STYLE_RE = /\bstyle\s*=/g;

const STYLE_DIRECTIVE_RE = /\bstyle:\w+/g;

const FLEX_DISPLAY_RE = /display\s*:\s*flex(?![a-z-])/g;

const FLEX_PROPS_RE =
	/(?:^|[;\s{])(?:flex-direction|flex-wrap|flex-grow|flex-shrink|flex-basis|flex)\s*:/gm;

const COMPONENT_CLASS_RE = /<([A-Z][a-zA-Z0-9.]*)[^>]*?\bclass\s*=/gs;

const CSS_IGNORE_RE = /<!--\s*svelte-ignore\s+css_unused_selector\s*-->/g;

const SVELTE_ELEMENT_RE = /<svelte:element(\s|>|\/)/g;

const WIDTH_RE = /(?:^|[;\s{])(?:(?:max|min)-)?(?:width|inline-size)\s*:/gm;
const ALL_UNSET_RE = /(?:^|[;\s{])all\s*:\s*unset(?![a-z-])/gm;

const GLOBAL_SELECTOR_RE = /:global\s*\(/g;

const MEDIA_QUERY_RE = /@media\s+[^{]+\{/g;
const ALLOWED_MEDIA_RE = /prefers-reduced-motion|prefers-color-scheme/;

const NATIVE_ELEMENT_RULES: NativeElementRule[] = [
	{
		tag: 'button',
		component: 'Button',
		allowedDirs: new Set(['button', 'card', 'mega-menu']),
		re: /<button(\s|>|\/)/g
	},
	{
		tag: 'dialog',
		component: 'Dialog',
		allowedDirs: new Set(['dialog', 'alert-dialog', 'drawer', 'command-palette']),
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
			'country-select',
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

	for (const match of content.matchAll(BANNED_COMPONENT_IMPORT_RE)) {
		const line = lookupLine(lineStarts, match.index);
		const lineText = lines[line - 1] ?? '';
		if (!lineText.includes('@dryui/ui')) continue;
		for (const comp of BANNED_COMPONENTS) {
			if (new RegExp(`\\b${comp}\\b`).test(lineText)) {
				violations.push({
					rule: 'dryui/no-layout-component',
					message: `Do not import ${comp}. Use raw CSS grid with custom properties instead.`,
					line
				});
			}
		}
	}

	const seen = new Set<string>();
	return violations.filter((v) => {
		const key = `${v.line}:${v.message}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

const SCRIPT_OR_STYLE_BLOCK_RE = /<(?:script|style)[\s>][\s\S]*?<\/(?:script|style)>/gi;

function stripBlocks(content: string): string {
	return content.replace(SCRIPT_OR_STYLE_BLOCK_RE, (m) => {
		let count = 0;
		for (let i = 0; i < m.length; i++) {
			if (m.charCodeAt(i) === 10 /* \n */) count++;
		}
		return '\n'.repeat(count);
	});
}

function getParentDir(filename?: string): string {
	if (!filename) return '';
	return path.basename(path.dirname(filename)).toLowerCase();
}

function createNativeElementMessage(rule: NativeElementRule): string {
	const closing = rule.tag === 'hr' ? ' /' : '';
	return `Raw <${rule.tag}> is only allowed inside its canonical component directory. Use <${rule.component}${closing}> elsewhere.`;
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

	for (const match of markup.matchAll(INLINE_STYLE_RE)) {
		violations.push({
			rule: 'dryui/no-inline-style',
			message: 'No inline style attributes. Use scoped CSS with custom properties.',
			line: lineOf(match.index)
		});
	}

	for (const match of markup.matchAll(STYLE_DIRECTIVE_RE)) {
		violations.push({
			rule: 'dryui/no-style-directive',
			message: 'No style: directives. Use scoped CSS with custom properties.',
			line: lineOf(match.index)
		});
	}

	for (const match of markup.matchAll(BANNED_COMPONENT_USAGE_RE)) {
		const comp = match[1];
		violations.push({
			rule: 'dryui/no-layout-component',
			message: `Do not use <${comp}>. Use raw CSS grid with custom properties instead.`,
			line: lineOf(match.index)
		});
	}

	for (const match of markup.matchAll(COMPONENT_CLASS_RE)) {
		const comp = match[1];
		violations.push({
			rule: 'dryui/no-component-class',
			message: `Do not pass class= to <${comp}>. Svelte components ignore class attributes. Use --dry-* CSS custom properties for styling overrides.`,
			line: lineOf(match.index)
		});
	}

	for (const match of markup.matchAll(CSS_IGNORE_RE)) {
		violations.push({
			rule: 'dryui/no-css-ignore',
			message:
				'Do not use <!-- svelte-ignore css_unused_selector -->. Fix the underlying CSS issue instead of suppressing the warning.',
			line: lineOf(match.index)
		});
	}

	for (const match of markup.matchAll(SVELTE_ELEMENT_RE)) {
		if (hasAllowComment(file, match.index, 'svelte-element')) continue;
		violations.push({
			rule: 'dryui/no-svelte-element',
			message:
				'Do not use <svelte:element this={x}>. Use explicit {#if}/{:else} branches with concrete tags so element-specific styles and semantics are visible in source. Add <!-- dryui-allow svelte-element --> on the preceding line for legitimate cases (e.g., h1–h6 headings).',
			line: lineOf(match.index)
		});
	}

	for (const tag of findOpeningTags(markup, 'a')) {
		if (anchorHasHref(tag.text)) continue;
		violations.push({
			rule: 'dryui/no-anchor-without-href',
			message:
				'Do not use <a> without href. Use <button> for actions, or provide href for navigation.',
			line: lineOf(tag.index)
		});
	}

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

export function checkStyle(content: string): Violation[] {
	const violations: Violation[] = [];
	const file: FileContext = {
		content,
		lines: content.split('\n'),
		lineStarts: buildLineIndex(content)
	};
	const lineOf = (i: number) => lookupLine(file.lineStarts, i);

	for (const match of content.matchAll(FLEX_DISPLAY_RE)) {
		if (hasAllowComment(file, match.index, 'flex')) continue;
		violations.push({
			rule: 'dryui/no-flex',
			message: 'Do not use display: flex. Use display: grid instead.',
			line: lineOf(match.index)
		});
	}

	for (const match of content.matchAll(FLEX_PROPS_RE)) {
		if (hasAllowComment(file, match.index, 'flex')) continue;
		const prop = match[0].trim().replace(/;/, '').split(':')[0]!.trim();
		violations.push({
			rule: 'dryui/no-flex',
			message: `Do not use ${prop}. Use CSS grid equivalents instead.`,
			line: lineOf(match.index)
		});
	}

	for (const match of content.matchAll(WIDTH_RE)) {
		violations.push({
			rule: 'dryui/no-width',
			message:
				'Do not use width/inline-size (including max-/min- variants). Grid children are sized by their track. Use grid-template-columns or grid-template-rows instead.',
			line: lineOf(match.index)
		});
	}

	for (const match of content.matchAll(ALL_UNSET_RE)) {
		violations.push({
			rule: 'dryui/no-all-unset',
			message: 'Do not use all: unset. Reset only the specific properties you need.',
			line: lineOf(match.index)
		});
	}

	for (const match of content.matchAll(GLOBAL_SELECTOR_RE)) {
		violations.push({
			rule: 'dryui/no-global',
			message:
				'Do not use :global(). Use scoped styles, data-* attributes, CSS variables, or component props instead.',
			line: lineOf(match.index)
		});
	}

	for (const match of content.matchAll(MEDIA_QUERY_RE)) {
		const query = match[0];
		if (!ALLOWED_MEDIA_RE.test(query)) {
			violations.push({
				rule: 'dryui/no-media-sizing',
				message:
					'Do not use @media for sizing. Use @container queries instead. @media is only allowed for prefers-reduced-motion and prefers-color-scheme.',
				line: lineOf(match.index)
			});
		}
	}

	return violations;
}
