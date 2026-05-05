import {
	RULE_CATALOG,
	ruleMessage,
	type RuleCatalogId,
	type RuleSeverity,
	type RuleTemplateValue
} from './rule-catalog.js';

export interface Violation {
	rule: string;
	message: string;
	line: number;
}

export type LintTarget = 'script' | 'markup' | 'style' | 'layout-css';

export type FirstPartyLintTarget = 'component-source' | 'primitives';

export interface FirstPartyLintScanTarget {
	readonly directory: string;
	readonly target: FirstPartyLintTarget;
	readonly includeCss: boolean;
}

export const FIRST_PARTY_LINT_SCAN_TARGETS: readonly FirstPartyLintScanTarget[] = [
	{ directory: 'packages/ui/src', target: 'component-source', includeCss: true },
	{ directory: 'packages/feedback-server/ui/src', target: 'component-source', includeCss: true },
	{ directory: 'packages/primitives/src', target: 'primitives', includeCss: false }
];

export type LintMessageValues = Record<string, RuleTemplateValue>;

interface LintRuleDefinition {
	readonly catalogId: RuleCatalogId;
	readonly targets: readonly LintTarget[];
	readonly ownerPaths?: readonly string[];
	readonly allowTokens?: readonly string[];
}

const LINT_RULE_DEFINITIONS = {
	'dryui/no-layout-component': {
		catalogId: 'dryui/no-layout-component',
		targets: ['script', 'markup']
	},
	'dryui/no-inline-style': {
		catalogId: 'dryui/no-inline-style',
		targets: ['markup']
	},
	'dryui/no-style-directive': {
		catalogId: 'dryui/no-style-directive',
		targets: ['markup']
	},
	'dryui/no-attach': {
		catalogId: 'dryui/no-attach',
		targets: ['markup']
	},
	'dryui/no-raw-element': {
		catalogId: 'dryui/no-raw-element',
		targets: ['markup']
	},
	'dryui/no-component-class': {
		catalogId: 'dryui/no-component-class',
		targets: ['markup']
	},
	'dryui/no-css-ignore': {
		catalogId: 'dryui/no-css-ignore',
		targets: ['markup']
	},
	'dryui/no-svelte-element': {
		catalogId: 'dryui/no-svelte-element',
		targets: ['markup'],
		ownerPaths: ['/motion/', '/page-header/'],
		allowTokens: ['svelte-element']
	},
	'dryui/no-anchor-without-href': {
		catalogId: 'dryui/no-anchor-without-href',
		targets: ['markup']
	},
	'dryui/no-raw-native-element': {
		catalogId: 'dryui/no-raw-native-element',
		targets: ['markup']
	},
	'dryui/no-raw-grid': {
		catalogId: 'dryui/no-raw-grid',
		targets: ['style'],
		ownerPaths: ['src/layout.css']
	},
	'dryui/no-flex': {
		catalogId: 'dryui/no-flex',
		targets: ['style'],
		ownerPaths: ['/page-header/', 'src/layout.css'],
		allowTokens: ['flex']
	},
	'dryui/no-width': {
		catalogId: 'dryui/no-width',
		targets: ['style'],
		ownerPaths: ['/mega-menu/', '/internal/'],
		allowTokens: ['width']
	},
	'dryui/no-all-unset': {
		catalogId: 'dryui/no-all-unset',
		targets: ['style']
	},
	'dryui/no-important': {
		catalogId: 'dryui/no-important',
		targets: ['style']
	},
	'dryui/no-global': {
		catalogId: 'dryui/no-global',
		targets: ['style'],
		ownerPaths: ['/markdown-renderer/']
	},
	'dryui/no-media-sizing': {
		catalogId: 'dryui/no-media-sizing',
		targets: ['style']
	},
	'dryui/prefer-focus-ring-token': {
		catalogId: 'dryui/prefer-focus-ring-token',
		targets: ['style']
	},
	'dryui/no-partial-inset-shadow': {
		catalogId: 'dryui/no-partial-inset-shadow',
		targets: ['style'],
		ownerPaths: ['/option-picker/', '/lib/demos/'],
		allowTokens: ['inset-shadow']
	},
	'dryui/layout-css-at-rule': {
		catalogId: 'dryui/layout-css-at-rule',
		targets: ['layout-css']
	},
	'dryui/layout-css-selector': {
		catalogId: 'dryui/layout-css-selector',
		targets: ['layout-css']
	},
	'dryui/layout-css-property': {
		catalogId: 'dryui/layout-css-property',
		targets: ['layout-css']
	},
	'dryui/layout-css-value': {
		catalogId: 'dryui/layout-css-value',
		targets: ['layout-css']
	},
	'project/theme-import-order': {
		catalogId: 'theme-import-order',
		targets: ['script']
	}
} as const satisfies Record<string, LintRuleDefinition>;

export type LintRuleId = keyof typeof LINT_RULE_DEFINITIONS;

export interface LintPolicyOptions {
	readonly filename?: string | undefined;
	readonly target?: LintTarget | undefined;
	readonly source?: string;
}

