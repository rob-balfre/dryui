import { describe, expect, test } from 'bun:test';
import { compareCoverage, type CoverageBaseline } from '../../scripts/check-coverage-baseline.ts';

const baseline: CoverageBaseline = {
	unit: {
		linesPct: 50,
		functionsPct: 40,
		packages: {
			'packages/cli': {
				linesPct: 20,
				functionsPct: 10
			},
			'packages/ui': {
				linesPct: 60,
				functionsPct: 70
			}
		}
	},
	browser: {
		linesPct: 25,
		functionsPct: 30,
		statementsPct: 24,
		branchesPct: 15
	}
};

describe('compareCoverage', () => {
	test('passes when every tracked metric meets or exceeds the baseline', () => {
		const regressions = compareCoverage(
			{
				status: 'ok',
				unit: {
					lines: { total: 10, covered: 6, pct: 60 },
					functions: { total: 10, covered: 5, pct: 50 },
					packages: [
						{
							name: 'packages/cli',
							files: 1,
							lines: { total: 10, covered: 3, pct: 30 },
							functions: { total: 10, covered: 2, pct: 20 }
						},
						{
							name: 'packages/ui',
							files: 1,
							lines: { total: 10, covered: 7, pct: 70 },
							functions: { total: 10, covered: 8, pct: 80 }
						}
					]
				},
				browser: {
					lines: { total: 10, covered: 3, pct: 30 },
					functions: { total: 10, covered: 4, pct: 40 },
					statements: { total: 10, covered: 3, pct: 30 },
					branches: { total: 10, covered: 2, pct: 20 }
				}
			},
			baseline
		);

		expect(regressions).toEqual([]);
	});

	test('reports top-level, package-level, and missing-package regressions', () => {
		const regressions = compareCoverage(
			{
				status: 'ok',
				unit: {
					lines: { total: 10, covered: 4, pct: 40 },
					functions: { total: 10, covered: 5, pct: 50 },
					packages: [
						{
							name: 'packages/cli',
							files: 1,
							lines: { total: 10, covered: 1, pct: 10 },
							functions: { total: 10, covered: 0, pct: 0 }
						}
					]
				},
				browser: {
					lines: { total: 10, covered: 2, pct: 20 },
					functions: { total: 10, covered: 4, pct: 40 },
					statements: { total: 10, covered: 1, pct: 10 },
					branches: { total: 10, covered: 2, pct: 20 }
				}
			},
			baseline
		);

		expect(regressions).toEqual([
			{ label: 'unit lines', expectedPct: 50, actualPct: 40 },
			{ label: 'browser lines', expectedPct: 25, actualPct: 20 },
			{ label: 'browser statements', expectedPct: 24, actualPct: 10 },
			{ label: 'packages/cli lines', expectedPct: 20, actualPct: 10 },
			{ label: 'packages/cli functions', expectedPct: 10, actualPct: 0 },
			{ label: 'packages/ui lines', expectedPct: 60, actualPct: null },
			{ label: 'packages/ui functions', expectedPct: 70, actualPct: null }
		]);
	});
});
