export interface Violation {
	rule: string;
	message: string;
	line: number;
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

const WIDTH_RE = /(?:^|[;\s{])(?:(?:max|min)-)?(?:width|inline-size)\s*:/gm;

const GLOBAL_SELECTOR_RE = /:global\s*\(/g;

const MEDIA_QUERY_RE = /@media\s+[^{]+\{/g;
const ALLOWED_MEDIA_RE = /prefers-reduced-motion|prefers-color-scheme/;

function getLine(content: string, index: number): number {
	return content.slice(0, index).split('\n').length;
}

export function checkScript(content: string): Violation[] {
	const violations: Violation[] = [];

	for (const match of content.matchAll(BANNED_COMPONENT_IMPORT_RE)) {
		const line = getLine(content, match.index);
		const lineText = content.split('\n')[line - 1] ?? '';
		for (const comp of BANNED_COMPONENTS) {
			if (new RegExp(`\\b${comp}\\b`).test(lineText) && lineText.includes('@dryui/ui')) {
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

function stripBlocks(content: string): string {
	return content
		.replace(/<script[\s>][\s\S]*?<\/script>/gi, (m) => '\n'.repeat(m.split('\n').length - 1))
		.replace(/<style[\s>][\s\S]*?<\/style>/gi, (m) => '\n'.repeat(m.split('\n').length - 1));
}

export function checkMarkup(content: string): Violation[] {
	const violations: Violation[] = [];
	const markup = stripBlocks(content);

	for (const match of markup.matchAll(INLINE_STYLE_RE)) {
		violations.push({
			rule: 'dryui/no-inline-style',
			message: 'No inline style attributes. Use scoped CSS with custom properties.',
			line: getLine(markup, match.index)
		});
	}

	for (const match of markup.matchAll(STYLE_DIRECTIVE_RE)) {
		violations.push({
			rule: 'dryui/no-style-directive',
			message: 'No style: directives. Use scoped CSS with custom properties.',
			line: getLine(markup, match.index)
		});
	}

	for (const match of markup.matchAll(BANNED_COMPONENT_USAGE_RE)) {
		const comp = match[1];
		violations.push({
			rule: 'dryui/no-layout-component',
			message: `Do not use <${comp}>. Use raw CSS grid with custom properties instead.`,
			line: getLine(markup, match.index)
		});
	}

	for (const match of markup.matchAll(COMPONENT_CLASS_RE)) {
		const comp = match[1];
		violations.push({
			rule: 'dryui/no-component-class',
			message: `Do not pass class= to <${comp}>. Svelte components ignore class attributes. Use --dry-* CSS custom properties for styling overrides.`,
			line: getLine(markup, match.index)
		});
	}

	for (const match of markup.matchAll(CSS_IGNORE_RE)) {
		violations.push({
			rule: 'dryui/no-css-ignore',
			message:
				'Do not use <!-- svelte-ignore css_unused_selector -->. Fix the underlying CSS issue instead of suppressing the warning.',
			line: getLine(markup, match.index)
		});
	}

	return violations;
}

function hasAllowComment(
	lines: string[],
	content: string,
	matchIndex: number,
	keyword: string
): boolean {
	// Skip leading non-alpha chars (regex may capture a delimiter on the prior line)
	let idx = matchIndex;
	while (idx < content.length && /[^a-zA-Z]/.test(content[idx]!)) idx++;
	const declLine = getLine(content, idx);
	if (declLine <= 1) return false;
	const prevLine = lines[declLine - 2] ?? '';
	return prevLine.includes(`dryui-allow ${keyword}`);
}

export function checkStyle(content: string): Violation[] {
	const violations: Violation[] = [];
	const lines = content.split('\n');

	for (const match of content.matchAll(FLEX_DISPLAY_RE)) {
		if (hasAllowComment(lines, content, match.index, 'flex')) continue;
		violations.push({
			rule: 'dryui/no-flex',
			message: 'Do not use display: flex. Use display: grid instead.',
			line: getLine(content, match.index)
		});
	}

	for (const match of content.matchAll(FLEX_PROPS_RE)) {
		if (hasAllowComment(lines, content, match.index, 'flex')) continue;
		const prop = match[0].trim().replace(/;/, '').split(':')[0]!.trim();
		violations.push({
			rule: 'dryui/no-flex',
			message: `Do not use ${prop}. Use CSS grid equivalents instead.`,
			line: getLine(content, match.index)
		});
	}

	for (const match of content.matchAll(WIDTH_RE)) {
		violations.push({
			rule: 'dryui/no-width',
			message:
				'Do not use width/inline-size (including max-/min- variants). Grid children are sized by their track. Use grid-template-columns or grid-template-rows instead.',
			line: getLine(content, match.index)
		});
	}

	for (const match of content.matchAll(GLOBAL_SELECTOR_RE)) {
		violations.push({
			rule: 'dryui/no-global',
			message:
				'Do not use :global(). Use scoped styles, data-* attributes, CSS variables, or component props instead.',
			line: getLine(content, match.index)
		});
	}

	for (const match of content.matchAll(MEDIA_QUERY_RE)) {
		const query = match[0];
		if (!ALLOWED_MEDIA_RE.test(query)) {
			violations.push({
				rule: 'dryui/no-media-sizing',
				message:
					'Do not use @media for sizing. Use @container queries instead. @media is only allowed for prefers-reduced-motion and prefers-color-scheme.',
				line: getLine(content, match.index)
			});
		}
	}

	return violations;
}
