// DryUI Component Check Engine.
// Runs spec-driven structural + a11y checks plus the shared `@dryui/lint`
// ruleset against a single Svelte file. Pure string/regex parsing - no Svelte
// compiler required. Design-opinion / polish rules are delegated to impeccable.

import {
	RULE_CATALOG,
	ruleMessage,
	ruleSuggestedFix,
	type RuleCatalogId,
	type RuleSeverity
} from '@dryui/lint/rule-catalog';
import { checkSvelteFile, stripBlocks, type Violation } from '@dryui/lint/rules';
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

interface ReviewContext {
	readonly template: string;
	readonly lineOffsets: number[];
}

function extractScriptBody(code: string): string {
	const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/);
	return scriptMatch?.[1] ?? '';
}

function extractImports(scriptBody: string): Set<string> {
	const imports = new Set<string>();
	if (!scriptBody) return imports;

	const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]@dryui\/(ui|primitives)['"]/g;

	for (const match of scriptBody.matchAll(importRegex)) {
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

	for (const match of template.matchAll(tagRegex)) {
		const name = match[1] ?? '';
		const attrsStr = match[2] ?? '';
		const selfClosing = match[3] === '/';
		const line = lineAtOffset(lineOffsets, match.index ?? 0);
		const props = extractPropsFromAttrs(attrsStr);
		const hasSpread = /\{\.\.\./.test(attrsStr);

		tags.push({ name, line, props, hasSpread, selfClosing });
	}

	return tags;
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

	// Svelte shorthand props: {tokens} is equivalent to tokens={tokens}.
	const shorthandRegex = /(?:^|\s)\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}/g;
	for (const m of attrsStr.matchAll(shorthandRegex)) {
		const propName = m[1];
		if (propName && !props.includes(propName)) {
			props.push(propName);
		}
	}

	// Strip quoted strings and brace expressions to avoid matching values as prop names.
	const stripped = stripBraceExpressions(
		attrsStr.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''")
	);

	// bind:propName
	const bindRegex = /\bbind:([a-zA-Z_][a-zA-Z0-9_]*)/g;
	for (const m of stripped.matchAll(bindRegex)) {
		const bound = m[1];
		if (bound) props.push('bind:' + bound);
	}

	// Svelte component CSS custom properties: --token-name={...} or --token-name="..."
	const cssCustomPropertyRegex = /(?<![\w-])(--[a-zA-Z_][a-zA-Z0-9_-]*)\s*=/g;
	for (const m of stripped.matchAll(cssCustomPropertyRegex)) {
		const propName = m[1];
		if (propName && !props.includes(propName)) {
			props.push(propName);
		}
	}

	// propName={ or propName="
	const namedRegex = /(?<![\w:-])([a-zA-Z_][a-zA-Z0-9_-]*)\s*=/g;
	for (const m of stripped.matchAll(namedRegex)) {
		const propName = m[1];
		if (propName && !props.includes(propName)) {
			props.push(propName);
		}
	}

	// Boolean props: bare identifiers not followed by =
	const boolRegex = /(?<!\.)(?<![:{-])\b([a-zA-Z_][a-zA-Z0-9_-]*)\b(?!\s*=)/g;
	for (const m of stripped.matchAll(boolRegex)) {
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

const NATIVE_EVENT_ATTRS: ReadonlySet<string> = new Set([
	'onabort',
	'onanimationcancel',
	'onanimationend',
	'onanimationiteration',
	'onanimationstart',
	'onauxclick',
	'onbeforeinput',
	'onbeforematch',
	'onbeforetoggle',
	'onblur',
	'oncancel',
	'oncanplay',
	'oncanplaythrough',
	'onchange',
	'onclick',
	'onclose',
	'oncontextlost',
	'oncontextmenu',
	'oncontextrestored',
	'oncopy',
	'oncuechange',
	'oncut',
	'ondblclick',
	'ondrag',
	'ondragend',
	'ondragenter',
	'ondragleave',
	'ondragover',
	'ondragstart',
	'ondrop',
	'ondurationchange',
	'onemptied',
	'onended',
	'onerror',
	'onfocus',
	'onfocusin',
	'onfocusout',
	'onformdata',
	'onfullscreenchange',
	'onfullscreenerror',
	'ongotpointercapture',
	'oninput',
	'oninvalid',
	'onkeydown',
	'onkeypress',
	'onkeyup',
	'onload',
	'onloadeddata',
	'onloadedmetadata',
	'onloadstart',
	'onlostpointercapture',
	'onmousedown',
	'onmouseenter',
	'onmouseleave',
	'onmousemove',
	'onmouseout',
	'onmouseover',
	'onmouseup',
	'onpaste',
	'onpause',
	'onplay',
	'onplaying',
	'onpointercancel',
	'onpointerdown',
	'onpointerenter',
	'onpointerleave',
	'onpointermove',
	'onpointerout',
	'onpointerover',
	'onpointerrawupdate',
	'onpointerup',
	'onprogress',
	'onratechange',
	'onreset',
	'onresize',
	'onscroll',
	'onscrollend',
	'onsecuritypolicyviolation',
	'onseeked',
	'onseeking',
	'onselect',
	'onselectionchange',
	'onselectstart',
	'onslotchange',
	'onstalled',
	'onsubmit',
	'onsuspend',
	'ontimeupdate',
	'ontoggle',
	'ontouchcancel',
	'ontouchend',
	'ontouchmove',
	'ontouchstart',
	'ontransitioncancel',
	'ontransitionend',
	'ontransitionrun',
	'ontransitionstart',
	'onvolumechange',
	'onwaiting',
	'onwheel'
]);

function isNativeEventAttribute(propName: string): boolean {
	if (NATIVE_EVENT_ATTRS.has(propName)) return true;
	if (!propName.endsWith('capture')) return false;
	const eventName = propName.slice(0, -'capture'.length);
	return NATIVE_EVENT_ATTRS.has(eventName);
}

function isCssCustomPropertyAttribute(propName: string): boolean {
	return /^--[a-zA-Z_][a-zA-Z0-9_-]*$/.test(propName);
}

function isPropAllowed(propName: string): boolean {
	if (NATIVE_HTML_ATTRS.has(propName)) return true;
	if (propName.startsWith('aria-')) return true;
	if (propName.startsWith('data-')) return true;
	if (isNativeEventAttribute(propName)) return true;
	if (isCssCustomPropertyAttribute(propName)) return true;
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

function resolveSpecPropsForTag(
	tag: TagInfo,
	spec: { components: Record<string, ComponentDef> }
): Record<string, PropDef> | null {
	const segments = tag.name.split('.');
	const root = segments[0] ?? '';
	const part = segments[1];
	if (!root) return null;
	const def = spec.components[root];
	if (!def) return null;

	if (part) {
		return def.parts?.[part]?.props ?? null;
	}
	if (!def.compound) {
		return def.props ?? null;
	}
	// Bare compound root (e.g. <Tabs>) - already flagged by checkBareCompound.
	return null;
}

function checkInvalidProp(
	tags: TagInfo[],
	spec: { components: Record<string, ComponentDef> }
): Issue[] {
	const issues: Issue[] = [];
	for (const tag of tags) {
		const specProps = resolveSpecPropsForTag(tag, spec);
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

		const specProps = resolveSpecPropsForTag(tag, spec);
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
	for (const match of template.matchAll(regex)) {
		const offset = match.index ?? 0;
		const line = lineAtOffset(lineOffsets, offset);
		if (line === targetLine) return offset;
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
 * Run the spec-driven structural + a11y checks on a Svelte source string.
 * These rules are not expressible in the generic `@dryui/lint` rules because
 * they depend on the live component spec (known components, compound parts,
 * required props, accepted attributes).
 */
export function reviewComponent(
	code: string,
	spec: { components: Record<string, ComponentDef> },
	filename?: string
): ReviewResult {
	const template = stripBlocks(code);
	const ctx: ReviewContext = {
		template,
		lineOffsets: buildLineOffsets(template)
	};
	const imports = extractImports(extractScriptBody(code));
	const tags = extractTags(ctx);
	const issues: Issue[] = [];

	issues.push(...checkBareCompound(tags, spec));
	issues.push(...checkUnknownComponent(tags, imports, spec));
	issues.push(...checkInvalidPartName(tags, spec));
	issues.push(...checkInvalidProp(tags, spec));
	issues.push(...checkMissingRequiredProp(tags, spec));
	issues.push(...checkOrphanedPart(tags, spec));
	issues.push(...checkMissingLabel(tags, ctx));
	issues.push(...checkImageWithoutAlt(tags));

	issues.sort((a, b) => a.line - b.line);

	return { issues, summary: summarizeIssues(issues), ...(filename ? { filename } : {}) };
}

interface ComponentIssue {
	readonly severity: RuleSeverity;
	readonly code: string;
	readonly line: number;
	readonly message: string;
	readonly fix: string | null;
}

interface ComponentCheckResult {
	readonly issues: ComponentIssue[];
	readonly summary: string;
	readonly filename?: string;
}

function isRuleCatalogId(value: string): value is RuleCatalogId {
	return value in RULE_CATALOG;
}

// Some violation rule ids use a `project/` prefix to identify findings that
// straddle files (e.g. `project/theme-import-order`), but their catalog entry
// is keyed by the short name. Map prefix -> catalog id here.
const PROJECT_RULE_TO_CATALOG_ID: Record<string, RuleCatalogId> = {
	'project/theme-import-order': 'theme-import-order'
};

function lintViolationToIssue(violation: Violation): ComponentIssue {
	if (isRuleCatalogId(violation.rule)) {
		return {
			severity: RULE_CATALOG[violation.rule].severity,
			code: violation.rule,
			line: violation.line,
			message: violation.message,
			fix: ruleSuggestedFix(violation.rule)
		};
	}

	const mapped = PROJECT_RULE_TO_CATALOG_ID[violation.rule];
	if (mapped) {
		return {
			severity: RULE_CATALOG[mapped].severity,
			code: violation.rule,
			line: violation.line,
			message: violation.message,
			fix: ruleSuggestedFix(mapped)
		};
	}

	return {
		severity: 'error',
		code: violation.rule,
		line: violation.line,
		message: violation.message,
		fix: null
	};
}

function dedupeIssues(issues: ComponentIssue[]): ComponentIssue[] {
	const seen = new Set<string>();
	return issues.filter((issue) => {
		const key = `${issue.code}:${issue.line}:${issue.message}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

function summarizeIssues(issues: readonly ComponentIssue[]): string {
	if (issues.length === 0) return 'No issues found';

	let errors = 0;
	let warnings = 0;
	let suggestions = 0;
	let info = 0;

	for (const issue of issues) {
		if (issue.severity === 'error') errors += 1;
		else if (issue.severity === 'warning') warnings += 1;
		else if (issue.severity === 'suggestion') suggestions += 1;
		else info += 1;
	}

	let summary = `${errors} error${errors !== 1 ? 's' : ''}, ${warnings} warning${warnings !== 1 ? 's' : ''}, ${suggestions} suggestion${suggestions !== 1 ? 's' : ''}`;
	if (info > 0) {
		summary += `, ${info} info`;
	}
	return summary;
}

export function checkComponent(
	code: string,
	spec: { components: Record<string, ComponentDef> },
	filename?: string
): ComponentCheckResult {
	const review = reviewComponent(code, spec, filename);
	const lintIssues = checkSvelteFile(code, filename).map(lintViolationToIssue);
	const issues = dedupeIssues([...review.issues, ...lintIssues]).sort((left, right) => {
		if (left.line !== right.line) return left.line - right.line;
		if (left.severity !== right.severity) {
			const rank = { error: 3, warning: 2, suggestion: 1, info: 0 } as const;
			return rank[right.severity] - rank[left.severity];
		}
		if (left.code !== right.code) return left.code.localeCompare(right.code);
		return left.message.localeCompare(right.message);
	});

	return {
		issues,
		summary: summarizeIssues(issues),
		...(filename ? { filename } : {})
	};
}
