import { setTimeout as sleep } from 'node:timers/promises';

interface Runner {
	label: string;
	command: string[];
	updateCommand: string[];
	cwd?: string;
	env?: Record<string, string>;
}

interface Summary {
	label: string;
	meanMs: number;
	medianMs: number;
	minMs: number;
	maxMs: number;
}

const root = new URL('../', import.meta.url).pathname;
const baseURL = 'http://127.0.0.1:4173';
const targetPath = '/view/bench/visual';
const iterations = readPositiveInt('--iterations', 5);
const skipUpdate = process.argv.includes('--skip-update');

const docsServer = Bun.spawn(
	['bun', 'run', '--filter', '@dryui/docs', 'dev', '--', '--host', '127.0.0.1', '--port', '4173'],
	{
		cwd: root,
		env: process.env,
		stdin: 'ignore',
		stdout: 'ignore',
		stderr: 'inherit'
	}
);

const runners: Runner[] = [
	{
		label: 'Vitest browser + toMatchScreenshot',
		command: [
			'bunx',
			'vitest',
			'--browser',
			'--run',
			'tests/browser/visual-benchmark.browser.test.ts'
		],
		updateCommand: [
			'bunx',
			'vitest',
			'--browser',
			'--run',
			'tests/browser/visual-benchmark.browser.test.ts',
			'--update'
		]
	},
	{
		label: 'Playwright Test + toHaveScreenshot',
		command: [
			'bunx',
			'playwright',
			'test',
			'--config',
			'benchmarks/visual-checks/playwright.config.ts'
		],
		updateCommand: [
			'bunx',
			'playwright',
			'test',
			'--config',
			'benchmarks/visual-checks/playwright.config.ts',
			'--update-snapshots'
		],
		env: { BASE_URL: baseURL }
	},
	{
		label: 'Puppeteer + pixelmatch',
		command: ['bun', 'run', 'benchmarks/visual-checks/puppeteer/run.ts'],
		updateCommand: ['bun', 'run', 'benchmarks/visual-checks/puppeteer/run.ts', '--update'],
		env: { VISUAL_BENCHMARK_BASE_URL: `${baseURL}${targetPath}` }
	},
	{
		label: 'chromedp + Go pixel diff',
		command: ['go', 'run', '.'],
		updateCommand: ['go', 'run', '.', '--update'],
		cwd: `${root}benchmarks/visual-checks/chromedp`,
		env: { VISUAL_BENCHMARK_BASE_URL: `${baseURL}${targetPath}` }
	}
];

try {
	console.log(`Starting docs target at ${baseURL}${targetPath}`);
	await waitForServer();

	if (!skipUpdate) {
		console.log('\nRefreshing local baselines');
		for (const runner of runners) {
			await runChecked(runner.updateCommand, runner.label, runner.cwd, runner.env);
		}
	}

	const summaries: Summary[] = [];

	for (const runner of runners) {
		console.log(`\nBenchmarking ${runner.label}`);
		const samples: number[] = [];

		for (let index = 0; index < iterations; index += 1) {
			const start = performance.now();
			await runChecked(runner.command, runner.label, runner.cwd, runner.env);
			const elapsed = performance.now() - start;
			samples.push(elapsed);
			console.log(`  run ${index + 1}/${iterations}: ${formatMs(elapsed)}`);
		}

		summaries.push(summarize(runner.label, samples));
	}

	console.log('\nVisual benchmark summary');
	for (const summary of summaries) {
		console.log(
			`${summary.label}: median ${formatMs(summary.medianMs)}, mean ${formatMs(summary.meanMs)}, min ${formatMs(summary.minMs)}, max ${formatMs(summary.maxMs)}`
		);
	}
} finally {
	docsServer.kill();
	await docsServer.exited;
}

function readPositiveInt(flag: string, fallback: number): number {
	const index = process.argv.indexOf(flag);
	const raw = index >= 0 ? process.argv[index + 1] : undefined;
	const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
	return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function waitForServer(): Promise<void> {
	const timeoutAt = Date.now() + 60_000;

	while (Date.now() < timeoutAt) {
		if (docsServer.exitCode !== null) {
			throw new Error(`Docs server exited early with code ${docsServer.exitCode}.`);
		}

		try {
			const response = await fetch(`${baseURL}${targetPath}`);
			if (response.ok) {
				return;
			}
		} catch {
			// Server is still booting.
		}

		await sleep(500);
	}

	throw new Error(`Docs server did not become ready at ${baseURL}${targetPath} within 60s.`);
}

async function runChecked(
	command: string[],
	label: string,
	cwd: string | undefined,
	env?: Record<string, string>
): Promise<void> {
	const proc = Bun.spawn(command, {
		cwd: cwd ?? root,
		env: {
			...process.env,
			...env
		},
		stdin: 'ignore',
		stdout: 'pipe',
		stderr: 'pipe'
	});

	const [stdout, stderr, code] = await Promise.all([
		proc.stdout ? streamToString(proc.stdout) : Promise.resolve(''),
		proc.stderr ? streamToString(proc.stderr) : Promise.resolve(''),
		proc.exited
	]);

	if (code !== 0) {
		if (stdout.trim()) {
			console.error(stdout.trim());
		}
		if (stderr.trim()) {
			console.error(stderr.trim());
		}
		throw new Error(`${label} failed with exit code ${code}.`);
	}
}

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
	return await new Response(stream).text();
}

function summarize(label: string, samples: number[]): Summary {
	const sorted = [...samples].sort((left, right) => left - right);
	const middle = Math.floor(sorted.length / 2);
	const medianMs =
		sorted.length % 2 === 0 ? (sorted[middle - 1]! + sorted[middle]!) / 2 : sorted[middle]!;

	return {
		label,
		meanMs: samples.reduce((sum, sample) => sum + sample, 0) / samples.length,
		medianMs,
		minMs: sorted[0]!,
		maxMs: sorted[sorted.length - 1]!
	};
}

function formatMs(ms: number): string {
	return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
}
