import { describe, expect, it } from 'bun:test';
import {
	collectTouchedInteractiveComponents,
	evaluateCoveragePolicy,
	hasCoverageEvidence,
	hasCoverageExemption
} from '../../scripts/check-interactive-coverage.ts';

describe('interactive coverage policy', () => {
	it('collects touched Tier 0 and Tier 1 components from source paths', () => {
		expect(
			collectTouchedInteractiveComponents([
				'packages/ui/src/popover/popover-content.svelte',
				'packages/primitives/src/date-picker/date-picker-root.svelte',
				'packages/ui/src/badge/badge.svelte'
			])
		).toEqual(['DatePicker', 'Popover']);
	});

	it('accepts browser or docs visual coverage evidence', () => {
		expect(
			hasCoverageEvidence([
				'packages/ui/src/popover/popover-content.svelte',
				'tests/browser/popover.browser.test.ts'
			])
		).toBe(true);
		expect(
			hasCoverageEvidence([
				'packages/ui/src/popover/popover-content.svelte',
				'tests/playwright/docs-overlay.visual.spec.ts'
			])
		).toBe(true);
	});

	it('requires an issue-backed exemption note', () => {
		expect(hasCoverageExemption('coverage-exemption: #321')).toBe(true);
		expect(hasCoverageExemption('Coverage-Exemption: #321')).toBe(true);
		expect(hasCoverageExemption('coverage-exemption: pending')).toBe(false);
	});

	it('fails when interactive component changes do not include coverage evidence or an exemption', () => {
		const result = evaluateCoveragePolicy(['packages/ui/src/popover/popover-content.svelte']);

		expect(result.ok).toBe(false);
		expect(result.touchedComponents).toEqual(['Popover']);
		expect(result.message).toContain('coverage-exemption: #123');
	});

	it('passes with coverage evidence or an exemption', () => {
		expect(
			evaluateCoveragePolicy([
				'packages/ui/src/popover/popover-content.svelte',
				'tests/browser/popover.browser.test.ts'
			]).ok
		).toBe(true);
		expect(
			evaluateCoveragePolicy(
				['packages/ui/src/popover/popover-content.svelte'],
				'coverage-exemption: #123'
			).ok
		).toBe(true);
	});
});
