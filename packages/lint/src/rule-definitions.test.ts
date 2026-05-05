import { describe, expect, test } from 'bun:test';
import { isRuleOwner, lintRuleMessage, lintViolation } from './rule-definitions.js';

describe('lint rule definitions', () => {
	test('emits catalog-backed violations', () => {
		expect(
			lintViolation('dryui/no-flex', 3, {
				value: 'display: flex',
				guidance: 'display: grid'
			})
		).toEqual({
			rule: 'dryui/no-flex',
			message:
				'Do not use display: flex. Use display: grid. For chip/tag wrapping, use ChipGroup.Root.',
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

	test('keeps owner policy with the rule definition', () => {
		expect(
			isRuleOwner(
				'/abs/packages/primitives/src/page-header/page-header-meta.svelte',
				'dryui/no-flex'
			)
		).toBe(true);
		expect(isRuleOwner('/abs/packages/ui/src/card/card-root.svelte', 'dryui/no-flex')).toBe(false);
	});
});
