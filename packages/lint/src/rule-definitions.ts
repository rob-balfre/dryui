import { ruleMessage, type RuleCatalogId, type RuleTemplateValue } from './rule-catalog.js';

export interface Violation {
	rule: string;
	message: string;
	line: number;
}

type MessageValues = Record<string, RuleTemplateValue>;

interface LintRuleDefinition {
	readonly catalogId: RuleCatalogId;
	readonly ownerPaths?: readonly string[];
}

/**
 * Rule-level contract shared by the lint scanners. Scanner modules still own
 * parsing and matching, while this module owns rule identity, messages, and
 * owner carve-outs.
 */
const LINT_RULE_DEFINITIONS = {
	'dryui/no-layout-component': {
		catalogId: 'dryui/no-layout-component'
	},
	'dryui/no-inline-style': {
		catalogId: 'dryui/no-inline-style'
	},
	'dryui/no-style-directive': {
		catalogId: 'dryui/no-style-directive'
	},
	'dryui/no-attach': {
		catalogId: 'dryui/no-attach'
	},
	'dryui/no-raw-element': {
		catalogId: 'dryui/no-raw-element'
	},
	'dryui/no-component-class': {
		catalogId: 'dryui/no-component-class'
	},
	'dryui/no-css-ignore': {
		catalogId: 'dryui/no-css-ignore'
	},
	'dryui/no-svelte-element': {
		catalogId: 'dryui/no-svelte-element',
		ownerPaths: ['/motion/', '/page-header/']
	},
	'dryui/no-anchor-without-href': {
		catalogId: 'dryui/no-anchor-without-href'
	},
	'dryui/no-raw-native-element': {
		catalogId: 'dryui/no-raw-native-element'
	},
	'dryui/no-raw-grid': {
		catalogId: 'dryui/no-raw-grid',
		ownerPaths: ['src/layout.css']
	},
	'dryui/no-flex': {
		catalogId: 'dryui/no-flex',
		ownerPaths: ['/page-header/', 'src/layout.css']
	},
	'dryui/no-width': {
		catalogId: 'dryui/no-width',
		ownerPaths: ['/mega-menu/', '/internal/']
	},
	'dryui/no-all-unset': {
		catalogId: 'dryui/no-all-unset'
	},
	'dryui/no-important': {
		catalogId: 'dryui/no-important'
	},
	'dryui/no-global': {
		catalogId: 'dryui/no-global',
		ownerPaths: ['/markdown-renderer/']
	},
	'dryui/no-media-sizing': {
		catalogId: 'dryui/no-media-sizing'
	},
	'dryui/prefer-focus-ring-token': {
		catalogId: 'dryui/prefer-focus-ring-token'
	},
	'dryui/no-partial-inset-shadow': {
		catalogId: 'dryui/no-partial-inset-shadow',
		ownerPaths: ['/option-picker/', '/lib/demos/']
	},
	'dryui/layout-css-at-rule': {
		catalogId: 'dryui/layout-css-at-rule'
	},
	'dryui/layout-css-selector': {
		catalogId: 'dryui/layout-css-selector'
	},
	'dryui/layout-css-property': {
		catalogId: 'dryui/layout-css-property'
	},
	'dryui/layout-css-value': {
		catalogId: 'dryui/layout-css-value'
	},
	'project/theme-import-order': {
		catalogId: 'theme-import-order'
	}
} as const satisfies Record<string, LintRuleDefinition>;

export type LintRuleId = keyof typeof LINT_RULE_DEFINITIONS;

function ruleDefinition(ruleId: LintRuleId): LintRuleDefinition {
	return LINT_RULE_DEFINITIONS[ruleId];
}

export function lintRuleMessage(ruleId: LintRuleId, values: MessageValues = {}): string {
	return ruleMessage(ruleDefinition(ruleId).catalogId, values);
}

export function lintViolation(
	ruleId: LintRuleId,
	line: number,
	values: MessageValues = {}
): Violation {
	return {
		rule: ruleId,
		message: lintRuleMessage(ruleId, values),
		line
	};
}

export function isRuleOwner(filename: string | undefined, ruleId: LintRuleId): boolean {
	if (!filename) return false;
	const owners = ruleDefinition(ruleId).ownerPaths;
	if (!owners || owners.length === 0) return false;
	const normalized = filename.replace(/\\/g, '/');
	return owners.some((path) => normalized.includes(path));
}
