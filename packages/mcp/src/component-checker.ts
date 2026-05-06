// DryUI Component Check Engine.
// Runs spec-driven structural + a11y checks against a single Svelte file.
// Pure string/regex parsing - no Svelte compiler required. Sort + count of
// issues delegates to `@dryui/lint/diagnostic-summary` so every checker shares
// one severity vocabulary and ordering rule. Design-opinion / polish rules
// are delegated to impeccable.

import {
	summarizeDiagnostics,
	type Diagnostic,
	type DiagnosticSummary
} from '@dryui/lint/diagnostic-summary';
import { ruleMessage, ruleSuggestedFix } from '@dryui/lint/rule-catalog';
import { stripBlocks } from '@dryui/lint/rules';
import {
	collectDryUiImports,
	collectSvelteComponentUsages,
	extractSvelteScriptBody,
	type SvelteComponentUsage
} from '@dryui/lint/svelte-source-facts';

export interface ReviewResult extends DiagnosticSummary<Diagnostic> {
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

type TagInfo = SvelteComponentUsage;

interface ReviewContext {
	readonly template: string;
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
): Diagnostic[] {
	const issues: Diagnostic[] = [];
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
): Diagnostic[] {
	const issues: Diagnostic[] = [];
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
): Diagnostic[] {
	const issues: Diagnostic[] = [];
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
): Diagnostic[] {
	const issues: Diagnostic[] = [];
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
): Diagnostic[] {
	const issues: Diagnostic[] = [];
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
): Diagnostic[] {
	const issues: Diagnostic[] = [];
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

function checkMissingLabel(tags: TagInfo[], ctx: ReviewContext): Diagnostic[] {
	const issues: Diagnostic[] = [];
	const { template } = ctx;

	for (const tag of tags) {
		if (tag.name !== 'Input' && tag.name !== 'Select.Root' && tag.name !== 'Combobox.Input')
			continue;
		const hasAriaLabel = tag.props.some((p) => p === 'aria-label');
		if (hasAriaLabel) continue;

		const wrappedByField =
			template.lastIndexOf('<Field.Root', tag.index) !== -1 &&
			template.indexOf('</Field.Root>', tag.index) !== -1;

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

function checkImageWithoutAlt(tags: TagInfo[]): Diagnostic[] {
	const issues: Diagnostic[] = [];
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
		template
	};
	const imports = new Set(
		collectDryUiImports(extractSvelteScriptBody(code))
			.filter(
				(dryImport) =>
					dryImport.specifier === '@dryui/ui' || dryImport.specifier === '@dryui/primitives'
			)
			.map((dryImport) => dryImport.name)
	);
	const tags = collectSvelteComponentUsages(template);
	const issues: Diagnostic[] = [
		...checkBareCompound(tags, spec),
		...checkUnknownComponent(tags, imports, spec),
		...checkInvalidPartName(tags, spec),
		...checkInvalidProp(tags, spec),
		...checkMissingRequiredProp(tags, spec),
		...checkOrphanedPart(tags, spec),
		...checkMissingLabel(tags, ctx),
		...checkImageWithoutAlt(tags)
	];
	return { ...summarizeDiagnostics(issues), ...(filename ? { filename } : {}) };
}
