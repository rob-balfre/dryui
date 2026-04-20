import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

type Metric = {
	total: number;
	covered: number;
	pct: number | null;
};

type UnitPackageSummary = {
	name: string;
	files: number;
	lines: Metric;
	functions: Metric;
};

type CoverageSummary = {
	status: string;
	unit: {
		lines: Metric;
		functions: Metric;
		packages: UnitPackageSummary[];
	} | null;
	browser: {
		lines: Metric | null;
		functions: Metric | null;
		statements: Metric | null;
		branches: Metric | null;
	} | null;
};

export type CoverageBaseline = {
	unit: {
		linesPct: number;
		functionsPct: number;
		packages: Record<
			string,
			{
				linesPct: number;
				functionsPct: number;
			}
		>;
	};
	browser: {
		linesPct: number;
		functionsPct: number;
		statementsPct: number;
		branchesPct: number;
	};
};

export type CoverageRegression = {
	label: string;
	expectedPct: number;
	actualPct: number | null;
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaults = {
	summary: path.join(root, 'coverage/summary/coverage-summary.json'),
	baseline: path.join(root, 'scripts/coverage-baseline.json')
};

const EPSILON = 0.01;

if (import.meta.main) {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		printHelp();
		process.exit(0);
	}

	const summaryPath = path.resolve(root, args.summary ?? defaults.summary);
	const baselinePath = path.resolve(root, args.baseline ?? defaults.baseline);

	if (!existsSync(summaryPath)) {
		console.error(`Coverage summary not found: ${toRepoPath(summaryPath)}`);
		process.exit(1);
	}

	if (!existsSync(baselinePath)) {
		console.error(`Coverage baseline not found: ${toRepoPath(baselinePath)}`);
		process.exit(1);
	}

	const summary = JSON.parse(readFileSync(summaryPath, 'utf8')) as CoverageSummary;
	const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')) as CoverageBaseline;
	const regressions = compareCoverage(summary, baseline);

	console.log(`Coverage baseline: ${toRepoPath(baselinePath)}`);
	console.log(`Coverage summary: ${toRepoPath(summaryPath)}`);

	if (regressions.length === 0) {
		console.log('Coverage baseline check passed');
		process.exit(0);
	}

	console.error('Coverage regressions detected:');
	for (const regression of regressions) {
		console.error(
			`  ${regression.label}: expected >= ${formatPct(regression.expectedPct)}, got ${formatPct(regression.actualPct)}`
		);
	}
	process.exit(1);
}

function parseArgs(argv: string[]): { summary?: string; baseline?: string; help: boolean } {
	const parsed: { summary?: string; baseline?: string; help: boolean } = { help: false };

	for (const arg of argv) {
		if (arg === '--help' || arg === '-h') {
			parsed.help = true;
			continue;
		}

		const [flag, value] = arg.split('=', 2);
		if (!value) {
			throw new Error(`Expected "--flag=value" format, received "${arg}".`);
		}

		switch (flag) {
			case '--summary':
				parsed.summary = value;
				break;
			case '--baseline':
				parsed.baseline = value;
				break;
			default:
				throw new Error(`Unknown flag "${flag}".`);
		}
	}

	return parsed;
}

function printHelp(): void {
	console.log(`Usage: bun run scripts/check-coverage-baseline.ts [options]

Options:
  --summary=<path>   Coverage summary JSON to compare.
  --baseline=<path>  Baseline JSON to enforce.
  --help             Show this message.`);
}

export function compareCoverage(
	summary: CoverageSummary,
	baseline: CoverageBaseline
): CoverageRegression[] {
	const regressions: CoverageRegression[] = [];

	compareMetric(regressions, 'unit lines', summary.unit?.lines.pct ?? null, baseline.unit.linesPct);
	compareMetric(
		regressions,
		'unit functions',
		summary.unit?.functions.pct ?? null,
		baseline.unit.functionsPct
	);
	compareMetric(
		regressions,
		'browser lines',
		summary.browser?.lines?.pct ?? null,
		baseline.browser.linesPct
	);
	compareMetric(
		regressions,
		'browser functions',
		summary.browser?.functions?.pct ?? null,
		baseline.browser.functionsPct
	);
	compareMetric(
		regressions,
		'browser branches',
		summary.browser?.branches?.pct ?? null,
		baseline.browser.branchesPct
	);
	compareMetric(
		regressions,
		'browser statements',
		summary.browser?.statements?.pct ?? null,
		baseline.browser.statementsPct
	);

	const packageMap = new Map(summary.unit?.packages.map((pkg) => [pkg.name, pkg]) ?? []);
	for (const [packageName, packageBaseline] of Object.entries(baseline.unit.packages)) {
		const pkg = packageMap.get(packageName);
		compareMetric(
			regressions,
			`${packageName} lines`,
			pkg?.lines.pct ?? null,
			packageBaseline.linesPct
		);
		compareMetric(
			regressions,
			`${packageName} functions`,
			pkg?.functions.pct ?? null,
			packageBaseline.functionsPct
		);
	}

	return regressions;
}

function compareMetric(
	regressions: CoverageRegression[],
	label: string,
	actualPct: number | null,
	expectedPct: number
): void {
	if (actualPct === null || actualPct + EPSILON < expectedPct) {
		regressions.push({ label, expectedPct, actualPct });
	}
}

function formatPct(value: number | null): string {
	return value === null ? 'missing' : `${value.toFixed(2)}%`;
}

function toRepoPath(targetPath: string): string {
	const relativePath = path.relative(root, targetPath).replaceAll(path.sep, '/');
	return relativePath.length > 0 && !relativePath.startsWith('..')
		? relativePath
		: targetPath.replaceAll(path.sep, '/');
}
