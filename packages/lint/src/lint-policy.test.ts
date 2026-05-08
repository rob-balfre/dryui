import { describe, expect, test } from 'bun:test';
import {
	createLintPolicy,
	filterFirstPartyViolations,
	isRuleOwner,
	lintRuleMessage,
	lintRuleSeverity,
	lintViolation,
	shouldReportFirstPartyViolation,
	type Violation
} from './lint-policy.js';

describe('lint policy', () => {
	test('emits catalog-backed violations with formatted messages', () => {
		expect(
			lintViolation('dryui/no-flex', 3, {
				value: 'display: flex',
				guidance: 'display: grid'
			})
		).toEqual({
			rule: 'dryui/no-flex',
			message:
				'Do not use display: flex. Use display: grid. For chip/tag wrapping, use ChipGroup.Root for the chip row. The preceding-line /* dryui-allow flex */ escape hatch is ONLY for isolated component internals that genuinely need one-dimensional intrinsic layout and cannot be expressed with grid or src/layout.css. Do NOT silence this rule on wrappers, cards, forms, navigation shells, page sections, or bulk layout.',
			line: 3
		});
	});

	test('maps project-facing rule ids to catalog messages', () => {
		expect(lintViolation('project/theme-import-order', 2)).toEqual({
			rule: 'project/theme-import-order',
			message: lintRuleMessage('project/theme-import-order'),
			line: 2
		});
	});

	test('keeps owner carve-outs in policy', () => {
		expect(
			isRuleOwner(
				'/abs/packages/primitives/src/page-header/page-header-meta.svelte',
				'dryui/no-flex'
			)
		).toBe(true);
		expect(isRuleOwner('/abs/packages/ui/src/mega-menu/mega-menu.svelte', 'dryui/no-width')).toBe(
			true
		);
		expect(
			isRuleOwner(
				'/abs/packages/ui/src/option-picker/option-picker-preview.svelte',
				'dryui/no-width'
			)
		).toBe(false);
	});

	test('targets disable rules outside their scanner surface', () => {
		const markupPolicy = createLintPolicy({ target: 'markup' });
		expect(markupPolicy.isRuleEnabled('dryui/no-svelte-element')).toBe(true);
		expect(markupPolicy.isRuleEnabled('dryui/no-flex')).toBe(false);
	});

	test('reads severity through catalog-backed rule mapping', () => {
		expect(lintRuleSeverity('project/theme-import-order')).toBe('error');
		expect(lintRuleSeverity('hardcoded-color')).toBe('suggestion');
		expect(lintRuleSeverity('unknown/rule')).toBe('error');
	});

	test('suppresses only matching allow-token rules on the preceding line', () => {
		const policy = createLintPolicy({
			target: 'style',
			source: `/* dryui-allow width */
.one { width: 300px; }
.two { display: flex; }`
		});
		expect(policy.shouldReport('dryui/no-width', 2)).toBe(false);
		expect(policy.shouldReport('dryui/no-flex', 3)).toBe(true);
	});

	test('filters first-party component-source rules', () => {
		const violations: Violation[] = [
			violation('dryui/no-raw-element'),
			violation('dryui/no-raw-grid'),
			violation('dryui/no-flex')
		];
		expect(filterFirstPartyViolations('component-source', violations).map((v) => v.rule)).toEqual([
			'dryui/no-flex'
		]);
	});

	test('filters primitives to no-svelte-element only', () => {
		expect(
			shouldReportFirstPartyViolation('primitives', violation('dryui/no-svelte-element'))
		).toBe(true);
		expect(shouldReportFirstPartyViolation('primitives', violation('dryui/no-flex'))).toBe(false);
	});
});

function violation(rule: string): Violation {
	return {
		rule,
		message: rule,
		line: 1
	};
}
