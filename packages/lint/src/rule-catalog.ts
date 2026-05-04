export type RuleSeverity = 'error' | 'warning' | 'suggestion' | 'info';

export type RuleCategory = 'correctness' | 'a11y';

export interface RuleCatalogEntry {
	readonly id: string;
	readonly message: string;
	readonly severity: RuleSeverity;
	readonly suggestedFix?: string;
	/**
	 * Rule category. Enables scope filtering. Optional for backwards
	 * compatibility — entries without a category default to `'correctness'`.
	 */
	readonly category?: RuleCategory;
}

export const RULE_CATALOG = {
	'dryui/no-layout-component': {
		id: 'dryui/no-layout-component',
		severity: 'error',
		message: 'Do not {action} {target}. Use {guidance}.',
		suggestedFix: 'Use data-layout hooks and src/layout.css instead.'
	},
	'dryui/no-inline-style': {
		id: 'dryui/no-inline-style',
		severity: 'error',
		message: 'No inline style attributes. Use scoped CSS with custom properties.',
		suggestedFix: 'Move the inline styles into the component <style> block.'
	},
	'dryui/no-style-directive': {
		id: 'dryui/no-style-directive',
		severity: 'error',
		message: 'No style: directives. Use scoped CSS with custom properties.',
		suggestedFix:
			'Move style directives into component props, --dry-* CSS custom properties, or the component <style> block.'
	},
	'dryui/no-attach': {
		id: 'dryui/no-attach',
		severity: 'error',
		message:
			'Do not use {@attach ...}. Use component props, CSS custom properties, or explicit component APIs.',
		suggestedFix:
			'Remove the attachment and expose the needed behavior through a component prop or CSS custom property.'
	},
	'dryui/no-raw-element': {
		id: 'dryui/no-raw-element',
		severity: 'error',
		message:
			'Raw <{tag}> is not allowed in component-only mode. Use a DryUI/Svelte component instead.',
		suggestedFix: 'Replace raw markup with a DryUI component or a dedicated Svelte component.'
	},
	'dryui/no-component-class': {
		id: 'dryui/no-component-class',
		severity: 'error',
		message:
			'Do not pass class= to <{component}>. Svelte components ignore class attributes. Use --dry-* CSS custom properties for styling overrides.',
		suggestedFix: 'Replace class= overrides with component props or --dry-* CSS custom properties.'
	},
	'dryui/no-css-ignore': {
		id: 'dryui/no-css-ignore',
		severity: 'error',
		message:
			'Do not use <!-- svelte-ignore css_unused_selector -->. Fix the underlying CSS issue instead of suppressing the warning.',
		suggestedFix: 'Remove the ignore comment and fix the unused selector.'
	},
	'dryui/no-svelte-element': {
		id: 'dryui/no-svelte-element',
		severity: 'error',
		message:
			'Do not use <svelte:element this={x}>. Use explicit {#if}/{:else} branches with concrete tags so element-specific styles and semantics are visible in source. Add <!-- dryui-allow svelte-element --> on the preceding line for legitimate cases (e.g., h1–h6 headings).',
		suggestedFix: 'Replace <svelte:element> with explicit markup branches.'
	},
	'dryui/no-anchor-without-href': {
		id: 'dryui/no-anchor-without-href',
		severity: 'error',
		message:
			'Do not use <a> without href. Use <button> for actions, or provide href for navigation.',
		suggestedFix: 'Add href, or switch to <button> for non-navigation actions.'
	},
	'dryui/no-raw-native-element': {
		id: 'dryui/no-raw-native-element',
		severity: 'error',
		message:
			'Raw <{tag}> is only allowed inside its canonical component directory. Use <{component}{closing}> elsewhere.',
		suggestedFix: 'Use the matching DryUI component instead of the raw element.'
	},
	'dryui/no-flex': {
		id: 'dryui/no-flex',
		severity: 'error',
		message:
			'Do not use {value}. Use {guidance}. For chip/tag wrapping, use ChipGroup.Root (run: ask --scope recipe "chip row").',
		suggestedFix: 'Use CSS grid, or move page-level flex to src/layout.css.'
	},
	'dryui/no-width': {
		id: 'dryui/no-width',
		severity: 'error',
		message:
			'Do not use width/inline-size (including max-/min- variants). Grid children are sized by their track. Use grid-template-columns or grid-template-rows instead. Allowed units for typographic measure: ch, ex, em (e.g. max-width: 55ch is allowed, since it tracks text content, not viewport layout).',
		suggestedFix: 'Move sizing to the parent grid tracks, or use ch/ex/em for text measure.'
	},
	'dryui/no-all-unset': {
		id: 'dryui/no-all-unset',
		severity: 'error',
		message: 'Do not use all: unset. Reset only the specific properties you need.',
		suggestedFix: 'Replace all: unset with targeted property resets.'
	},
	'dryui/no-important': {
		id: 'dryui/no-important',
		severity: 'error',
		message:
			'Avoid !important — fix specificity at the source. Use component props, data-* attributes, or restructure the selector.',
		suggestedFix: 'Remove !important and resolve the underlying specificity conflict.'
	},
	'dryui/no-global': {
		id: 'dryui/no-global',
		severity: 'error',
		message:
			'Do not use :global(). Use scoped styles, data-* attributes, CSS variables, or component props instead.',
		suggestedFix: 'Convert the selector to scoped CSS or use a component API.'
	},
	'dryui/no-media-sizing': {
		id: 'dryui/no-media-sizing',
		severity: 'error',
		message:
			'Do not use @media for sizing. Use @container queries instead. @media is only allowed for prefers-reduced-motion and prefers-color-scheme.',
		suggestedFix: 'Replace the sizing media query with a container query.'
	},
	'dryui/prefer-focus-ring-token': {
		id: 'dryui/prefer-focus-ring-token',
		severity: 'error',
		message:
			'Do not inline "2px solid var(--dry-color-focus-ring)". Use the shared token: outline: var(--dry-focus-ring); (followed by outline-offset: 2px for outset or -1px for inset).',
		suggestedFix: 'Use outline: var(--dry-focus-ring) plus the correct outline-offset.'
	},
	'dryui/no-partial-inset-shadow': {
		id: 'dryui/no-partial-inset-shadow',
		severity: 'error',
		message:
			'Directional inset box-shadow (e.g. "inset 2px 0 0 ...") clips against border-radius and renders as a curved bracket on one side. Use "inset 0 0 0 Npx <color>" for a uniform ring, or a ::before/::after pseudo-element for a side indicator. Add /* dryui-allow inset-shadow */ on the preceding line for intentional cases.',
		suggestedFix:
			'Replace with inset 0 0 0 <size> <color> for a uniform ring, or use a positioned pseudo-element for a side-only indicator.'
	},
	'dryui/no-raw-grid': {
		id: 'dryui/no-raw-grid',
		severity: 'error',
		message:
			'Do not use raw CSS grid ({value}) here. Move page-level grid layout into src/layout.css, scoped by data-layout hooks.',
		suggestedFix: 'Move page layout grid declarations to src/layout.css.'
	},
	'dryui/layout-css-at-rule': {
		id: 'dryui/layout-css-at-rule',
		severity: 'error',
		message: 'src/layout.css only allows @container wrappers. Remove {atRule}.',
		suggestedFix:
			'Move non-layout CSS out of src/layout.css, or use @container for layout variants.'
	},
	'dryui/layout-css-selector': {
		id: 'dryui/layout-css-selector',
		severity: 'error',
		message:
			'src/layout.css selectors must target [data-layout] or [data-layout-area] hooks. Invalid selector: {selector}',
		suggestedFix: 'Use a [data-layout] or [data-layout-area] selector.'
	},
	'dryui/layout-css-property': {
		id: 'dryui/layout-css-property',
		severity: 'error',
		message:
			'src/layout.css only supports page layout properties: display, grid, flex, container, spacing, block sizing, and box alignment. Invalid property: {property}',
		suggestedFix:
			'Move visual styling, positioning, typography, color, border, and effects out of src/layout.css.'
	},
	'dryui/layout-css-value': {
		id: 'dryui/layout-css-value',
		severity: 'error',
		message:
			'src/layout.css only accepts layout-safe values for grid, flex, containers, spacing, block sizing, and alignment. Invalid {property}: {value}',
		suggestedFix:
			'Use grid/flex/container syntax, DryUI spacing tokens for spacing, margin auto, block-size values, or standard box-alignment keywords.'
	},
	'bare-compound': {
		id: 'bare-compound',
		severity: 'error',
		message: '<{name}> is a {variant} component — use {target}',
		suggestedFix: '{target}'
	},
	'unknown-component': {
		id: 'unknown-component',
		severity: 'error',
		message: '<{name}> is not a known DryUI component'
	},
	'invalid-part': {
		id: 'invalid-part',
		severity: 'error',
		message: '<{root}.{part}> — "{part}" is not a valid part of {root}. Valid parts: {validParts}'
	},
	'invalid-prop': {
		id: 'invalid-prop',
		severity: 'error',
		message: '<{name}> does not accept prop "{prop}"'
	},
	'missing-required-prop': {
		id: 'missing-required-prop',
		severity: 'error',
		message: '<{name}> is missing required prop "{prop}"',
		suggestedFix: '{prop}={...}'
	},
	'orphaned-part': {
		id: 'orphaned-part',
		severity: 'error',
		message: '<{name}> used without <{root}.Root> in the template',
		suggestedFix: 'Wrap in <{root}.Root>'
	},
	'missing-label': {
		id: 'missing-label',
		severity: 'error',
		message:
			'<{name}> may be missing an accessible label — add aria-label or wrap in <Field.Root> with <Label>',
		suggestedFix: 'aria-label="..."'
	},
	'missing-alt': {
		id: 'missing-alt',
		severity: 'error',
		message: '<Avatar> is missing "alt" and "fallback" props for accessibility',
		suggestedFix: 'alt="..."'
	},
	'prefer-grid-layout': {
		id: 'prefer-grid-layout',
		severity: 'error',
		message:
			'Move page layout into src/layout.css with [data-layout] hooks. Use grid for track-based structure and flex only for one-dimensional page layout there.',
		suggestedFix: 'Move layout CSS to src/layout.css'
	},
	'use-field-component': {
		id: 'use-field-component',
		severity: 'error',
		message:
			'Use <Field.Root> + <Label> instead of custom field markup. Field provides accessible labeling, error states, and consistent spacing.',
		suggestedFix: '<Field.Root> + <Label>'
	},
	'use-button-component': {
		id: 'use-button-component',
		severity: 'error',
		message:
			"Use DryUI's <Button> component instead of raw <button> with custom classes. Button provides variants, sizes, loading states, and theme-consistent styling.",
		suggestedFix: '<Button>'
	},
	'use-container-component': {
		id: 'use-container-component',
		severity: 'error',
		message: 'Use src/layout.css grid tracks instead of custom max-width + margin centering.',
		suggestedFix: 'src/layout.css'
	},
	'interactive-card-wrapper': {
		id: 'interactive-card-wrapper',
		severity: 'warning',
		message:
			'Wrapper elements around interactive surfaces (raw <button> or <a> styled as cards) should use display: grid or be removed. Plain block wrappers can collapse interactive surfaces to 0px width in grid/list layouts.',
		suggestedFix: 'display: grid'
	},
	'hardcoded-color': {
		id: 'hardcoded-color',
		severity: 'suggestion',
		message: 'Hardcoded color value — consider using `--dry-*` CSS custom properties for theming',
		suggestedFix: 'var(--dry-*)'
	},
	'prefer-container': {
		id: 'prefer-container',
		severity: 'suggestion',
		message:
			'Manual centering with max-width + margin auto — consider src/layout.css grid tracks instead',
		suggestedFix: 'src/layout.css'
	},
	'theme-in-style': {
		id: 'theme-in-style',
		severity: 'suggestion',
		message:
			'Custom --dry-* variable declarations detected in <style> — run the `diagnose` tool on your theme CSS for a full health check',
		suggestedFix: 'Move custom --dry-* declarations to theme CSS'
	},
	'prefer-separator': {
		id: 'prefer-separator',
		severity: 'error',
		message: 'Raw <hr> element — use <Separator /> for consistent styling',
		suggestedFix: '<Separator />'
	},
	'missing-token': {
		id: 'missing-token',
		severity: 'error',
		message:
			'Required semantic token {variable} is not defined. Full-theme files must define every semantic token (run: ask --scope recipe "customize tokens").',
		suggestedFix: 'Add {variable} with a color that fits your theme'
	},
	'partial-override': {
		id: 'partial-override',
		severity: 'info',
		message:
			'{count} --dry-* token override(s) detected in a non-theme file. This is fine for scoped tweaks, but globally overriding a few tokens at :root/html/body often masks contrast problems. For a full custom theme, rename to *.theme.css or add /* @dryui-theme */ at the top. For 1-10 site-wide tweaks, scope them under .page / body selectors. For 1-5 per-route tweaks, put them in a scoped component style (run: ask --scope recipe "customize tokens").',
		suggestedFix:
			'Either (a) rename to *.theme.css for a full theme, (b) add /* @dryui-theme */ directive, (c) scope under .page / body, or (d) move to a per-route component <style>.'
	},
	'theme-import-order': {
		id: 'theme-import-order',
		severity: 'error',
		message:
			'Import @dryui/ui theme CSS BEFORE local CSS that overrides --dry-* tokens. Local CSS imported first has its overrides clobbered by the theme defaults, so the theme "wins" and overrides appear to have no effect (run: ask --scope recipe "customize tokens").',
		suggestedFix:
			'Reorder: import "@dryui/ui/themes/default.css" and "@dryui/ui/themes/dark.css" BEFORE local "../app.css" (or similar).'
	},
	'wrong-type': {
		id: 'wrong-type',
		severity: 'error',
		message:
			'{variable} expects a {expectedType} value but got "{actual}" (classified as {classified})',
		suggestedFix: 'Replace with a {expectedTypeExample}'
	},
	'transparent-surface': {
		id: 'transparent-surface',
		severity: 'warning',
		message:
			'Surface color has very low opacity ({alpha}) — cards and elevated elements will be nearly invisible',
		suggestedFix: 'Use a solid color (e.g., #1e293b for dark themes, #f8fafc for light themes)'
	},
	'low-contrast-text': {
		id: 'low-contrast-text',
		severity: 'warning',
		message:
			'Low contrast between {variable} and --dry-color-bg-base (brightness difference: {difference})',
		suggestedFix: 'Increase brightness difference between text and background to at least 125'
	},
	'no-elevation': {
		id: 'no-elevation',
		severity: 'warning',
		message:
			'{left} and {right} have near-identical brightness (difference: {difference}) — {surfaceHint}',
		suggestedFix: 'Make the later surface 1-2 steps lighter or darker than the earlier surface'
	},
	'missing-pairing': {
		id: 'missing-pairing',
		severity: 'warning',
		message: '{source} is defined but its pair {missing} is missing',
		suggestedFix: 'Add {missing} to complete the color pairing'
	},
	'unknown-component-token': {
		id: 'unknown-component-token',
		severity: 'warning',
		message: '{variable} is not a recognized component token in the spec',
		suggestedFix: "Check spelling against the component's cssVars in the spec"
	},
	'transparent-component-bg': {
		id: 'transparent-component-bg',
		severity: 'warning',
		message: '{variable} {detail}',
		suggestedFix:
			'Use a solid color or reference a background token (e.g., var(--dry-color-bg-raised))'
	},
	'dark-scheme-no-overrides': {
		id: 'dark-scheme-no-overrides',
		severity: 'warning',
		message:
			'Project uses a dark color scheme ({signals}) but has no --dry-color-* overrides. DryUI\'s default theme is light — components will have poor contrast on dark backgrounds. Either use theme: "dark" in the generate tool, or add --dry-color-* overrides to map DryUI tokens to your dark palette.',
		suggestedFix:
			'Use theme: "dark" in dryui.page(), or override --dry-color-bg-base, --dry-color-bg-raised, --dry-color-text-strong, --dry-color-text-weak, and other semantic tokens with dark-appropriate values'
	},
	'unresolvable-var': {
		id: 'unresolvable-var',
		severity: 'info',
		message:
			'{variable} references {reference} which is not defined in this CSS — type and contrast checks skipped'
	}
} as const satisfies Record<string, RuleCatalogEntry>;

