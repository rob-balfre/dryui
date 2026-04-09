// DryUI Component Code Review Engine
// Pure string/regex parsing — no Svelte compiler required.

import { buildLineOffsets, lineAtOffset } from './utils.js';

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

// Phase 1: Extract

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

function extractTags(code: string): TagInfo[] {
	// Build template by stripping <script> and <style> blocks.
	const template = code
		.replace(/<script[^>]*>[\s\S]*?<\/script>/g, (m) => '\n'.repeat(countNewlines(m)))
		.replace(/<style[^>]*>[\s\S]*?<\/style>/g, (m) => '\n'.repeat(countNewlines(m)));

	// Pre-compute cumulative line offsets for the full code.
	const lineOffsets = buildLineOffsets(code);

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

// Prop allowlist check

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

// Phase 2: Spec Compliance Checks (severity: "error")

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
				message: `<${tag.name}> is a compound component \u2014 use <${tag.name}.Root>`,
				fix: `<${tag.name}.Root>`
			});
			continue;
		}

		issues.push({
			severity: 'error',
			code: 'bare-compound',
			line: tag.line,
			message: `<${tag.name}> is a namespaced component \u2014 use a part like <${tag.name}.${firstPart ?? 'Text'}>`,
			fix: `<${tag.name}.${firstPart ?? 'Text'}>`
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
				message: `<${tag.name}> is not a known DryUI component`,
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
				message: `<${root}.${part}> \u2014 "${part}" is not a valid part of ${root}. Valid parts: ${validParts.join(', ')}`,
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
					message: `<${tag.name}> does not accept prop "${checkName}"`,
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
					message: `<${tag.name}> is missing required prop "${propName}"`,
					fix: `${propName}={...}`
				});
			}
		}
	}
	return issues;
}

// Phase 3: Structural Checks (severity: "warning")

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
				severity: 'warning',
				code: 'orphaned-part',
				line: tag.line,
				message: `<${tag.name}> used without <${root}.Root> in the template`,
				fix: `Wrap in <${root}.Root>`
			});
		}
	}
	return issues;
}

function checkMissingLabel(tags: TagInfo[], code: string): Issue[] {
	const issues: Issue[] = [];

	// Strip <script> and <style> blocks to get the template portion.
	const template = code
		.replace(/<script[^>]*>[\s\S]*?<\/script>/g, (m) => '\n'.repeat(countNewlines(m)))
		.replace(/<style[^>]*>[\s\S]*?<\/style>/g, (m) => '\n'.repeat(countNewlines(m)));

	const lineOffsets = buildLineOffsets(code);

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
				severity: 'warning',
				code: 'missing-label',
				line: tag.line,
				message: `<${tag.name}> may be missing an accessible label \u2014 add aria-label or wrap in <Field.Root> with <Label>`,
				fix: 'aria-label="..."'
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

function checkMissingThumbnail(
	imports: Set<string>,
	spec: { components: Record<string, ComponentDef>; thumbnails?: string[] }
): Issue[] {
	if (!spec.thumbnails) return [];
	const issues: Issue[] = [];
	const thumbnailSet = new Set(spec.thumbnails);

	for (const name of imports) {
		if (!spec.components[name]) continue;
		if (!thumbnailSet.has(name)) {
			issues.push({
				severity: 'warning',
				code: 'missing-thumbnail',
				line: 1,
				message: `Component '${name}' has no SVG thumbnail — run 'bun run thumbnail:create ${name}'`,
				fix: null
			});
		}
	}
	return issues;
}

function checkImageWithoutAlt(tags: TagInfo[]): Issue[] {
	const issues: Issue[] = [];
	for (const tag of tags) {
		if (tag.name !== 'Avatar') continue;
		const hasAlt = tag.props.includes('alt');
		const hasFallback = tag.props.includes('fallback');
		if (!hasAlt && !hasFallback) {
			issues.push({
				severity: 'warning',
				code: 'missing-alt',
				line: tag.line,
				message: '<Avatar> is missing "alt" and "fallback" props for accessibility',
				fix: 'alt="..."'
			});
		}
	}
	return issues;
}

function checkCustomFlexLayout(styles: string, code: string): Issue[] {
	const issues: Issue[] = [];
	if (/display:\s*(?:inline-)?flex/.test(styles)) {
		const startLine = getStyleBlockStartLine(code);
		const localLine = findLineInBlock(styles, /display:\s*(?:inline-)?flex/);
		issues.push({
			severity: 'warning',
			code: 'prefer-grid-layout',
			line: styleLineToFileLine(localLine, startLine),
			message:
				'Use scoped CSS grid instead of flexbox. DryUI layout standard is raw grid with --dry-space-* gaps, Container for constrained width, and @container queries for responsiveness.',
			fix: 'display: grid'
		});
	}
	return issues;
}

function checkCustomFieldMarkup(code: string): Issue[] {
	const issues: Issue[] = [];
	// Strip <script> and <style> blocks to only scan template.
	const template = code
		.replace(/<script[^>]*>[\s\S]*?<\/script>/g, (m) => '\n'.repeat(countNewlines(m)))
		.replace(/<style[^>]*>[\s\S]*?<\/style>/g, (m) => '\n'.repeat(countNewlines(m)));

	const lineOffsets = buildLineOffsets(code);

	// Check for class="field" or class='field'
	const fieldClassRegex = /class=["']field["']/g;
	let match: RegExpExecArray | null;

	while ((match = fieldClassRegex.exec(template)) !== null) {
		const line = lineAtOffset(lineOffsets, match.index);
		issues.push({
			severity: 'warning',
			code: 'use-field-component',
			line,
			message:
				'Use <Field.Root> + <Label> instead of custom field markup. Field provides accessible labeling, error states, and consistent spacing.',
			fix: '<Field.Root> + <Label>'
		});
	}

	// Check for <span> followed by <input, <select, or <textarea (manual label+input pairing)
	const manualFieldRegex = /<span[^>]*>[\s\S]*?<\/span>\s*<(?:input|select|textarea)[\s/>]/g;

	while ((match = manualFieldRegex.exec(template)) !== null) {
		const line = lineAtOffset(lineOffsets, match.index);
		issues.push({
			severity: 'warning',
			code: 'use-field-component',
			line,
			message:
				'Use <Field.Root> + <Label> instead of custom field markup. Field provides accessible labeling, error states, and consistent spacing.',
			fix: '<Field.Root> + <Label>'
		});
	}

	return issues;
}

function checkRawStyledButton(code: string): Issue[] {
	const issues: Issue[] = [];
	// Strip <script> and <style> blocks to only scan template.
	const template = code
		.replace(/<script[^>]*>[\s\S]*?<\/script>/g, (m) => '\n'.repeat(countNewlines(m)))
		.replace(/<style[^>]*>[\s\S]*?<\/style>/g, (m) => '\n'.repeat(countNewlines(m)));

	const lineOffsets = buildLineOffsets(code);
	const rawBtnRegex = /<button\s[^>]*class=/g;
	let match: RegExpExecArray | null;

	while ((match = rawBtnRegex.exec(template)) !== null) {
		const line = lineAtOffset(lineOffsets, match.index);
		issues.push({
			severity: 'warning',
			code: 'use-button-component',
			line,
			message:
				"Use DryUI's <Button> component instead of raw <button> with custom classes. Button provides variants, sizes, loading states, and theme-consistent styling.",
			fix: '<Button>'
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
			severity: 'warning',
			code: 'use-container-component',
			line: styleLineToFileLine(localLine, startLine),
			message: "Use DryUI's <Container> component instead of custom max-width + margin centering.",
			fix: '<Container>'
		});
	}
	return issues;
}

// Phase 4: Style Suggestions (severity: "suggestion")

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
			message:
				'Hardcoded color value \u2014 consider using `--dry-*` CSS custom properties for theming',
			fix: 'var(--dry-*)'
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
			message:
				'Manual centering with max-width + margin auto \u2014 consider using <Container> instead',
			fix: '<Container>'
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
			message:
				'Custom --dry-* variable overrides detected in <style> \u2014 run the `diagnose` tool on your theme CSS for a full health check',
			fix: null
		}
	];
}

