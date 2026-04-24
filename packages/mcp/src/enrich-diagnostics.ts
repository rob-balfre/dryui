/**
 * Pure enrichment layer for DryUI diagnostics.
 *
 * `check` produces issues from three subsystems (lint, theme-checker,
 * workspace-audit) with stable codes but diagnostic-only messages. Agents
 * running a repair loop need prescriptive `hint` text ("do X") and a
 * docs anchor, not just "X is wrong".
 *
 * {@link enrichDiagnostic} is a pure function: same raw diagnostic in,
 * same enriched diagnostic out. Unknown codes round-trip without a hint
 * (so agents degrade gracefully when a new rule ships without a hint
 * registered here yet).
 */
import type {
	DryUiRepairIssue,
	DryUiRepairIssueSeverity,
	DryUiRepairIssueSource
} from './repair-types.js';

const DOCS_BASE = 'https://dryui.dev';

type HintBuilder = (ctx: HintContext) => { hint?: string; docsRef?: string };

interface HintContext {
	readonly code: string;
	readonly message: string;
	readonly file?: string | undefined;
	readonly component?: string | undefined;
	readonly path?: string | undefined;
}

const HINTS: Record<string, HintBuilder> = {
	// ── lint rules ────────────────────────────────────────────────────────────
	'lint/dryui/no-layout-component': () => ({
		hint: 'Build layouts with raw CSS grid and --dry-space-* tokens in the component <style> block. DryUI deliberately ships no Stack/Box/Grid wrapper.',
		docsRef: `${DOCS_BASE}/concepts/layout`
	}),
	'lint/dryui/no-inline-style': () => ({
		hint: 'Move the inline style into the component <style> block. If the value is dynamic, expose it via a --dry-* custom property and set that property instead of `style`.',
		docsRef: `${DOCS_BASE}/concepts/theming#custom-properties`
	}),
	'lint/dryui/no-style-directive': () => ({
		hint: 'Replace `style:prop={value}` with a CSS custom property: set `--foo: {value}` inline or via a class toggle, then consume `var(--foo)` inside the <style> block.',
		docsRef: `${DOCS_BASE}/concepts/theming#custom-properties`
	}),
	'lint/dryui/no-component-class': (ctx) => ({
		hint: `DryUI components ignore class=. Pass --dry-* CSS custom properties on the parent, or choose a built-in prop${ctx.component ? ` on <${ctx.component}>` : ''}.`,
		docsRef: `${DOCS_BASE}/concepts/theming#overrides`
	}),
	'lint/dryui/no-css-ignore': () => ({
		hint: 'Delete the ignore comment and fix the selector: either remove unused rules or attach them to markup that exists. Suppressing the warning leaves dead CSS in the bundle.',
		docsRef: `${DOCS_BASE}/concepts/rules#no-css-ignore`
	}),
	'lint/dryui/no-svelte-element': () => ({
		hint: 'Replace <svelte:element this={tag}> with explicit {#if tag === "..."} branches so the rendered tags are statically visible.',
		docsRef: `${DOCS_BASE}/concepts/rules#no-svelte-element`
	}),
	'lint/dryui/no-anchor-without-href': () => ({
		hint: 'For actions use <Button variant="link">. For navigation add an href. <a> without href is not keyboard-focusable and fails WCAG.',
		docsRef: `${DOCS_BASE}/components/button`
	}),
	'lint/dryui/no-raw-native-element': (ctx) => ({
		hint: `Use the DryUI component that wraps this element. For example: Button for <button>, Input for <input>, Heading for <h1>-<h6>, Separator for <hr>, Text for <p>.${ctx.component ? ` See ask --scope component "${ctx.component}".` : ''}`,
		docsRef: `${DOCS_BASE}/concepts/rules#no-raw-native-element`
	}),
	'lint/dryui/no-flex': () => ({
		hint: 'DryUI layouts use CSS grid. Replace display:flex with display:grid + grid-template-columns / grid-auto-flow. Grid makes the composition declarative and avoids flex alignment foot-guns.',
		docsRef: `${DOCS_BASE}/concepts/layout#grid-first`
	}),
	'lint/dryui/no-width': () => ({
		hint: 'Drop hard-coded widths. Let grid tracks (`fr`, `min-content`, `minmax()`) or Container sizing decide. For text measure use `ch` units via typography presets.',
		docsRef: `${DOCS_BASE}/concepts/layout#sizing`
	}),
	'lint/dryui/no-media-sizing': () => ({
		hint: 'Swap @media (min-width:) for @container (min-width:) so the component reacts to its parent, not the viewport. Put `container-type: inline-size` on the owning container.',
		docsRef: `${DOCS_BASE}/concepts/responsive#container-queries`
	}),
	'lint/dryui/no-important': () => ({
		hint: 'Raise specificity with a class or :where() wrapper instead of !important. If you can not style it without !important, the surface may need a new prop or CSS custom property.',
		docsRef: `${DOCS_BASE}/concepts/rules#no-important`
	}),
	'lint/dryui/no-global': () => ({
		hint: 'Scope the selector to the component via :where(.local) instead of :global(...). If the style really is global, lift it to the theme CSS.',
		docsRef: `${DOCS_BASE}/concepts/rules#no-global`
	}),
	'lint/dryui/no-all-unset': () => ({
		hint: 'Unset only the properties you mean to reset (margin, padding, border, background, color, font). `all: unset` nukes user-agent accessibility defaults and breaks forms.',
		docsRef: `${DOCS_BASE}/concepts/rules#no-all-unset`
	}),
	'lint/dryui/prefer-focus-ring-token': () => ({
		hint: 'Use var(--dry-color-stroke-focus) for focus outlines so the ring stays in sync with theme swaps.',
		docsRef: `${DOCS_BASE}/concepts/theming#focus-ring`
	}),
	'lint/project/theme-import-order': () => ({
		hint: 'Import theme.css BEFORE any component CSS (including app.css). Otherwise component defaults lose the token cascade.',
		docsRef: `${DOCS_BASE}/getting-started#theme-import-order`
	}),

	// ── theme-checker codes ───────────────────────────────────────────────────
	'theme/missing-token': (ctx) => ({
		hint: `Add the missing --dry-* token to your theme CSS${ctx.path ? ` (${ctx.path})` : ''}. The reviewer catalogue lists the full token surface; run ask --scope list --kind token to browse it.`,
		docsRef: `${DOCS_BASE}/concepts/theming#required-tokens`
	}),
	'theme/wrong-type': () => ({
		hint: 'The token is present but has the wrong CSS type. Check the expected shape (length, color, number) against the token catalog.',
		docsRef: `${DOCS_BASE}/concepts/theming#token-types`
	}),
	'theme/partial-override': () => ({
		hint: 'Either override the full token family or none of it. Partial overrides leak default values into dark mode and high-contrast schemes.',
		docsRef: `${DOCS_BASE}/concepts/theming#overrides`
	}),
	'theme/transparent-surface': () => ({
		hint: 'Base surfaces (--dry-color-bg-base, --dry-color-bg-strong) must be opaque. Transparent base backgrounds leak whatever renders underneath into component chrome, so use an opaque color.',
		docsRef: `${DOCS_BASE}/concepts/theming#surfaces`
	}),
	'theme/low-contrast-text': () => ({
		hint: 'Text-on-surface pairs must hit WCAG AA (4.5:1 body, 3:1 large). Darken the text token or lighten the surface until the ratio passes.',
		docsRef: `${DOCS_BASE}/concepts/theming#contrast`
	}),
	'theme/no-elevation': () => ({
		hint: 'Elevated surfaces need a stronger color than their backdrop, otherwise panels and popovers visually fuse with the page. Pull the token from the `strong`/`elevated` family.',
		docsRef: `${DOCS_BASE}/concepts/theming#elevation`
	}),
	'theme/missing-pairing': () => ({
		hint: 'Every fill token needs a matching stroke token (or vice versa). Declare the partner so focus rings and borders stay in sync with fills.',
		docsRef: `${DOCS_BASE}/concepts/theming#pairings`
	}),
	'theme/unknown-component-token': () => ({
		hint: 'The token name does not match any known DryUI component surface. Check spelling, or run ask --scope list --kind token to find the correct token.',
		docsRef: `${DOCS_BASE}/concepts/theming#component-tokens`
	}),
	'theme/transparent-component-bg': () => ({
		hint: 'Component backgrounds should be opaque so stacked popovers and sheets do not bleed through. If you need a translucent surface, use a frosted-glass pattern with backdrop-filter rather than alpha on the bg token.',
		docsRef: `${DOCS_BASE}/concepts/theming#surfaces`
	}),
	'theme/dark-scheme-no-overrides': () => ({
		hint: 'Declared a [data-theme="dark"] block without actually overriding any tokens. Either populate it with the dark-mode values or delete the empty block.',
		docsRef: `${DOCS_BASE}/concepts/theming#dark-mode`
	}),
	'theme/unresolvable-var': () => ({
		hint: 'A var(--x) reference points at a token that is not declared. Add the token, remove the reference, or fix the typo.',
		docsRef: `${DOCS_BASE}/concepts/theming`
	}),

	// ── parse fallback ─────────────────────────────────────────────────────────
	'parse/svelte-parse-error': () => ({
		hint: 'The Svelte compiler could not parse the file. Fix the syntax first — attribute typos and unclosed tags are the usual cause — then rerun `check`.',
		docsRef: `${DOCS_BASE}/concepts/troubleshooting#parse-errors`
	}),

	// ── vision rubric ─────────────────────────────────────────────────────────
	'vision/chip-wrap': () => ({
		hint: 'Use Badge with leadingIcon (or PageHeader.Meta with explicit icon slots) so the icon stays inline. A stacked icon means the chip width is too narrow or the label wrapped.',
		docsRef: `${DOCS_BASE}/components/badge#leading-icon`
	}),
	'vision/plural-mismatch': () => ({
		hint: 'Use Pluralize so the noun agrees with the count. Hard-coded copy like "1 hotels" should be `<Pluralize count={n} singular="hotel" plural="hotels" />`.',
		docsRef: `${DOCS_BASE}/components/pluralize`
	}),
	'vision/variant-mix': () => ({
		hint: 'Pick one Badge variant per row (all soft, or all outlined, or all solid). Mixed variants in the same chip group read as accidental, not deliberate.',
		docsRef: `${DOCS_BASE}/components/badge#variants`
	}),
	'vision/mid-token-break': () => ({
		hint: 'Wrap reference IDs in `<RefId>` so the token stays atomic. RefId applies `white-space: nowrap` and a non-breaking-hyphen segmenter so codes like BA-3490221 never break across lines.',
		docsRef: `${DOCS_BASE}/components/ref-id`
	}),
	'vision/low-contrast': () => ({
		hint: 'Bump the text token to --dry-color-text-strong, or pick a heavier surface token. Run `check <theme.css>` to verify the pair hits WCAG AA (4.5:1 body, 3:1 large).',
		docsRef: `${DOCS_BASE}/concepts/theming#contrast`
	}),
	'vision/alignment': () => ({
		hint: 'Replace bespoke flex with `display: grid` and explicit `align-items: baseline`. Drift here usually means line-height differences across siblings; pin to the same typography preset.',
		docsRef: `${DOCS_BASE}/concepts/layout#baseline-alignment`
	}),
	'vision/orphan': () => ({
		hint: 'Use `text-wrap: balance` (headings) or `text-wrap: pretty` (body) so the last line is never a single orphan word. DryUI heading tokens enable balance by default.',
		docsRef: `${DOCS_BASE}/concepts/typography#wrap-balance`
	}),
	'vision/spacing-rhythm': () => ({
		hint: 'Snap vertical gaps to one --dry-space-* step per region. Mixed `gap` values (e.g. 12px next to 18px) read as broken rhythm.',
		docsRef: `${DOCS_BASE}/concepts/layout#spacing-scale`
	}),
	'vision/cramped-layout': () => ({
		hint: 'Add breathing room around the dense region: increase the stack gap between title, subtitle, and metadata; let chip rows wrap; and keep badges/date pills from visually crowding adjacent text.',
		docsRef: `${DOCS_BASE}/concepts/layout#spacing-scale`
	}),
	'vision/header-rhythm': () => ({
		hint: 'Tune the page-header stack as a single rhythm: keep the H1 and supporting line optically connected, then use a larger step before metadata. Avoid one-off margins between title and subtitle.',
		docsRef: `${DOCS_BASE}/concepts/layout#spacing-scale`
	}),
	'vision/stray-padding': () => ({
		hint: 'Remove accidental top/bottom padding or asymmetric margins. Meta/chip rows should sit centered in their band with symmetric block padding and a deliberate gap from neighboring text.',
		docsRef: `${DOCS_BASE}/concepts/layout#spacing-scale`
	}),
	'vision/parse-error': () => ({
		hint: 'The vision model returned content that did not parse as JSON. Inspect the raw response in the `evidence` field (usually a transient model hiccup); rerun the check.',
		docsRef: `${DOCS_BASE}/concepts/troubleshooting#vision-parse-errors`
	}),

	// -- design brief ----------------------------------------------------------
	'design/missing-frontmatter': () => ({
		hint: 'Start DESIGN.md with YAML frontmatter. At minimum include `name:` and `overview:` so MCP and CLI checks can pass identity into visual review.',
		docsRef: `${DOCS_BASE}/concepts/design-briefs`
	}),
	'design/missing-name': () => ({
		hint: 'Add a concrete product, surface, or interface name in `name:` or the first H1. This gives visual review a stable identity to preserve.',
		docsRef: `${DOCS_BASE}/concepts/design-briefs`
	}),
	'design/missing-overview': () => ({
		hint: 'Add a short overview that names the target user, job, and interface intent. Avoid generic phrases like "modern app".',
		docsRef: `${DOCS_BASE}/concepts/design-briefs`
	}),
	'design/missing-colors': () => ({
		hint: 'Describe the color direction: palette intent, contrast expectations, and any surface/accent rules the visual reviewer should enforce.',
		docsRef: `${DOCS_BASE}/concepts/design-briefs`
	}),
	'design/missing-typography': () => ({
		hint: 'Describe typography direction: hierarchy, density, tone, and whether the UI should feel editorial, operational, playful, or restrained.',
		docsRef: `${DOCS_BASE}/concepts/design-briefs`
	}),
	'design/missing-do-donts': () => ({
		hint: "Add Do and Don't bullets that capture hard guardrails, such as density, imagery, motion, and anti-patterns to avoid.",
		docsRef: `${DOCS_BASE}/concepts/design-briefs`
	}),
	'design/too-vague': () => ({
		hint: 'Replace generic identity language with concrete domain nouns, user goals, and interface qualities that can be seen in a screenshot.',
		docsRef: `${DOCS_BASE}/concepts/design-briefs`
	})
};

