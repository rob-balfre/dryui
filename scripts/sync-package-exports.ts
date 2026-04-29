import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type ExportLeaf = {
	types?: string;
	svelte?: string;
	default?: string;
};

type ExportTarget =
	| null
	| ExportLeaf
	| {
			development?: ExportLeaf;
			types?: string;
			svelte?: string;
			default?: string;
	  };

type PackageJson = {
	svelte?: string;
	exports?: Record<string, ExportTarget>;
	publishConfig?: {
		svelte?: string;
		exports?: Record<string, ExportTarget>;
		[key: string]: unknown;
	};
	[key: string]: unknown;
};

type PackageConfig = {
	label: string;
	barrelPath: string;
	packagePath: string;
};

const packageConfigs: PackageConfig[] = [
	{
		label: '@dryui/primitives',
		barrelPath: 'packages/primitives/src/index.ts',
		packagePath: 'packages/primitives/package.json'
	},
	{
		label: '@dryui/ui',
		barrelPath: 'packages/ui/src/index.ts',
		packagePath: 'packages/ui/package.json'
	}
];

const checkOnly = process.argv.includes('--check');

function parsePublicDirs(source: string): string[] {
	const dirs = new Set<string>();

	for (const match of source.matchAll(/from ['"]\.\/([\w-]+)\/index\.js['"]/g)) {
		const dir = match[1];
		if (dir) dirs.add(dir);
	}

	return [...dirs].sort((left, right) => left.localeCompare(right));
}

function createRootSrc(): ExportLeaf {
	return {
		types: './src/index.ts',
		svelte: './src/index.ts',
		default: './src/index.ts'
	};
}

function createRootDist(): ExportLeaf {
	return {
		types: './dist/index.d.ts',
		svelte: './dist/index.js',
		default: './dist/index.js'
	};
}

function createSubpathSrc(dir: string): ExportLeaf {
	return {
		types: `./src/${dir}/index.ts`,
		svelte: `./src/${dir}/index.ts`,
		default: `./src/${dir}/index.ts`
	};
}

function createSubpathDist(dir: string): ExportLeaf {
	return {
		types: `./dist/${dir}/index.d.ts`,
		svelte: `./dist/${dir}/index.js`,
		default: `./dist/${dir}/index.js`
	};
}

function createRootExport(target: 'src' | 'dist' | 'dual'): ExportTarget {
	if (target === 'src') return createRootSrc();
	if (target === 'dist') return createRootDist();
	return { development: createRootSrc(), ...createRootDist() };
}

function createSubpathExport(dir: string, target: 'src' | 'dist' | 'dual'): ExportTarget {
	if (target === 'src') return createSubpathSrc(dir);
	if (target === 'dist') return createSubpathDist(dir);
	return { development: createSubpathSrc(dir), ...createSubpathDist(dir) };
}

function collectExtraExports(
	exportsMap: Record<string, ExportTarget> | undefined
): Record<string, ExportTarget> {
	const extras: Record<string, ExportTarget> = {};

	for (const [key, value] of Object.entries(exportsMap ?? {})) {
		if (key === '.') continue;
		if (/^\.[/][a-z0-9-]+$/u.test(key)) continue;
		extras[key] = value;
	}

	return Object.fromEntries(
		Object.entries(extras).sort(([left], [right]) => left.localeCompare(right))
	);
}

function buildExports(
	dirs: string[],
	extras: Record<string, ExportTarget>,
	target: 'src' | 'dist' | 'dual'
): Record<string, ExportTarget> {
	const entries: Array<[string, ExportTarget]> = [['.', createRootExport(target)]];

	for (const dir of dirs) {
		entries.push([`./${dir}`, createSubpathExport(dir, target)]);
	}

	for (const [key, value] of Object.entries(extras)) {
		entries.push([key, value]);
	}

	return Object.fromEntries(entries);
}

async function syncPackageExports(config: PackageConfig): Promise<boolean> {
	const packagePath = resolve(process.cwd(), config.packagePath);
	const barrelPath = resolve(process.cwd(), config.barrelPath);
	const currentRaw = await readFile(packagePath, 'utf8');
	const barrelSource = await readFile(barrelPath, 'utf8');
	const packageJson = JSON.parse(currentRaw) as PackageJson;
	const sourceExtras = collectExtraExports(packageJson.exports);
	const distExtras = collectExtraExports(packageJson.publishConfig?.exports);
	const publicDirs = parsePublicDirs(barrelSource);
	const sourceRootExport = createRootSrc();
	const distRootExport = createRootDist();

	packageJson.exports = buildExports(publicDirs, sourceExtras, 'src');
	packageJson.svelte = sourceRootExport.svelte;
	packageJson.types = sourceRootExport.types;
	packageJson.publishConfig = {
		...packageJson.publishConfig,
		svelte: distRootExport.svelte,
		types: distRootExport.types,
		exports: buildExports(publicDirs, distExtras, 'dual')
	};

	const nextRaw = `${JSON.stringify(packageJson, null, 2)}\n`;
	if (nextRaw === currentRaw) {
		console.log(`${config.label}: exports already in sync`);
		return false;
	}

	if (checkOnly) {
		console.error(`${config.label}: package exports are out of sync with ${config.barrelPath}`);
		return true;
	}

	await writeFile(packagePath, nextRaw);
	console.log(`${config.label}: updated exports for ${publicDirs.length} public subpaths`);
	return true;
}

async function main(): Promise<void> {
	let hasChanges = false;

	for (const config of packageConfigs) {
		const changed = await syncPackageExports(config);
		hasChanges = changed || hasChanges;
	}

	if (checkOnly && hasChanges) {
		process.exitCode = 1;
	}
}

await main();