function checkRawHr(code: string): Issue[] {
	const issues: Issue[] = [];
	// Strip <script> and <style> blocks to only scan template.
	const template = code
		.replace(/<script[^>]*>[\s\S]*?<\/script>/g, (m) => '\n'.repeat(countNewlines(m)))
		.replace(/<style[^>]*>[\s\S]*?<\/style>/g, (m) => '\n'.repeat(countNewlines(m)));

	const hrRegex = /<hr[\s/>]/g;
	const lineOffsets = buildLineOffsets(code);
	let match: RegExpExecArray | null;

	while ((match = hrRegex.exec(template)) !== null) {
		const line = lineAtOffset(lineOffsets, match.index);
		issues.push({
			severity: 'suggestion',
			code: 'prefer-separator',
			line,
			message: 'Raw <hr> element \u2014 consider using <Separator /> for consistent styling',
			fix: '<Separator />'
		});
	}
	return issues;
}

// Main

export function reviewComponent(
	code: string,
	spec: { components: Record<string, ComponentDef>; thumbnails?: string[] },
	filename?: string
): ReviewResult {
	const imports = extractImports(code);
	const tags = extractTags(code);
	const styles = extractStyles(code);
	const issues: Issue[] = [];

	// Phase 2: Spec compliance
	issues.push(...checkBareCompound(tags, spec));
	issues.push(...checkUnknownComponent(tags, imports, spec));
	issues.push(...checkInvalidPartName(tags, spec));
	issues.push(...checkInvalidProp(tags, spec));
	issues.push(...checkMissingRequiredProp(tags, spec));

	// Phase 3: Structural
	issues.push(...checkOrphanedPart(tags, spec));
	issues.push(...checkMissingLabel(tags, code));
	issues.push(...checkImageWithoutAlt(tags));
	issues.push(...checkMissingThumbnail(imports, spec));
	issues.push(...checkCustomFieldMarkup(code));
	issues.push(...checkRawStyledButton(code));
	if (styles) {
		issues.push(...checkCustomFlexLayout(styles, code));
		issues.push(...checkCustomMaxWidthCentering(styles, code));
	}

	// Phase 4: Style suggestions
	if (styles) {
		issues.push(...checkHardcodedColors(styles, code));
		issues.push(...checkManualCentering(styles, code));
		issues.push(...checkCustomThemeOverrides(styles, code));
	}
	issues.push(...checkRawHr(code));

	// Sort by line number
	issues.sort((a, b) => a.line - b.line);

	const errors = issues.filter((i) => i.severity === 'error').length;
	const warnings = issues.filter((i) => i.severity === 'warning').length;
	const suggestions = issues.filter((i) => i.severity === 'suggestion').length;
	const summary =
		issues.length === 0
			? 'No issues found'
			: `${errors} error${errors !== 1 ? 's' : ''}, ${warnings} warning${warnings !== 1 ? 's' : ''}, ${suggestions} suggestion${suggestions !== 1 ? 's' : ''}`;

	return { issues, summary, ...(filename ? { filename } : {}) };
}