export type RuleCatalogId = keyof typeof RULE_CATALOG;

export type RuleTemplateValue = string | number;

export function formatRuleText(
	template: string | undefined,
	values: Record<string, RuleTemplateValue> = {}
): string | null {
	if (!template) return null;
	if (!template.includes('{')) return template;
	return template.replace(/\{([a-zA-Z0-9]+)\}/g, (match, key) => {
		const value = values[key];
		return value === undefined ? match : String(value);
	});
}

export function ruleMessage(
	id: RuleCatalogId,
	values: Record<string, RuleTemplateValue> = {}
): string {
	return formatRuleText(RULE_CATALOG[id].message, values) ?? RULE_CATALOG[id].message;
}

export function ruleSuggestedFix(
	id: RuleCatalogId,
	values: Record<string, RuleTemplateValue> = {}
): string | null {
	const entry = RULE_CATALOG[id];
	return formatRuleText('suggestedFix' in entry ? entry.suggestedFix : undefined, values);
}

/**
 * Lookup the category for a rule id. Entries without an explicit `category`
 * default to `'correctness'`. Works for both catalog ids and unknown ids
 * (returns `'correctness'` for unknown ids so category filters don't
 * accidentally drop new rules that haven't been registered yet).
 */
export function getRuleCategory(id: string): RuleCategory {
	const entry = (RULE_CATALOG as Record<string, RuleCatalogEntry>)[id];
	return entry?.category ?? 'correctness';
}

export function serializeRuleCatalog(): string {
	return Object.values(RULE_CATALOG)
		.map((entry) =>
			[
				entry.id,
				entry.severity,
				entry.message,
				'suggestedFix' in entry ? entry.suggestedFix : ''
			].join('\t')
		)
		.join('\n');
}