/**
 * Normalise a raw code into the namespaced form used by this registry.
 * Accepts both `dryui/no-flex` (lint) and `no-flex` and the namespaced form.
 */
function namespaceCode(source: DryUiRepairIssueSource, rawCode: string): string {
	if (rawCode.includes('/')) {
		// Already namespaced somewhere. Ensure it starts with the source.
		if (rawCode.startsWith(`${source}/`)) return rawCode;
		// lint rules carry `dryui/…` and `project/…` prefixes; keep those.
		return `${source}/${rawCode}`;
	}
	return `${source}/${rawCode}`;
}

export interface EnrichDiagnosticInput {
	source: DryUiRepairIssueSource;
	code: string;
	severity: DryUiRepairIssueSeverity;
	message: string;
	file?: string;
	line?: number;
	column?: number;
	component?: string;
	path?: string;
	fix?: { before: string; after: string } | undefined;
}

export function enrichDiagnostic(issue: EnrichDiagnosticInput): DryUiRepairIssue {
	const namespaced = namespaceCode(issue.source, issue.code);
	const builder = HINTS[namespaced];
	const enrichment = builder
		? builder({
				code: namespaced,
				message: issue.message,
				file: issue.file,
				component: issue.component,
				path: issue.path
			})
		: {};

	const enriched: DryUiRepairIssue = {
		source: issue.source,
		code: namespaced,
		severity: issue.severity,
		message: issue.message,
		...(issue.file !== undefined ? { file: issue.file } : {}),
		...(issue.line !== undefined ? { line: issue.line } : {}),
		...(issue.column !== undefined ? { column: issue.column } : {}),
		...(issue.component !== undefined ? { component: issue.component } : {}),
		...(issue.path !== undefined ? { path: issue.path } : {}),
		...(enrichment.hint !== undefined ? { hint: enrichment.hint } : {}),
		...(enrichment.docsRef !== undefined ? { docsRef: enrichment.docsRef } : {}),
		...(issue.fix ? { fix: issue.fix, autoFixable: true } : { autoFixable: false })
	};
	return enriched;
}

/**
 * Test-only helper: list every code with a hint registered. Used by the
 * enrichment test to detect drift between rule-catalog IDs and the
 * hint registry.
 */
export function knownHintCodes(): string[] {
	return Object.keys(HINTS).sort();
}
