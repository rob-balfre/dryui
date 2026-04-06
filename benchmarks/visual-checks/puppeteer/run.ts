import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { performance } from 'node:perf_hooks';

type RgbaFrame = {
	width: number;
	height: number;
	data: Uint8ClampedArray;
};

interface Options {
	readonly update: boolean;
	readonly baseUrl: string;
	readonly diffPath: string;
}

type EvaluationPage = {
	evaluate<T, A>(pageFunction: (arg: A) => T | Promise<T>, arg: A): Promise<T>;
	goto(url: string, options?: { waitUntil?: string }): Promise<unknown>;
	setViewport(options: { width: number; height: number; deviceScaleFactor: number }): Promise<void>;
	waitForSelector(selector: string, options?: { timeout?: number }): Promise<unknown>;
	$(
		selector: string
	): Promise<{ screenshot(options: { type: 'png' }): Promise<Uint8Array> } | null>;
};

const root = new URL('../../../', import.meta.url).pathname;
const benchmarkDir = join(root, 'benchmarks/visual-checks/puppeteer');
const baselinePath = join(benchmarkDir, 'baseline.png');
const actualPath = join(benchmarkDir, 'actual.png');
const diffPath = join(benchmarkDir, 'diff.png');

async function main(): Promise<void> {
	const options = parseOptions(process.argv.slice(2));
	const startedAt = performance.now();

	const [{ default: puppeteer }, { default: pixelmatch }] = await Promise.all([
		import('puppeteer'),
		import('pixelmatch')
	]);

	const browser = await puppeteer.launch({
		headless: 'new'
	});

	try {
		const page = (await browser.newPage()) as EvaluationPage;
		await page.setViewport({ width: 1440, height: 1400, deviceScaleFactor: 1 });
		const benchmarkUrl = new URL('/view/bench/visual', options.baseUrl).toString();
		await page.goto(benchmarkUrl, { waitUntil: 'networkidle0' });
		await page.waitForSelector('[data-benchmark-root]', { timeout: 15_000 });

		const target = await page.$('[data-benchmark-root]');
		if (!target) {
			throw new Error('Could not find [data-benchmark-root] on the benchmark page.');
		}

		const captureStartedAt = performance.now();
		const actual = await target.screenshot({ type: 'png' });
		const captureMs = performance.now() - captureStartedAt;

		await mkdir(dirname(actualPath), { recursive: true });
		await writeFile(actualPath, actual);

		if (options.update || !(await exists(baselinePath))) {
			await writeFile(baselinePath, actual);
			console.log(
				JSON.stringify(
					{
						baseline: baselinePath,
						actual: actualPath,
						diff: diffPath,
						updated: true,
						captureMs: round(captureMs),
						totalMs: round(performance.now() - startedAt)
					},
					null,
					2
				)
			);
			return;
		}

		const decodeStartedAt = performance.now();
		const [baseline, current] = await Promise.all([
			decodePng(page, await readFile(baselinePath)),
			decodePng(page, actual)
		]);
		const decodeMs = performance.now() - decodeStartedAt;

		if (baseline.width !== current.width || baseline.height !== current.height) {
			await writeFile(diffPath, actual);
			throw new Error(
				`Image dimensions changed from ${baseline.width}x${baseline.height} to ${current.width}x${current.height}.`
			);
		}

		const diff = new Uint8ClampedArray(baseline.data.length);
		const diffPixels = pixelmatch(
			baseline.data,
			current.data,
			diff,
			baseline.width,
			baseline.height,
			{
				threshold: 0.1
			}
		);

		if (diffPixels > 0) {
			const diffPng = await encodePng(page, diff, baseline.width, baseline.height);
			await writeFile(diffPath, diffPng);
			throw new Error(`Screenshot diff detected: ${diffPixels} pixels.`);
		}

		console.log(
			JSON.stringify(
				{
					baseline: baselinePath,
					actual: actualPath,
					diff: diffPath,
					diffPixels,
					captureMs: round(captureMs),
					decodeMs: round(decodeMs),
					totalMs: round(performance.now() - startedAt)
				},
				null,
				2
			)
		);
	} finally {
		await browser.close();
	}
}

function parseOptions(args: readonly string[]): Options {
	let update = false;
	let baseUrl =
		process.env.VISUAL_BENCHMARK_BASE_URL ??
		process.env.BASE_URL ??
		'http://127.0.0.1:4173/view/bench/visual';

	for (const arg of args) {
		if (arg === '--update' || arg === '-u') {
			update = true;
			continue;
		}

		if (arg.startsWith('--base-url=')) {
			baseUrl = arg.slice('--base-url='.length);
			continue;
		}

		throw new Error(`Unknown argument: ${arg}`);
	}

	return {
		update,
		baseUrl,
		diffPath
	};
}

async function exists(path: string): Promise<boolean> {
	try {
		await readFile(path);
		return true;
	} catch (error) {
		if (isNotFound(error)) return false;
		throw error;
	}
}

function isNotFound(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		(error as { code?: string }).code === 'ENOENT'
	);
}

async function decodePng(page: EvaluationPage, buffer: Uint8Array): Promise<RgbaFrame> {
	const base64 = Buffer.from(buffer).toString('base64');
	const frame = await page.evaluate(async (input: string) => {
		const image = new Image();
		image.decoding = 'async';
		image.src = `data:image/png;base64,${input}`;
		await image.decode();

		const canvas = document.createElement('canvas');
		canvas.width = image.naturalWidth;
		canvas.height = image.naturalHeight;

		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not create a 2d canvas context.');
		}

		context.drawImage(image, 0, 0);
		const pixels = context.getImageData(0, 0, canvas.width, canvas.height);

		return {
			width: canvas.width,
			height: canvas.height,
			data: Array.from(pixels.data)
		};
	}, base64);

	return {
		width: frame.width,
		height: frame.height,
		data: new Uint8ClampedArray(frame.data)
	};
}

async function encodePng(
	page: EvaluationPage,
	data: Uint8ClampedArray,
	width: number,
	height: number
): Promise<Uint8Array> {
	const base64 = await page.evaluate(
		({ data, width, height }) => {
			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;

			const context = canvas.getContext('2d');
			if (!context) {
				throw new Error('Could not create a 2d canvas context.');
			}

			context.putImageData(new ImageData(new Uint8ClampedArray(data), width, height), 0, 0);
			const url = canvas.toDataURL('image/png');
			const [, encoded = ''] = url.split(',');
			return encoded;
		},
		{ data: data.buffer, width, height }
	);

	return Buffer.from(base64, 'base64');
}

function round(value: number): number {
	return Math.round(value * 10) / 10;
}

await main().catch((error: unknown) => {
	const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
	console.error(message);
	process.exitCode = 1;
});
