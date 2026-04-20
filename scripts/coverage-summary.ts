import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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

type UnitSummary = {
	sourcePath: string;
	lines: Metric;
	functions: Metric;
	packages: UnitPackageSummary[];
};

type BrowserSummary = {
	sourcePath: string;
	htmlPath: string;
	lines: Metric | null;
	functions: Metric | null;
	statements: Metric | null;
	branches: Metric | null;
};

type MissingArtifact = {
	label: string;
	path: string;
};

type SummaryPayload = {
	generatedAt: string;
	status: 'ok' | 'missing-artifacts';
	missingArtifacts: MissingArtifact[];
	unit: UnitSummary | null;
	browser: BrowserSummary | null;
	outputs: {
		json: string;
		markdown: string;
	};
};

type UnitAccumulator = {
	files: Set<string>;
	linesFound: number;
	linesHit: number;
	functionsFound: number;
	functionsHit: number;
};

type LcovRecord = {
	sourcePath: string | null;
	linesFound: number;
	linesHit: number;
	fnCount: number | null;
	fnHit: number | null;
	functionDefs: Set<string>;
	functionHits: Map<string, number>;
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaults = {
	unitLcov: path.join(root, 'coverage/unit/lcov.info'),
	browserSummary: path.join(root, 'coverage/browser/coverage-summary.json'),
	browserHtml: path.join(root, 'coverage/browser/index.html'),
	outputDir: path.join(root, 'coverage/summary')
};

const args = parseArgs(process.argv.slice(2));

if (args.help) {
	printHelp();
	process.exit(0);
}

const outputDir = path.resolve(root, args.outputDir ?? defaults.outputDir);
const jsonOutputPath = path.join(outputDir, 'coverage-summary.json');
const markdownOutputPath = path.join(outputDir, 'coverage-summary.md');

const missingArtifacts: MissingArtifact[] = [];

const unitLcovPath = path.resolve(root, args.unitLcov ?? defaults.unitLcov);
const browserSummaryPath = path.resolve(root, args.browserSummary ?? defaults.browserSummary);
const browserHtmlPath = path.resolve(root, args.browserHtml ?? defaults.browserHtml);

const unitSummary = existsSync(unitLcovPath)
	? readUnitCoverage(unitLcovPath)
	: registerMissing('unit lcov', unitLcovPath);

const browserSummary = existsSync(browserSummaryPath)
	? readBrowserCoverage(browserSummaryPath, browserHtmlPath)
	: registerMissing('browser coverage summary', browserSummaryPath);

if (!existsSync(browserHtmlPath)) {
	registerMissing('browser html report', browserHtmlPath);
}

mkdirSync(outputDir, { recursive: true });

const payload: SummaryPayload = {
	generatedAt: new Date().toISOString(),
	status: missingArtifacts.length === 0 ? 'ok' : 'missing-artifacts',
	missingArtifacts,
	unit: unitSummary,
	browser: browserSummary,
	outputs: {
		json: toRepoPath(jsonOutputPath),
		markdown: toRepoPath(markdownOutputPath)
	}
};

writeFileSync(jsonOutputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
writeFileSync(markdownOutputPath, renderMarkdown(payload), 'utf8');

printConsoleSummary(payload);

if (missingArtifacts.length > 0) {
	process.exit(1);
}

function parseArgs(argv: string[]): {
	unitLcov?: string;
	browserSummary?: string;
	browserHtml?: string;
	outputDir?: string;
	help: boolean;
} {
	const parsed: {
		unitLcov?: string;
		browserSummary?: string;
		browserHtml?: string;
		outputDir?: string;
		help: boolean;
	} = { help: false };

	for (const arg of argv) {
		if (arg === '--help' || arg === '-h') {
			parsed.help = true;
			continue;
		}

		const [flag, rawValue] = arg.split('=', 2);
		if (!rawValue) {
			throw new Error(`Expected "--flag=value" format, received "${arg}".`);
		}

		switch (flag) {
			case '--unit-lcov':
				parsed.unitLcov = rawValue;
				break;
			case '--browser-summary':
				parsed.browserSummary = rawValue;
				break;
			case '--browser-html':
				parsed.browserHtml = rawValue;
				break;
			case '--output-dir':
				parsed.outputDir = rawValue;
				break;
			default:
				throw new Error(`Unknown flag "${flag}".`);
		}
	}

	return parsed;
}

function printHelp(): void {
	console.log(`Usage: bun run scripts/coverage-summary.ts [options]

Options:
  --unit-lcov=<path>         Override the unit lcov artifact path.
  --browser-summary=<path>   Override the browser coverage summary JSON path.
  --browser-html=<path>      Override the browser HTML report path.
  --output-dir=<path>        Override the summary output directory.
  --help                     Show this message.`);
}

function registerMissing(label: string, artifactPath: string): null {
	missingArtifacts.push({ label, path: toRepoPath(artifactPath) });
	return null;
}

function readUnitCoverage(lcovPath: string): UnitSummary {
	const text = readFileSync(lcovPath, 'utf8');
	const totals = newAccumulator();
	const packages = new Map<string, UnitAccumulator>();
	let record = newRecord();

	for (const rawLine of text.split(/\r?\n/)) {
		const line = rawLine.trim();

		if (line === 'end_of_record') {
			flushRecord(record, totals, packages);
			record = newRecord();
			continue;
		}

		if (line.startsWith('SF:')) {
			record.sourcePath = line.slice(3);
			continue;
		}

		if (line.startsWith('DA:')) {
			const [, hits] = line.slice(3).split(',', 3);
			const count = Number.parseInt(hits ?? '0', 10);
			record.linesFound += 1;
			record.linesHit += count > 0 ? 1 : 0;
			continue;
		}

		if (line.startsWith('FNF:')) {
			record.fnCount = Number.parseInt(line.slice(4), 10);
			continue;
		}

		if (line.startsWith('FNH:')) {
			record.fnHit = Number.parseInt(line.slice(4), 10);
			continue;
		}

		if (line.startsWith('FN:')) {
			record.functionDefs.add(line.slice(3));
			continue;
		}

		if (line.startsWith('FNDA:')) {
			const [hits, name] = line.slice(5).split(',', 2);
			if (name) {
				record.functionHits.set(name, Number.parseInt(hits, 10));
			}
		}
	}

	flushRecord(record, totals, packages);

	return {
		sourcePath: toRepoPath(lcovPath),
		lines: toMetric(totals.linesFound, totals.linesHit),
		functions: toMetric(totals.functionsFound, totals.functionsHit),
		packages: [...packages.entries()]
			.map(([name, summary]) => ({
				name,
				files: summary.files.size,
				lines: toMetric(summary.linesFound, summary.linesHit),
				functions: toMetric(summary.functionsFound, summary.functionsHit)
			}))
			.sort((left, right) => left.name.localeCompare(right.name))
	};
}

function readBrowserCoverage(summaryPath: string, htmlPath: string): BrowserSummary {
	const parsed = JSON.parse(readFileSync(summaryPath, 'utf8')) as Record<string, unknown>;
	const totals = isCoverageTotals(parsed.total) ? parsed.total : parsed;

	return {
		sourcePath: toRepoPath(summaryPath),
		htmlPath: toRepoPath(htmlPath),
		lines: toMetricFromSummary(totals.lines),
		functions: toMetricFromSummary(totals.functions),
		statements: toMetricFromSummary(totals.statements),
		branches: toMetricFromSummary(totals.branches)
	};
}

function newAccumulator(): UnitAccumulator {
	return {
		files: new Set<string>(),
		linesFound: 0,
		linesHit: 0,
		functionsFound: 0,
		functionsHit: 0
	};
}

function newRecord(): LcovRecord {
	return {
		sourcePath: null,
		linesFound: 0,
		linesHit: 0,
		fnCount: null,
		fnHit: null,
		functionDefs: new Set<string>(),
		functionHits: new Map<string, number>()
	};
}

function flushRecord(
	record: LcovRecord,
	totals: UnitAccumulator,
	packages: Map<string, UnitAccumulator>
): void {
	if (!record.sourcePath) {
		return;
	}

	const functionsFound = record.fnCount ?? record.functionDefs.size;
	const functionsHit =
		record.fnHit ?? [...record.functionHits.values()].filter((value) => value > 0).length;

	accumulate(
		totals,
		record.sourcePath,
		record.linesFound,
		record.linesHit,
		functionsFound,
		functionsHit
	);

	const packageName = inferPackageName(record.sourcePath);
	const packageTotals = packages.get(packageName) ?? newAccumulator();
	accumulate(
		packageTotals,
		record.sourcePath,
		record.linesFound,
		record.linesHit,
		functionsFound,
		functionsHit
	);
	packages.set(packageName, packageTotals);
}

function accumulate(
	target: UnitAccumulator,
	filePath: string,
	linesFound: number,
	linesHit: number,
	functionsFound: number,
	functionsHit: number
): void {
	target.files.add(toRepoPath(filePath));
	target.linesFound += linesFound;
	target.linesHit += linesHit;
	target.functionsFound += functionsFound;
	target.functionsHit += functionsHit;
}

function inferPackageName(filePath: string): string {
	const relativePath = toRepoPath(filePath);
	const [scope, name] = relativePath.split('/', 3);
	if ((scope === 'packages' || scope === 'apps') && name) {
		return `${scope}/${name}`;
	}

	return '(root)';
}

function isCoverageTotals(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function toMetric(total: number, covered: number): Metric {
	return {
		total,
		covered,
		pct: total > 0 ? Number(((covered / total) * 100).toFixed(2)) : null
	};
}

function toMetricFromSummary(value: unknown): Metric | null {
	if (!value || typeof value !== 'object') {
		return null;
	}

	const total = Number((value as Record<string, unknown>).total);
	const covered = Number((value as Record<string, unknown>).covered);

	if (!Number.isFinite(total) || !Number.isFinite(covered)) {
		return null;
	}

	return toMetric(total, covered);
}

function printConsoleSummary(summary: SummaryPayload): void {
	console.log('Coverage summary');

	if (summary.unit) {
		console.log(
			`Unit: ${formatMetric(summary.unit.lines)} lines | ${formatMetric(summary.unit.functions)} functions`
		);
	} else {
		console.log(`Unit: missing ${toRepoPath(unitLcovPath)}`);
	}

	if (summary.browser) {
		console.log(
			`Browser: ${formatMetric(summary.browser.lines)} lines | ${formatMetric(summary.browser.functions)} functions | ${formatMetric(summary.browser.branches)} branches | ${formatMetric(summary.browser.statements)} statements`
		);
	} else {
		console.log(`Browser: missing ${toRepoPath(browserSummaryPath)}`);
	}

	if (summary.unit?.packages.length) {
		console.log('Unit packages:');
		for (const pkg of summary.unit.packages) {
			console.log(
				`  ${pkg.name}: ${formatMetric(pkg.lines)} lines | ${formatMetric(pkg.functions)} functions | ${pkg.files} files`
			);
		}
	}

	if (summary.missingArtifacts.length > 0) {
		console.log('Missing artifacts:');
		for (const artifact of summary.missingArtifacts) {
			console.log(`  ${artifact.label}: ${artifact.path}`);
		}
	}

	console.log(`Wrote ${summary.outputs.json}`);
	console.log(`Wrote ${summary.outputs.markdown}`);
}

function renderMarkdown(summary: SummaryPayload): string {
	const lines: string[] = [
		'# Coverage Summary',
		'',
		`Generated: ${summary.generatedAt}`,
		`Status: ${summary.status}`,
		'',
		'## Overall',
		'',
		'| Suite | Lines | Functions | Branches | Statements | Source |',
		'| --- | ---: | ---: | ---: | ---: | --- |',
		`| Unit | ${summary.unit ? formatMetric(summary.unit.lines) : 'missing'} | ${summary.unit ? formatMetric(summary.unit.functions) : 'missing'} | n/a | n/a | \`${toRepoPath(unitLcovPath)}\` |`,
		`| Browser | ${summary.browser ? formatMetric(summary.browser.lines) : 'missing'} | ${summary.browser ? formatMetric(summary.browser.functions) : 'missing'} | ${summary.browser ? formatMetric(summary.browser.branches) : 'missing'} | ${summary.browser ? formatMetric(summary.browser.statements) : 'missing'} | \`${toRepoPath(browserSummaryPath)}\` |`,
		'',
		`Browser HTML report: \`${toRepoPath(browserHtmlPath)}\``,
		''
	];

	if (summary.unit?.packages.length) {
		lines.push('## Unit Packages', '');
		lines.push('| Package | Lines | Functions | Files |');
		lines.push('| --- | ---: | ---: | ---: |');
		for (const pkg of summary.unit.packages) {
			lines.push(
				`| ${pkg.name} | ${formatMetric(pkg.lines)} | ${formatMetric(pkg.functions)} | ${pkg.files} |`
			);
		}
		lines.push('');
	}

	if (summary.missingArtifacts.length > 0) {
		lines.push('## Missing Artifacts', '');
		for (const artifact of summary.missingArtifacts) {
			lines.push(`- ${artifact.label}: \`${artifact.path}\``);
		}
		lines.push('');
	}

	return `${lines.join('\n')}\n`;
}

function formatMetric(metric: Metric | null): string {
	if (!metric || metric.pct === null) {
		return 'n/a';
	}

	return `${metric.pct.toFixed(2)}% (${metric.covered}/${metric.total})`;
}

function toRepoPath(targetPath: string): string {
	const relativePath = path.relative(root, targetPath).replaceAll(path.sep, '/');
	return relativePath.length > 0 && !relativePath.startsWith('..')
		? relativePath
		: targetPath.replaceAll(path.sep, '/');
}