export interface LintPolicy {
	readonly filename?: string | undefined;
	readonly target?: LintTarget | undefined;
	isRuleEnabled(ruleId: LintRuleId): boolean;
	shouldReport(ruleId: LintRuleId, line: number): boolean;
	violation(ruleId: LintRuleId, line: number, values?: LintMessageValues): Violation | null;
}

const FIRST_PARTY_COMPONENT_SOURCE_IGNORED_RULES = new Set([
	'dryui/no-raw-element',
	'dryui/no-raw-grid'
]);

const FIRST_PARTY_PRIMITIVES_ALLOWED_RULES = new Set(['dryui/no-svelte-element']);

const HTML_ALLOW_COMMENT_RE = /<!--\s*dryui-allow\s+([^>]*)-->/g;
const CSS_ALLOW_COMMENT_RE = /\/\*\s*dryui-allow\s+([\s\S]*?)\*\//g;
const ALLOW_TOKEN_RE = /[a-zA-Z0-9_-]+/g;

function ruleDefinition(ruleId: LintRuleId): LintRuleDefinition {
	return LINT_RULE_DEFINITIONS[ruleId];
}

function maybeRuleCatalogId(ruleId: string): RuleCatalogId | null {
	const definition = (LINT_RULE_DEFINITIONS as Record<string, LintRuleDefinition | undefined>)[
		ruleId
	];
	if (definition) return definition.catalogId;
	if (ruleId in RULE_CATALOG) return ruleId as RuleCatalogId;
	return null;
}

function buildLineIndex(content: string): number[] {
	const starts = [0];
	for (let i = 0; i < content.length; i++) {
		if (content.charCodeAt(i) === 10) starts.push(i + 1);
	}
	return starts;
}

function lookupLine(lineStarts: readonly number[], index: number): number {
	let lo = 0;
	let hi = lineStarts.length - 1;
	while (lo < hi) {
		const mid = (lo + hi + 1) >>> 1;
		if (lineStarts[mid]! <= index) lo = mid;
		else hi = mid - 1;
	}
	return lo + 1;
}

function collectAllowComments(content: string): Map<number, Set<string>> {
	const lineStarts = buildLineIndex(content);
	const byLine = new Map<number, Set<string>>();

	const addMatches = (re: RegExp) => {
		for (const match of content.matchAll(re)) {
			const rawTokens = match[1] ?? '';
			const tokens = rawTokens.match(ALLOW_TOKEN_RE) ?? [];
			if (tokens.length === 0) continue;
			const commentEnd = (match.index ?? 0) + match[0].length - 1;
			const line = lookupLine(lineStarts, commentEnd);
			const existing = byLine.get(line) ?? new Set<string>();
			for (const token of tokens) existing.add(token);
			byLine.set(line, existing);
		}
	};

	addMatches(HTML_ALLOW_COMMENT_RE);
	addMatches(CSS_ALLOW_COMMENT_RE);
	return byLine;
}

function targetAllowsRule(target: LintTarget | undefined, ruleId: LintRuleId): boolean {
	if (!target) return true;
	return ruleDefinition(ruleId).targets.includes(target);
}

export function lintRuleMessage(ruleId: LintRuleId, values: LintMessageValues = {}): string {
	return ruleMessage(ruleDefinition(ruleId).catalogId, values);
}

export function lintRuleSeverity(ruleId: string): RuleSeverity {
	const catalogId = maybeRuleCatalogId(ruleId);
	if (!catalogId) return 'error';
	return RULE_CATALOG[catalogId].severity;
}

export function lintViolation(
	ruleId: LintRuleId,
	line: number,
	values: LintMessageValues = {}
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

export function createLintPolicy(options: LintPolicyOptions = {}): LintPolicy {
	const allowComments = options.source ? collectAllowComments(options.source) : new Map();

	const isAllowedByComment = (ruleId: LintRuleId, line: number): boolean => {
		const allowTokens = ruleDefinition(ruleId).allowTokens;
		if (!allowTokens || allowTokens.length === 0) return false;
		const previousLineTokens = allowComments.get(line - 1);
		if (!previousLineTokens) return false;
		return allowTokens.some((token) => previousLineTokens.has(token));
	};

	const isRuleEnabled = (ruleId: LintRuleId): boolean =>
		targetAllowsRule(options.target, ruleId) && !isRuleOwner(options.filename, ruleId);

	const shouldReport = (ruleId: LintRuleId, line: number): boolean =>
		isRuleEnabled(ruleId) && !isAllowedByComment(ruleId, line);

	return {
		filename: options.filename,
		target: options.target,
		isRuleEnabled,
		shouldReport,
		violation(ruleId, line, values = {}) {
			if (!shouldReport(ruleId, line)) return null;
			return lintViolation(ruleId, line, values);
		}
	};
}

export function shouldReportFirstPartyViolation(
	target: FirstPartyLintTarget,
	violation: Violation
): boolean {
	if (target === 'component-source') {
		return !FIRST_PARTY_COMPONENT_SOURCE_IGNORED_RULES.has(violation.rule);
	}
	return FIRST_PARTY_PRIMITIVES_ALLOWED_RULES.has(violation.rule);
}

export function filterFirstPartyViolations(
	target: FirstPartyLintTarget,
	violations: readonly Violation[]
): Violation[] {
	return violations.filter((violation) => shouldReportFirstPartyViolation(target, violation));
}
